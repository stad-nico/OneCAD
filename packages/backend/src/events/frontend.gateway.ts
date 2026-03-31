import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import {
  FrontendEvent,
  type FrontendModelUpdatePayload,
} from "@opentscad/types";
import { Socket } from "socket.io";

@WebSocketGateway({ namespace: "/frontend", cors: true })
export class FrontendGateway {
  @SubscribeMessage(FrontendEvent.ModelUpdate)
  handleModelUpdate(
    @MessageBody() payload: FrontendModelUpdatePayload,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(
      `[Frontend] model:update from ${client.id}: ${payload.model.name} (${payload.model.id})`,
    );
  }

  handleConnection(client: Socket): void {
    console.log(`[Frontend] connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`[Frontend] disconnected: ${client.id}`);
  }
}
