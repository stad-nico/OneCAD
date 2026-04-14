import { AstAssemblyNode } from "./ast";

/**
 * Event emitted to the frontend by the server
 */
export enum FrontendEvent {
  AssemblyUpdate = "assembly:update",
}

/**
 * Payload for the {@link FrontendEvent.AssemblyUpdate} event.
 */
interface FrontendAssemblyUpdatePayload {
  /**
   * The full assembly data.
   */
  assembly: AstAssemblyNode;
}

/**
 * Mapping of frontend events to their payload types.
 */
interface FrontendEventPayloads {
  [FrontendEvent.AssemblyUpdate]: FrontendAssemblyUpdatePayload;
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
