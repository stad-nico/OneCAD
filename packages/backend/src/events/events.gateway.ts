import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { ModelUpdatePayload } from "@opentscad/types";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: true })
export class EventsGateway {
  @WebSocketServer()
  private readonly server!: Server;

  @SubscribeMessage("model:update")
  handleModelUpdate(@MessageBody() payload: ModelUpdatePayload): void {
    const { model } = payload;

    this.server.emit("model:updated", { model } satisfies ModelUpdatePayload);
  }

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
  }
}
