import WebSocket from 'ws';
import { CompiledModel } from '../compiler/model-compiler.js';

/**
 * Message types for CLI-server communication.
 */
enum MessageType {
  ModelUpdate = 'MODEL_UPDATE',
  ModelDelete = 'MODEL_DELETE'
}

/**
 * WebSocket message interface.
 */
interface WebSocketMessage {
  readonly type: MessageType;
  readonly timestamp: number;
  readonly messageId: string;
  readonly payload: unknown;
}

/**
 * WebSocket client for connecting CLI to OpenTSCAD server.
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private readonly serverUrl: string;
  private readonly projectId: string;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;
  
  constructor(serverUrl: string, projectId: string) {
    this.serverUrl = serverUrl;
    this.projectId = projectId;
  }
  
  /**
   * Gets the project ID for this client.
   */
  getProjectId(): string {
    return this.projectId;
  }
  
  /**
   * Connects to the OpenTSCAD server.
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.serverUrl);
        
        this.ws.on('open', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });
        
        this.ws.on('error', (error) => {
          if (!this.isConnected) {
            reject(new Error(`WebSocket connection failed: ${error.message}`));
          } else {
            console.error('WebSocket error:', error);
          }
        });
        
        this.ws.on('close', () => {
          this.isConnected = false;
          this.attemptReconnect();
        });
        
        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString()) as WebSocketMessage;
            this.handleServerMessage(message);
          } catch (error) {
            console.error('Failed to parse server message:', error);
          }
        });
        
        // Connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Disconnects from the server.
   */
  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
  
  /**
   * Sends a model update to the server.
   */
  async sendModelUpdate(compiledModel: CompiledModel): Promise<void> {
    const message: WebSocketMessage = {
      type: MessageType.ModelUpdate,
      timestamp: Date.now(),
      messageId: this.generateMessageId(),
      payload: {
        projectId: this.projectId,
        modelId: compiledModel.metadata.id,
        compiledModel
      }
    };
    
    await this.sendMessage(message);
  }
  
  /**
   * Sends a model delete notification to the server.
   */
  async sendModelDelete(modelId: string): Promise<void> {
    const message: WebSocketMessage = {
      type: MessageType.ModelDelete,
      timestamp: Date.now(),
      messageId: this.generateMessageId(),
      payload: {
        projectId: this.projectId,
        modelId
      }
    };
    
    await this.sendMessage(message);
  }
  
  /**
   * Sends a message to the server.
   */
  private async sendMessage(message: WebSocketMessage): Promise<void> {
    if (!this.isConnected || !this.ws) {
      throw new Error('WebSocket not connected');
    }
    
    const messageStr = JSON.stringify(message);
    this.ws.send(messageStr);
  }
  
  /**
   * Handles messages received from the server.
   */
  private handleServerMessage(message: WebSocketMessage): void {
    // For now, just log received messages
    console.log('📨 Server message:', message.type);
  }
  
  /**
   * Generates a unique message ID.
   */
  private generateMessageId(): string {
    return `cli_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Attempts to reconnect to the server.
   */
  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = 1000 * this.reconnectAttempts; // Exponential backoff
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
    
    setTimeout(async () => {
      try {
        await this.connect();
        console.log('✅ Reconnected to server');
      } catch (error) {
        console.error('❌ Reconnection failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }, delay);
  }
}