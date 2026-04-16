import { isModelMetadata, ModelMetadata } from './core/model-metadata';
import { isNode, Node } from './core/tree';

/**
 * Event emitted by the client to the server, meaning the place where the model files live.
 */
export enum ClientEvent {
  ModelUpdate = 'model:update',
}

/**
 * Payload for the {@link ClientEvent.ModelUpdate} event.
 */
export interface ClientModelUpdatePayload {
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
 * Type guard to narrow down to client model update payload.
 *
 * @param payload the object to check
 * @returns true if the object is a valid ClientModelUpdatePayload, false otherwise
 */
export function isClientModelUpdatePayload(payload: unknown): payload is ClientModelUpdatePayload {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const hasTreeRoot = 'treeRoot' in payload && isNode(payload.treeRoot);
  const hasMetadata = 'metadata' in payload && isModelMetadata(payload.metadata);

  return hasTreeRoot && hasMetadata;
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
export type ClientEventPayload<Event extends ClientEvent> = ClientEventPayloads[Event];
