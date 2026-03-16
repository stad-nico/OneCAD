import { TopoDS_Shape } from 'opencascade.js';

export enum WorkerRequestType {
  Initialize = 'Initialize',
  Box = 'Box',
  Triangulate = 'Triangulate',
}

type WorkerRequestMapping = {
  [WorkerRequestType.Initialize]: { input: []; output: void };
  [WorkerRequestType.Box]: {
    input: [width: number, height: number, depth: number];
    output: TopoDS_Shape;
  };
  [WorkerRequestType.Triangulate]: {
    input: [shape: TopoDS_Shape];
    output: {
      vertices: Float32Array<ArrayBuffer>;
      normals: Float32Array<ArrayBuffer>;
      indices: Uint32Array<ArrayBuffer>;
    };
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
