import { Node } from '@opentscad/types';
import { TriangulationResult } from './triangulate';

/**
 * Type of message to send to the web worker or to expect in a response from the worker, determining the structure of the payload.
 */
export enum WorkerMessageType {
  /**
   * Message for evaluating a model.
   */
  EvaluateModel = 'EvaluateModel',

  /**
   * Message for initializing the worker, used to perform any necessary setup before processing other messages.
   */
  Initialize = 'Initialize',
}

/**
 * Represents a single step in the evaluation, which can be either a final shape or an intermediate step.
 */
export interface EvaluationStep {
  /**
   * Unique identifier for this step, typically matching the node id in the tree
   */
  id: string;

  /**
   * Human-readable name/label for this step
   */
  label: string;

  /**
   * The triangulated mesh for this step
   */
  triangulation: TriangulationResult;

  /**
   * The depth/level in the tree hierarchy (0 for root)
   */
  depth: number;
}

/**
 * Payload for a worker request message of type {@link WorkerMessageType.EvaluateModel}
 * containing the model tree to evaluate.
 */
interface WorkerRequestMessageEvaluateModelPayload {
  /**
   * The tree node representing the model to evaluate
   */
  node: Node;

  /**
   * Whether to generate and return intermediate evaluation steps
   */
  showIntermediateSteps: boolean;
}

/**
 * Payload for a worker response message of type {@link WorkerMessageType.EvaluateModel}
 * containing either a single final triangulation or multiple intermediate steps.
 */
interface WorkerResponseMessageEvaluateModelPayload {
  /**
   * The final shape triangulation (always present)
   */
  final: TriangulationResult;

  /**
   * Intermediate evaluation steps (empty if showIntermediateSteps is false)
   */
  steps: EvaluationStep[];
}

/**
 * Mapping of worker message types to their corresponding request and response payload types.
 */
interface WorkerMessageRequestResponsePayloadMapping {
  [WorkerMessageType.EvaluateModel]: {
    request: WorkerRequestMessageEvaluateModelPayload;
    response: WorkerResponseMessageEvaluateModelPayload;
  };

  [WorkerMessageType.Initialize]: {
    request: void;
    response: void;
  };
}

/**
 * Type helper to get the request payload type for a given worker message type
 */
export type WorkerRequestPayload<Type extends WorkerMessageType> = WorkerMessageRequestResponsePayloadMapping[Type]['request'];

/**
 * Type helper to get the response payload type for a given worker message type
 */
export type WorkerResponsePayload<Type extends WorkerMessageType> = WorkerMessageRequestResponsePayloadMapping[Type]['response'];

/**
 * Type representing a message sent to the worker - using a discriminated union derived from the mapping
 */
export type WorkerRequestMessage = {
  [Type in WorkerMessageType]: {
    /**
     * A unique identifier for the message, used to correlate requests and responses between the main thread and the worker.
     */
    id: string;

    /**
     * The type of the message, determining the structure of the payload.
     */
    type: Type;

    /**
     * The payload for the message, which depends on the type of message being sent.
     */
    payload: WorkerRequestPayload<Type>;
  };
}[WorkerMessageType];

/**
 * Type representing a response message from the worker - using a discriminated union derived from the mapping
 */
export type WorkerResponseMessage = {
  [Type in WorkerMessageType]: {
    /**
     * The unique identifier of the message this response corresponds to.
     */
    id: string;

    /**
     * The type of the message this response corresponds to.
     */
    type: Type;

    /**
     * The status of the response, indicating whether the operation was successful or resulted in an error.
     */
    status: 'success' | 'error';

    /**
     * The payload of the response, which depends on the type of message and the status.
     */
    payload: WorkerResponsePayload<Type>;
  };
}[WorkerMessageType];
