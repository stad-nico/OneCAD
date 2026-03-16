import { Operation } from './Operation';

export type OperationCall<OperationType extends Operation> = {
  type: OperationType;

  parameters: unknown;
};
