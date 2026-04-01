import { Model } from "./model";

/**
 * Event emitted by the client to the server, meaning the place where the model files live.
 */
export enum ClientEvent {
  ModelUpdate = "model:update",
}

/**
 * Payload for the {@link ClientEvent.ModelUpdate} event.
 */
export interface ClientModelUpdatePayload {
  /**
   * The full model data, including its ID, name, and the sequence of steps to construct it.
   */
  model: Model;
}

/**
 * Mapping of client events to their payload types.
 */
interface ClientEventPayloads {
  [ClientEvent.ModelUpdate]: ClientModelUpdatePayload;
}

/**
 * Type helper to get the payload type for a given client event.
 */
export type ClientEventPayload<Event extends ClientEvent> =
  ClientEventPayloads[Event];
