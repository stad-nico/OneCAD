import { AstAssemblyNode } from "@opentscad/types";

/**
 * Event emitted by the client to the server, meaning the place where the model files live.
 */
export enum ClientEvent {
  AssemblyUpdate = "assembly:update",
}

/**
 * Payload for the {@link ClientEvent.AssemblyUpdate} event.
 */
export interface ClientAssemblyUpdatePayload {
  /**
   * The full assembly data.
   */
  assembly: AstAssemblyNode;
}

/**
 * Mapping of client events to their payload types.
 */
interface ClientEventPayloads {
  [ClientEvent.AssemblyUpdate]: ClientAssemblyUpdatePayload;
}

/**
 * Type helper to get the payload type for a given client event.
 */
export type ClientEventPayload<Event extends ClientEvent> =
  ClientEventPayloads[Event];
