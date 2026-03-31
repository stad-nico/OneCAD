import {
  ModelUpdatePayload,
  ModelDeletePayload,
  ProjectCreatePayload,
  ProjectDeletePayload,
  WorkerReadyPayload,
  WorkerErrorPayload,
  CompilationCompletePayload,
  CompilationErrorPayload
} from './payloads';

/**
 * Message types for WebSocket communication between clients, server, and frontend.
 * Uses string enum for external communication as per style guide.
 */
export enum MessageType {
  ModelUpdate = 'MODEL_UPDATE',
  ModelDelete = 'MODEL_DELETE',
  ProjectCreate = 'PROJECT_CREATE', 
  ProjectDelete = 'PROJECT_DELETE',
  WorkerReady = 'WORKER_READY',
  WorkerError = 'WORKER_ERROR',
  CompilationComplete = 'COMPILATION_COMPLETE',
  CompilationError = 'COMPILATION_ERROR'
}

/**
 * Base interface for all WebSocket messages in the OpenTSCAD protocol.
 * Provides type-safe communication between different system components.
 */
export interface BaseMessage {
  readonly type: MessageType;
  readonly timestamp: number;
  readonly messageId: string;
}

/**
 * Message for model updates containing project and model identification.
 */
export interface ModelUpdateMessage extends BaseMessage {
  readonly type: MessageType.ModelUpdate;
  readonly payload: ModelUpdatePayload;
}

/**
 * Message for model deletion requests.
 */
export interface ModelDeleteMessage extends BaseMessage {
  readonly type: MessageType.ModelDelete;
  readonly payload: ModelDeletePayload;
}

/**
 * Message for project creation requests.
 */
export interface ProjectCreateMessage extends BaseMessage {
  readonly type: MessageType.ProjectCreate;
  readonly payload: ProjectCreatePayload;
}

/**
 * Message for project deletion requests.
 */
export interface ProjectDeleteMessage extends BaseMessage {
  readonly type: MessageType.ProjectDelete;
  readonly payload: ProjectDeletePayload;
}

/**
 * Message indicating worker is ready to process operations.
 */
export interface WorkerReadyMessage extends BaseMessage {
  readonly type: MessageType.WorkerReady;
  readonly payload: WorkerReadyPayload;
}

/**
 * Message indicating worker encountered an error.
 */
export interface WorkerErrorMessage extends BaseMessage {
  readonly type: MessageType.WorkerError;
  readonly payload: WorkerErrorPayload;
}

/**
 * Message indicating model compilation completed successfully.
 */
export interface CompilationCompleteMessage extends BaseMessage {
  readonly type: MessageType.CompilationComplete;
  readonly payload: CompilationCompletePayload;
}

/**
 * Message indicating model compilation failed.
 */
export interface CompilationErrorMessage extends BaseMessage {
  readonly type: MessageType.CompilationError;
  readonly payload: CompilationErrorPayload;
}

/**
 * Union type of all possible WebSocket messages.
 */
export type WebSocketMessage = 
  | ModelUpdateMessage
  | ModelDeleteMessage
  | ProjectCreateMessage
  | ProjectDeleteMessage
  | WorkerReadyMessage
  | WorkerErrorMessage
  | CompilationCompleteMessage
  | CompilationErrorMessage;