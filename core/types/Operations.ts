import { Operation, OperationParamsMap } from './Operation';

type OperationKey = keyof OperationParamsMap;

export type OperationCall = {
  [K in OperationKey]: {
    type: Extract<Operation, K>;
    parameters: OperationParamsMap[K];
  };
}[OperationKey];
