import { Logger } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import {
  ClientEvent,
  type ClientEventPayload,
  FrontendEvent,
  FrontendEventPayload,
} from "@opentscad/types";
import { Socket } from "socket.io";
import { ExposingIoAdapter } from "./exposing-io.adapter";

@WebSocketGateway({ namespace: "/client", cors: true })
export class ClientGateway {
  private readonly logger = new Logger(ClientGateway.name);

  @SubscribeMessage(ClientEvent.ModelUpdate)
  handleModelUpdate(
    @MessageBody() payload: ClientEventPayload<ClientEvent.ModelUpdate>,
    @ConnectedSocket() client: Socket,
  ): void {
    const { id, name, steps } = payload.model;

    this.logger.log(
      `Received ${ClientEvent.ModelUpdate} from ${client.id} for model ${name} (${id})`,
    );

    const server = ExposingIoAdapter.getServer();

    if (!server) {
      this.logger.error("[Client] Socket.IO server not ready");
      return;
    }

    server.of("/frontend").emit(FrontendEvent.ModelUpdate, {
      model: { id, name, steps },
    } satisfies FrontendEventPayload<FrontendEvent.ModelUpdate>);

    this.logger.debug(
      `Broadcasted ${FrontendEvent.ModelUpdate} from ${client.id} to frontend namespace`,
    );
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
