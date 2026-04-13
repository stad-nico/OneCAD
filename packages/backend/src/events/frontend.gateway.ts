import { Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from "@nestjs/websockets";
import {
  FrontendEvent,
  type FrontendEventMessage,
  Model,
} from "@opentscad/types";
import { Socket } from "socket.io";

@WebSocketGateway({ namespace: "/frontend", cors: true })
export class FrontendGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(FrontendGateway.name);

  /**
   * A cache of all models that have been recevied by any client so far.
   * This is needed to broadcast the current state of all models to new frontend
   * clients that connect in case they connect after the model event was recevied.
   */
  private readonly cachedModels: Map<string, Model> = new Map();

  public cacheModel(model: Model): void {
    this.cachedModels.set(model.id, model);
    this.logger.log(`Cached model: ${model.name} (${model.id})`);
  }

  public handleConnection(client: Socket): void {
    this.logger.log(`[Frontend] connected: ${client.id}`);

    for (const model of this.cachedModels.values()) {
      client.emit(FrontendEvent.ModelUpdate, {
        payload: { model },
        event: FrontendEvent.ModelUpdate,
      } satisfies FrontendEventMessage<FrontendEvent.ModelUpdate>);
    }
  }

  public handleDisconnect(client: Socket): void {
    this.logger.log(`[Frontend] disconnected: ${client.id}`);
  }
}
