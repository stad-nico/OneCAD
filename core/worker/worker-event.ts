import { OperationCall } from '../types/Operations';
import { TriangulationResult } from './triangulate';

export enum WorkerRequestType {
  Build = 'Build',
}

type WorkerRequestMapping = {
  [WorkerRequestType.Build]: {
    input: [operations: Array<OperationCall>];
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
  type: Type;

  id: string;

  data?: WorkerRequestData[Type];
};

export type WorkerResponse<Type extends WorkerRequestType = WorkerRequestType> = {
  type: Type;

  status: WorkerResponseStatus;

  id: string;

  response?: WorkerResponseData[Type];

  error?: string;
};

export enum WorkerResponseStatus {
  Success = 'success',
  Error = 'error',
}
