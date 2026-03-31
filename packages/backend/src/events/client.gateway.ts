import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import {
  ClientEvent,
  FrontendEvent,
  type ClientModelUpdatePayload,
  type FrontendModelUpdatePayload,
} from "@opentscad/types";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ namespace: "/client", cors: true })
export class ClientGateway {
  @WebSocketServer()
  private readonly server!: Server;

  @SubscribeMessage(ClientEvent.ModelUpdate)
  handleModelUpdate(@MessageBody() payload: ClientModelUpdatePayload): void {
    // For now, we just broadcast the model update to all frontend clients.
    // Later we may be want to do some post processing or storing the model in a database.
    this.server.of("/frontend").emit(FrontendEvent.ModelUpdate, {
      model: payload.model,
    } satisfies FrontendModelUpdatePayload);
  }

  handleConnection(client: Socket): void {
    console.log(`[Client] connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`[Client] disconnected: ${client.id}`);
  }
}
