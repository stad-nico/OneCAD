import { WebSocketMessage, MessageType, isValidWebSocketMessage } from '../protocol';
import { ModelUpdateMessage as LegacyModelUpdateMessage, isWsRpcRequest, WsRpcRequest } from './index';

/**
 * Enhanced message handler that supports both legacy and new protocol messages.
 * This provides backward compatibility during the transition period.
 */
export class MessageHandler {
  
  /**
   * Processes incoming WebSocket messages, handling both legacy and new protocol formats.
   * 
   * @param rawMessage - Raw message data from WebSocket
   * @returns Processed message or null if invalid
   */
  static processIncomingMessage(rawMessage: string | Buffer): ProcessedMessage | null {
    try {
      const text = typeof rawMessage === 'string' ? rawMessage : rawMessage.toString('utf8');
      const parsed = JSON.parse(text) as unknown;
      
      // Check if it's a new protocol message
      if (isValidWebSocketMessage(parsed)) {
        return {
          type: 'protocol',
          message: parsed,
          projectId: this.extractProjectId(parsed),
          modelId: this.extractModelId(parsed)
        };
      }
      
      // Check if it's a legacy RPC request
      if (isWsRpcRequest(parsed)) {
        return {
          type: 'rpc',
          message: parsed,
          projectId: 'local', // Default project for legacy messages
          modelId: this.extractModelIdFromRpc(parsed)
        };
      }
      
      // Check if it's a legacy model update message
      if (this.isLegacyModelUpdateMessage(parsed)) {
        const legacy = parsed as LegacyModelUpdateMessage;
        return {
          type: 'legacy',
          message: legacy,
          projectId: 'local', // Default project for legacy messages
          modelId: legacy.file
        };
      }
      
      return null; // Unrecognized message format
      
    } catch (error) {
      console.error('Failed to process WebSocket message:', error);
      return null;
    }
  }
  
  /**
   * Converts legacy model update message to new protocol format.
   * 
   * @param legacy - Legacy model update message
   * @returns New protocol message
   */
  static convertLegacyToProtocol(legacy: LegacyModelUpdateMessage): WebSocketMessage {
    // This will be implemented when we have the full compiler integration
    // For now, return a placeholder structure
    return {
      type: MessageType.ModelUpdate,
      timestamp: Date.now(),
      messageId: `legacy_${Date.now()}`,
      payload: {
        projectId: 'local',
        modelId: legacy.file,
        compiledModel: {
          metadata: {
            id: legacy.file,
            projectId: 'local',
            name: legacy.file,
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
          },
          operations: [], // Will be filled by compiler
          serializedOperations: [], // Will be filled by compiler
          sourceHash: '' // Will be calculated by compiler
        }
      }
    };
  }
  
  /**
   * Extracts project ID from protocol message.
   */
  private static extractProjectId(message: WebSocketMessage): string {
    switch (message.type) {
      case MessageType.ModelUpdate:
      case MessageType.ModelDelete:
        return (message.payload as any).projectId || 'unknown';
      case MessageType.ProjectCreate:
      case MessageType.ProjectDelete:
        return (message.payload as any).projectId || 
               (message.payload as any).projectMetadata?.id || 'unknown';
      default:
        return 'system';
    }
  }
  
  /**
   * Extracts model ID from protocol message.
   */
  private static extractModelId(message: WebSocketMessage): string {
    switch (message.type) {
      case MessageType.ModelUpdate:
      case MessageType.ModelDelete:
        return (message.payload as any).modelId || 'unknown';
      case MessageType.CompilationComplete:
      case MessageType.CompilationError:
        return (message.payload as any).modelId || 'unknown';
      default:
        return 'unknown';
    }
  }
  
  /**
   * Extracts model ID from RPC request.
   */
  private static extractModelIdFromRpc(request: WsRpcRequest): string {
    if (request.payload && typeof request.payload === 'object' && 'file' in request.payload) {
      return (request.payload as any).file as string;
    }
    return 'unknown';
  }
  
  /**
   * Type guard for legacy model update messages.
   */
  private static isLegacyModelUpdateMessage(msg: unknown): msg is LegacyModelUpdateMessage {
    if (typeof msg !== 'object' || msg === null) {
      return false;
    }
    
    const record = msg as Record<string, unknown>;
    return record.type === 'MODEL_UPDATE' && 
           typeof record.file === 'string' && 
           typeof record.code === 'string';
  }
}

/**
 * Processed message with enhanced metadata.
 */
export interface ProcessedMessage {
  readonly type: 'protocol' | 'rpc' | 'legacy';
  readonly message: WebSocketMessage | WsRpcRequest | LegacyModelUpdateMessage;
  readonly projectId: string;
  readonly modelId: string;
}

/**
 * Message router for handling different types of processed messages.
 */
export class MessageRouter {
  private protocolHandlers = new Map<MessageType, ProtocolMessageHandler>();
  private rpcHandlers = new Map<string, RpcMessageHandler>();
  private legacyHandler: LegacyMessageHandler | null = null;
  
  /**
   * Registers a handler for protocol messages of a specific type.
   */
  registerProtocolHandler(type: MessageType, handler: ProtocolMessageHandler): void {
    this.protocolHandlers.set(type, handler);
  }
  
  /**
   * Registers a handler for RPC messages of a specific type.
   */
  registerRpcHandler(type: string, handler: RpcMessageHandler): void {
    this.rpcHandlers.set(type, handler);
  }
  
  /**
   * Registers a handler for legacy messages.
   */
  registerLegacyHandler(handler: LegacyMessageHandler): void {
    this.legacyHandler = handler;
  }
  
  /**
   * Routes a processed message to the appropriate handler.
   */
  async routeMessage(processed: ProcessedMessage): Promise<void> {
    try {
      switch (processed.type) {
        case 'protocol':
          const protocolMessage = processed.message as WebSocketMessage;
          const protocolHandler = this.protocolHandlers.get(protocolMessage.type);
          if (protocolHandler) {
            await protocolHandler(protocolMessage, processed.projectId, processed.modelId);
          }
          break;
          
        case 'rpc':
          const rpcMessage = processed.message as WsRpcRequest;
          const rpcHandler = this.rpcHandlers.get(rpcMessage.type);
          if (rpcHandler) {
            await rpcHandler(rpcMessage, processed.projectId, processed.modelId);
          }
          break;
          
        case 'legacy':
          if (this.legacyHandler) {
            const legacyMessage = processed.message as LegacyModelUpdateMessage;
            await this.legacyHandler(legacyMessage, processed.projectId, processed.modelId);
          }
          break;
      }
    } catch (error) {
      console.error('Error routing message:', error);
    }
  }
}

/**
 * Handler function for protocol messages.
 */
export type ProtocolMessageHandler = (
  message: WebSocketMessage, 
  projectId: string, 
  modelId: string
) => Promise<void>;

/**
 * Handler function for RPC messages.
 */
export type RpcMessageHandler = (
  message: WsRpcRequest, 
  projectId: string, 
  modelId: string
) => Promise<void>;

/**
 * Handler function for legacy messages.
 */
export type LegacyMessageHandler = (
  message: LegacyModelUpdateMessage, 
  projectId: string, 
  modelId: string
) => Promise<void>;