import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { FrontendEvent, ModelMetadata, Node, type FrontendEventMessage } from '@opentscad/types';
import { Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/frontend', cors: true })
export class FrontendGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(FrontendGateway.name);

  /**
   * A cache of all assemblies that have been recevied by any client so far.
   * This is needed to broadcast the current state of all assemblies to new frontend
   * clients that connect in case they connect after the assembly event was recevied.
   */
  private readonly cachedModels: Map<string, { treeRoot: Node; metadata: ModelMetadata }> = new Map();

  public cacheModel(model: { treeRoot: Node; metadata: ModelMetadata }): void {
    this.cachedModels.set(model.metadata.name, model);
    this.logger.log(`Cached model: ${model.metadata.name}`);
  }

  public handleConnection(client: Socket): void {
    this.logger.log(`[Frontend] connected: ${client.id}`);

    for (const model of this.cachedModels.values()) {
      client.emit(FrontendEvent.ModelUpdate, {
        payload: model,
        event: FrontendEvent.ModelUpdate,
      } satisfies FrontendEventMessage<FrontendEvent.ModelUpdate>);
    }
  }

  public handleDisconnect(client: Socket): void {
    this.logger.log(`[Frontend] disconnected: ${client.id}`);
  }
}
