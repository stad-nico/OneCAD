import { Logger } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import {
  ClientEvent,
  type ClientEventPayload,
  FrontendEvent,
  type FrontendEventMessage,
} from "@opentscad/types";
import { Socket } from "socket.io";
import { ExposingIoAdapter } from "./exposing-io.adapter";
import { FrontendGateway } from "./frontend.gateway";

@WebSocketGateway({ namespace: "/client", cors: true })
export class ClientGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ClientGateway.name);

  constructor(private readonly frontendGateway: FrontendGateway) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(ClientEvent.AssemblyUpdate)
  handleAssemblyUpdate(
    @MessageBody() payload: ClientEventPayload<ClientEvent.AssemblyUpdate>,
    @ConnectedSocket() client: Socket,
  ): void {
    const { assembly } = payload;

    this.logger.log(
      `Received ${ClientEvent.AssemblyUpdate} from ${client.id} for assembly ${assembly.name} (${assembly.id})`,
    );

    const server = ExposingIoAdapter.getServer();

    if (!server) {
      this.logger.error("[Client] Socket.IO server not ready");
      return;
    }

    server.of("/frontend").emit(FrontendEvent.AssemblyUpdate, {
      event: FrontendEvent.AssemblyUpdate,
      payload: { assembly },
    } satisfies FrontendEventMessage);

    this.frontendGateway.cacheAssembly(assembly);

    this.logger.debug(
      `Broadcasted ${FrontendEvent.AssemblyUpdate} from ${client.id} to frontend namespace`,
    );
  }
}
