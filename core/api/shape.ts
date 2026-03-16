import { Operation } from '../types/Operation';
import { OperationCall } from '../types/Operations';

export class Shape {
  public readonly operations: Array<OperationCall<Operation>>;

  public constructor(operations: Array<OperationCall<Operation>>) {
    this.operations = operations;
  }

  public translate(x: number, y: number, z: number): Shape {
    return new Shape([...this.operations, { type: Operation.Translate, parameters: { x, y, z } }]);
  }
}
