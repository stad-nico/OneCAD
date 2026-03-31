import { Model } from "./model";

/**
 * Event emitted by the client to the server, meaning the place where the model files live.
 */
export enum ClientEvent {
  ModelUpdate = "model:update",
}

export interface ClientModelUpdatePayload {
  model: Model;
}
