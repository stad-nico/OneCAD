import { Model } from "./model";

/**
 * Event emitted to the frontend by the server
 */
export enum FrontendEvent {
  ModelUpdate = "model:update",
}

/**
 * Payload for the {@link FrontendEvent.ModelUpdate} event.
 */
interface FrontendModelUpdatePayload {
  /**
   * The full model data, including its ID, name, and the sequence of steps to construct it.
   */
  model: Model;
}

/**
 * Mapping of frontend events to their payload types.
 */
interface FrontendEventPayloads {
  [FrontendEvent.ModelUpdate]: FrontendModelUpdatePayload;
}

/**
 * Type helper to get the payload type for a given frontend event.
 */
export type FrontendEventPayload<Event extends FrontendEvent> =
  FrontendEventPayloads[Event];
