import { AstAssemblyNode } from '@opentscad/types';
import { TriangulationResult } from './triangulate';

/**
 * Type of message to send to the web worker or to expect in a response from the worker, determining the structure of the payload.
 */
export enum WorkerMessageType {
  /**
   * Message for evaluating an assembly.
   */
  EvaluateAssembly = 'EvaluateAssembly',

  /**
   * Message for initializing the worker, used to perform any necessary setup before processing other messages.
   */
  Initialize = 'Initialize',
}

/**
 * Payload for a worker request message of type {@link WorkerMessageType.EvaluateAssembly}
 * containing either a Solid or Assembly to be evaluated.
 */
interface WorkerRequestMessageEvaluateAssemblyPayload {
  /**
   * The assembly to evaluate
   */
  assembly: AstAssemblyNode;
}

/**
 * Payload for a worker response message of type {@link WorkerMessageType.EvaluateAssembly}
 * containing the resulting triangulation.
 */
interface WorkerResponseMessageEvaluateAssemblyPayload {
  /**
   * The resulting triangulation
   */
  triangulation: TriangulationResult;
}

/**
 * Mapping of worker message types to their corresponding request and response payload types.
 */
interface WorkerMessageRequestResponsePayloadMapping {
  [WorkerMessageType.EvaluateAssembly]: {
    request: WorkerRequestMessageEvaluateAssemblyPayload;
    response: WorkerResponseMessageEvaluateAssemblyPayload;
  };

  [WorkerMessageType.Initialize]: {
    request: void;
    response: void;
  };
}

/**
 * Type helper to get the request payload type for a given worker message type
 */
export type WorkerRequestPayload<Type extends WorkerMessageType> =
  WorkerMessageRequestResponsePayloadMapping[Type]['request'];

/**
 * Type helper to get the response payload type for a given worker message type
 */
export type WorkerResponsePayload<Type extends WorkerMessageType> =
  WorkerMessageRequestResponsePayloadMapping[Type]['response'];

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
