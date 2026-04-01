import { Logger } from "@nestjs/common";
import { WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";

@WebSocketGateway({ namespace: "/frontend", cors: true })
export class FrontendGateway {
  private readonly logger = new Logger(FrontendGateway.name);

  handleConnection(client: Socket): void {
    this.logger.log(`[Frontend] connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`[Frontend] disconnected: ${client.id}`);
  }
}
