import { ModelMetadata } from "./core/model-metadata";
import { Node } from "./core/tree";

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
   * The root of the tree representing the model.
   */
  treeRoot: Node;

  /**
   * The metadata for the model, including name, description, and other relevant information.
   */
  metadata: ModelMetadata;
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
    /**
     * The type of event being emitted to the frontend, determining the structure of the payload.
     */
    event: Event;

    /**
     * The payload for the event, which depends on the type of event being emitted.
     */
    payload: FrontendEventPayload<Event>;
  };
