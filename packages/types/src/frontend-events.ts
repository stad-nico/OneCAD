import { Model } from "./model";

/**
 * Event emitted to the frontend by the server
 */
export enum FrontendEvent {
  ModelUpdate = "model:update",
}

export interface FrontendModelUpdatePayload {
  model: Model;
}
