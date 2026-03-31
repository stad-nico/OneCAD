/**
 * OpenTSCAD Protocol Layer
 * 
 * This module provides the communication protocol for multi-repository
 * OpenTSCAD architecture, enabling type-safe WebSocket communication
 * between clients, server, and frontend components.
 */

export * from './messages';
export * from './payloads';
export * from './serialization';
export * from './message-factory';

// Re-export commonly used types for convenience
export type { 
  ProjectId, 
  ModelId, 
  ModelMetadata, 
  ProjectMetadata, 
  CompiledModel 
} from './payloads';

export { 
  MessageType, 
  type WebSocketMessage,
  type ModelUpdateMessage,
  type ProjectCreateMessage 
} from './messages';

export { 
  serializeOperation,
  deserializeOperation,
  serializeOperationsToJSON,
  deserializeOperationsFromJSON 
} from './serialization';

export {
  createModelUpdateMessage,
  createProjectCreateMessage,
  isMessageType,
  isValidWebSocketMessage
} from './message-factory';