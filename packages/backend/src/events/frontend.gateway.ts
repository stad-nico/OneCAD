import { Logger } from "@nestjs/common";
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
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

  private readonly cachedModels: Array<Model> = [];

  public cacheModel(model: Model): void {
    const existingIndex = this.cachedModels.findIndex((m) => m.id === model.id);
    if (existingIndex >= 0) {
      this.cachedModels[existingIndex] = model;
    } else {
      this.cachedModels.push(model);
    }
    this.logger.log(`Cached model: ${model.name} (${model.id})`);
  }

  @SubscribeMessage(FrontendEvent.ModelUpdate)
  handleModelUpdate(
    @MessageBody() message: FrontendEventMessage<FrontendEvent.ModelUpdate>,
  ): void {
    const { model } = message.payload;

    this.cachedModels.push(model);
  }

  handleConnection(client: Socket): void {
    this.logger.log(`[Frontend] connected: ${client.id}`);

    for (const model of this.cachedModels) {
      client.emit(FrontendEvent.ModelUpdate, {
        payload: { model },
        event: FrontendEvent.ModelUpdate,
      } satisfies FrontendEventMessage<FrontendEvent.ModelUpdate>);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`[Frontend] disconnected: ${client.id}`);
  }
}
