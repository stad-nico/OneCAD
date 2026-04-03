import { Step } from '@opentscad/types';

/**
 * Type of message to send to the web worker or to expect in a response from the worker, determining the structure of the payload.
 */
export enum WorkerMessageType {
  /**
   * Message for building a shape from a series of operations and triangulating it.
   */
  TriangulateMeshFromSteps = 'TriangulateMeshFromSteps',

  /**
   * Message for initializing the worker, used to perform any necessary setup before processing other messages.
   */
  Initialize = 'Initialize',
}

/**
 * Payload for a worker  message of type {@link WorkerMessageType.TriangulateMeshFromSteps}
 * containing the sequence of steps to construct the shape to be triangulated.
 */
interface WorkerRequestMessageTriangulateMeshFromStepsPayload {
  /**
   * The sequence of steps to construct the shape to be triangulated.
   */
  steps: Array<Step>;
}

/**
 * Payload for a worker response message of type {@link WorkerMessageType.TriangulateMeshFromSteps}
 * containing the triangulation result of the shape constructed from the provided steps.
 */
interface WorkerResponseMessageTriangulateMeshFromStepsPayload {
  /**
   * The triangulation result
   */
  triangulation: {
    /**
     * The vertices of the mesh
     */
    vertices: Float32Array;

    /**
     * The normals of the mesh
     */
    normals: Float32Array;

    /**
     * The indices of the mesh
     */
    indices: Uint32Array;
  };
}

/**
 * Mapping of worker message types to their corresponding request and response payload types.
 */
interface WorkerMessageRequestResponsePayloadMapping {
  [WorkerMessageType.TriangulateMeshFromSteps]: {
    request: WorkerRequestMessageTriangulateMeshFromStepsPayload;
    response: WorkerResponseMessageTriangulateMeshFromStepsPayload;
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
 * Type representing a message sent to the worker
 */
export type WorkerRequestMessage<Type extends WorkerMessageType = WorkerMessageType> = {
  /**
   * A unique identifier for the message, used to correlate requests and responses between the main thread and the worker.
   */
  id: string;

  /**
   * The type of the message, determining the structure of the payload.
   */
  type: WorkerMessageType;

  /**
   * The payload for the message, which depends on the type of message being sent.
   */
  payload: WorkerRequestPayload<Type>;
};

/**
 * Type representing a response message from the worker
 */
export type WorkerResponseMessage<Type extends WorkerMessageType = WorkerMessageType> = {
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
