import { MessageType, WebSocketMessage } from './messages';
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
 * Generates a unique message ID for WebSocket messages.
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates a model update message.
 * 
 * @param payload - The model update data
 * @returns Formatted WebSocket message
 */
export function createModelUpdateMessage(payload: ModelUpdatePayload): WebSocketMessage {
  return {
    type: MessageType.ModelUpdate,
    timestamp: Date.now(),
    messageId: generateMessageId(),
    payload
  };
}

/**
 * Creates a model delete message.
 * 
 * @param payload - The model delete data
 * @returns Formatted WebSocket message
 */
export function createModelDeleteMessage(payload: ModelDeletePayload): WebSocketMessage {
  return {
    type: MessageType.ModelDelete,
    timestamp: Date.now(),
    messageId: generateMessageId(),
    payload
  };
}

/**
 * Creates a project create message.
 * 
 * @param payload - The project creation data
 * @returns Formatted WebSocket message
 */
export function createProjectCreateMessage(payload: ProjectCreatePayload): WebSocketMessage {
  return {
    type: MessageType.ProjectCreate,
    timestamp: Date.now(),
    messageId: generateMessageId(),
    payload
  };
}

/**
 * Creates a project delete message.
 * 
 * @param payload - The project delete data
 * @returns Formatted WebSocket message
 */
export function createProjectDeleteMessage(payload: ProjectDeletePayload): WebSocketMessage {
  return {
    type: MessageType.ProjectDelete,
    timestamp: Date.now(),
    messageId: generateMessageId(),
    payload
  };
}

/**
 * Creates a worker ready message.
 * 
 * @param payload - The worker ready data
 * @returns Formatted WebSocket message
 */
export function createWorkerReadyMessage(payload: WorkerReadyPayload): WebSocketMessage {
  return {
    type: MessageType.WorkerReady,
    timestamp: Date.now(),
    messageId: generateMessageId(),
    payload
  };
}

/**
 * Creates a worker error message.
 * 
 * @param payload - The worker error data
 * @returns Formatted WebSocket message
 */
export function createWorkerErrorMessage(payload: WorkerErrorPayload): WebSocketMessage {
  return {
    type: MessageType.WorkerError,
    timestamp: Date.now(),
    messageId: generateMessageId(),
    payload
  };
}

/**
 * Creates a compilation complete message.
 * 
 * @param payload - The compilation complete data
 * @returns Formatted WebSocket message
 */
export function createCompilationCompleteMessage(payload: CompilationCompletePayload): WebSocketMessage {
  return {
    type: MessageType.CompilationComplete,
    timestamp: Date.now(),
    messageId: generateMessageId(),
    payload
  };
}

/**
 * Creates a compilation error message.
 * 
 * @param payload - The compilation error data
 * @returns Formatted WebSocket message
 */
export function createCompilationErrorMessage(payload: CompilationErrorPayload): WebSocketMessage {
  return {
    type: MessageType.CompilationError,
    timestamp: Date.now(),
    messageId: generateMessageId(),
    payload
  };
}

/**
 * Type guard to check if a message is of a specific type.
 * 
 * @param message - The message to check
 * @param type - The expected message type
 * @returns True if message matches the type
 */
export function isMessageType<T extends MessageType>(
  message: WebSocketMessage,
  type: T
): message is Extract<WebSocketMessage, { type: T }> {
  return message.type === type;
}

/**
 * Validates that an object is a valid WebSocket message.
 * 
 * @param obj - Object to validate
 * @returns True if object is a valid WebSocket message
 */
export function isValidWebSocketMessage(obj: unknown): obj is WebSocketMessage {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  const message = obj as Record<string, unknown>;
  
  // Check required base properties
  if (typeof message.type !== 'string' ||
      typeof message.timestamp !== 'number' ||
      typeof message.messageId !== 'string' ||
      !message.payload) {
    return false;
  }
  
  // Check if type is a valid MessageType
  return Object.values(MessageType).includes(message.type as MessageType);
}