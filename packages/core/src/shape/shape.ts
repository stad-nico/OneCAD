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

	public union(other: Shape): Shape {
		// For now, return a new shape with combined operations
		// In a real implementation, this would need proper boolean operations
		return new Shape([...this.operations, ...other.operations]);
	}
}
