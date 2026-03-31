import { OperationCall } from '../shared/types/operations';
import { TriangulationResult } from './triangulate';

export enum WorkerRequestType {
	/**
	 * Request type for building a shape from a series of operations and triangulating it.
	 */
	Build = 'Build',
}

type WorkerRequestMapping = {
	[WorkerRequestType.Build]: {
		/**
		 * The input data for a Build request, which consists of an array of
		 * operation calls that define the shape to be built and triangulated.
		 */
		input: [operations: Array<OperationCall>];

		/**
		 * The output data for a Build request, which is the result of triangulating
		 * the shape defined by the input operations.
		 */
		output: TriangulationResult;
	};
};

export type WorkerRequestData = {
	[Type in WorkerRequestType]: WorkerRequestMapping[Type]['input'];
};

export type WorkerResponseData = {
	[Type in WorkerRequestType]: WorkerRequestMapping[Type]['output'];
};

export type WorkerRequest<Type extends WorkerRequestType = WorkerRequestType> = {
	/**
	 * Unique identifier for this request.
	 */
	id: string;

	/**
	 * The type of this request, which indicates the operation that the worker should perform.
	 */
	type: Type;

	/**
	 * Optional data to be passed to the worker for processing.
	 */
	data?: WorkerRequestData[Type];
};

export type WorkerResponse<Type extends WorkerRequestType = WorkerRequestType> = {
	/**
	 * The unique identifier of the request that this response corresponds to. This is needed for the main thread
	 * to match responses to their pending request when multiple requests are executed in parallel.
	 */
	id: string;

	/**
	 * The type of this response, which corresponds to the type of the request that triggered it.
	 * This allows the main thread to know how to handle the response data.
	 */
	type: Type;

	/**
	 * The status of the response, indicating whether the request was processed successfully or if an error occurred.
	 */
	status: WorkerResponseStatus;

	/**
	 * The actual response data.
	 */
	response?: WorkerResponseData[Type];

	/**
	 * Optional error message in case the request processing failed.
	 */
	error?: string;
};

export enum WorkerResponseStatus {
	Success = 'success',
	Error = 'error',
}
