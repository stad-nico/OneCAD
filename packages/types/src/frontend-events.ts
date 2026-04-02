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
type FrontendEventPayload<Event extends FrontendEvent> =
  FrontendEventPayloads[Event];

/**
 * Type representing a message sent to the frontend, containing the event type and its associated payload.
 */
export type FrontendEventMessage<Event extends FrontendEvent = FrontendEvent> =
  {
    event: Event;
  } & FrontendEventPayload<Event>;
