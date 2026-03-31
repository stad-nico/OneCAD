import { OperationCall } from '../shared/types/operations';
import { Operation, OperationParamsMap } from '../shared/types/operation';
import { SerializedOperation } from './payloads';

/**
 * Serializes an operation call to a format suitable for transmission.
 * 
 * @param operation - The operation to serialize
 * @returns Serialized operation data
 */
export function serializeOperation(operation: OperationCall): SerializedOperation {
  return {
    type: operation.type,
    params: operation.parameters as Record<string, unknown>
  };
}

/**
 * Deserializes operation data back to a typed operation call.
 * 
 * @param serialized - The serialized operation data
 * @returns Typed operation call
 * @throws Error when operation type is invalid or parameters are malformed
 */
export function deserializeOperation(serialized: SerializedOperation): OperationCall {
  const operationType = serialized.type as Operation;
  
  if (!Object.values(Operation).includes(operationType)) {
    throw new Error(`Invalid operation type: ${serialized.type}`);
  }
  
  // Validate parameters based on operation type
  const params = serialized.params;
  
  switch (operationType) {
    case Operation.Box:
      validateBoxParams(params);
      return {
        type: Operation.Box,
        parameters: params as OperationParamsMap[Operation.Box]
      };
      
    case Operation.Translate:
      validateTranslateParams(params);
      return {
        type: Operation.Translate,
        parameters: params as OperationParamsMap[Operation.Translate]
      };
      
    case Operation.Rotate:
    case Operation.Scale:
    case Operation.Union:
    case Operation.Difference:
    case Operation.Intersection:
    case Operation.Triangulate:
      // TODO: Add validation for other operation types as they are implemented
      return {
        type: operationType,
        parameters: params
      } as unknown as OperationCall;
      
    default:
      throw new Error(`Unsupported operation type: ${operationType}`);
  }
}

/**
 * Serializes an array of operations to JSON format.
 * 
 * @param operations - Array of operations to serialize
 * @param pretty - Whether to format JSON with indentation
 * @returns JSON string representation of operations
 */
export function serializeOperationsToJSON(operations: OperationCall[], pretty = false): string {
  const serialized = operations.map(op => serializeOperation(op));
  const indent = pretty ? 2 : 0;
  return JSON.stringify(serialized, null, indent);
}

/**
 * Deserializes operations from JSON format.
 * 
 * @param jsonString - JSON string containing serialized operations
 * @returns Array of typed operation calls
 * @throws Error when JSON is invalid or operations are malformed
 */
export function deserializeOperationsFromJSON(jsonString: string): OperationCall[] {
  let parsed: unknown;
  
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
    throw new Error(`Invalid JSON: ${errorMessage}`);
  }
  
  if (!Array.isArray(parsed)) {
    throw new Error('Operations JSON must be an array');
  }
  
  return parsed.map((item, index) => {
    try {
      return deserializeOperation(item as SerializedOperation);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown deserialization error';
      throw new Error(`Invalid operation at index ${index}: ${errorMessage}`);
    }
  });
}

/**
 * Validates parameters for box operation.
 */
function validateBoxParams(params: Record<string, unknown>): void {
  const { width, height, depth } = params;
  
  if (typeof width !== 'number' || width <= 0) {
    throw new Error('Box width must be a positive number');
  }
  
  if (typeof height !== 'number' || height <= 0) {
    throw new Error('Box height must be a positive number');
  }
  
  if (typeof depth !== 'number' || depth <= 0) {
    throw new Error('Box depth must be a positive number');
  }
}

/**
 * Validates parameters for translate operation.
 */
function validateTranslateParams(params: Record<string, unknown>): void {
  const { x, y, z } = params;
  
  if (typeof x !== 'number') {
    throw new Error('Translate X coordinate must be a number');
  }
  
  if (typeof y !== 'number') {
    throw new Error('Translate Y coordinate must be a number');
  }
  
  if (typeof z !== 'number') {
    throw new Error('Translate Z coordinate must be a number');
  }
}