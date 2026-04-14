import { Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from "@nestjs/websockets";
import {
  AstAssemblyNode,
  FrontendEvent,
  type FrontendEventMessage,
} from "@opentscad/types";
import { Socket } from "socket.io";

@WebSocketGateway({ namespace: "/frontend", cors: true })
export class FrontendGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(FrontendGateway.name);

  /**
   * A cache of all assemblies that have been recevied by any client so far.
   * This is needed to broadcast the current state of all assemblies to new frontend
   * clients that connect in case they connect after the assembly event was recevied.
   */
  private readonly cachedAssemblies: Map<string, AstAssemblyNode> = new Map();

  public cacheAssembly(assembly: AstAssemblyNode): void {
    this.cachedAssemblies.set(assembly.id, assembly);
    this.logger.log(`Cached assembly: ${assembly.name} (${assembly.id})`);
  }

  public handleConnection(client: Socket): void {
    this.logger.log(`[Frontend] connected: ${client.id}`);

    for (const assembly of this.cachedAssemblies.values()) {
      client.emit(FrontendEvent.AssemblyUpdate, {
        payload: { assembly },
        event: FrontendEvent.AssemblyUpdate,
      } satisfies FrontendEventMessage<FrontendEvent.AssemblyUpdate>);
    }
  }

  public handleDisconnect(client: Socket): void {
    this.logger.log(`[Frontend] disconnected: ${client.id}`);
  }
}
