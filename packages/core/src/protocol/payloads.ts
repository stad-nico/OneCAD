import { OperationCall } from '../shared/types/operations';

/**
 * Unique identifier for a project.
 */
export type ProjectId = string;

/**
 * Unique identifier for a model within a project.
 */
export type ModelId = string;

/**
 * Metadata about a model in the system.
 */
export interface ModelMetadata {
  readonly id: ModelId;
  readonly projectId: ProjectId;
  readonly name: string;
  readonly description?: string;
  readonly tags: string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}

/**
 * Metadata about a project in the system.
 */
export interface ProjectMetadata {
  readonly id: ProjectId;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly modelCount: number;
}

/**
 * Serialized operation data that can be transmitted over WebSocket.
 */
export interface SerializedOperation {
  readonly type: string;
  readonly params: Record<string, unknown>;
}

/**
 * Compiled model containing operations and metadata.
 */
export interface CompiledModel {
  readonly metadata: ModelMetadata;
  readonly operations: OperationCall[];
  readonly serializedOperations: SerializedOperation[];
  readonly sourceHash: string;
}

/**
 * Payload for model update messages.
 */
export interface ModelUpdatePayload {
  readonly projectId: ProjectId;
  readonly modelId: ModelId;
  readonly compiledModel: CompiledModel;
}

/**
 * Payload for model deletion messages.
 */
export interface ModelDeletePayload {
  readonly projectId: ProjectId;
  readonly modelId: ModelId;
}

/**
 * Payload for project creation messages.
 */
export interface ProjectCreatePayload {
  readonly projectMetadata: ProjectMetadata;
}

/**
 * Payload for project deletion messages.
 */
export interface ProjectDeletePayload {
  readonly projectId: ProjectId;
}

/**
 * Payload for worker ready messages.
 */
export interface WorkerReadyPayload {
  readonly workerId: string;
  readonly capabilities: string[];
  readonly version: string;
}

/**
 * Payload for worker error messages.
 */
export interface WorkerErrorPayload {
  readonly workerId: string;
  readonly error: string;
  readonly details?: Record<string, unknown>;
}

/**
 * Payload for compilation complete messages.
 */
export interface CompilationCompletePayload {
  readonly projectId: ProjectId;
  readonly modelId: ModelId;
  readonly compiledModel: CompiledModel;
  readonly compilationTimeMs: number;
}

/**
 * Payload for compilation error messages.
 */
export interface CompilationErrorPayload {
  readonly projectId: ProjectId;
  readonly modelId: ModelId;
  readonly error: string;
  readonly sourceCode?: string;
  readonly lineNumber?: number;
  readonly columnNumber?: number;
}