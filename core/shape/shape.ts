import { Operation } from '../shared/types/operation';
import { OperationCall } from '../shared/types/operations';

export class Shape {
	public readonly operations: Array<OperationCall>;

	public constructor(operations: Array<OperationCall>) {
		this.operations = operations;
	}

	public translate(x: number, y: number, z: number): Shape {
		return new Shape([...this.operations, { type: Operation.Translate, parameters: { x, y, z } }]);
	}
}
