import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ClientEvent, type ClientEventPayload, FrontendEvent, type FrontendEventMessage } from '@opentscad/types';
import { Socket } from 'socket.io';
import { ExposingIoAdapter } from './exposing-io.adapter';
import { FrontendGateway } from './frontend.gateway';

@WebSocketGateway({ namespace: '/client', cors: true })
export class ClientGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ClientGateway.name);

  constructor(private readonly frontendGateway: FrontendGateway) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(ClientEvent.ModelUpdate)
  handleModelUpdate(@MessageBody() payload: ClientEventPayload<ClientEvent.ModelUpdate>, @ConnectedSocket() client: Socket): void {
    this.logger.log(`Received ${ClientEvent.ModelUpdate} from ${client.id} for model ${payload.metadata.name}`);

    const server = ExposingIoAdapter.getServer();

    if (!server) {
      this.logger.error('[Client] Socket.IO server not ready');
      return;
    }

    server.of('/frontend').emit(FrontendEvent.ModelUpdate, { event: FrontendEvent.ModelUpdate, payload } satisfies FrontendEventMessage);

    this.frontendGateway.cacheModel(payload);

    this.logger.debug(`Broadcasted ${FrontendEvent.ModelUpdate} from ${client.id} to frontend namespace`);
  }
}
