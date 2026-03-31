import { Injectable, signal } from '@angular/core';
import { Model } from '@opentscad/core';

declare global {
  interface ImportMetaHot {
    on(event: string, callback: (data: any) => void): void;
  }
  
  interface ImportMeta {
    hot?: ImportMetaHot;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ModelUpdateService {
  // Signal to hold the current model
  public readonly currentModel = signal<Model | null>(null);
  
  constructor() {
    this.setupHMRListener();
  }
  
  private setupHMRListener(): void {
    if (typeof window !== 'undefined' && (window as any).viteModules) {
      // Vite HMR is available
      if (import.meta.hot) {
        import.meta.hot.on('opentscad:model-update', (data: any) => {
          console.log('Received model update:', data);
          if (data.model) {
            this.currentModel.set(data.model);
          }
        });
      }
    }
    
    // Also listen for direct WebSocket messages
    this.setupDirectWebSocketListener();
  }
  
  private setupDirectWebSocketListener(): void {
    // Connect to the OpenTSCAD WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:5174');
    
    ws.onopen = () => {
      console.log('Connected to OpenTSCAD WebSocket');
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received WebSocket message:', message);
        
        if (message.type === 'custom' && message.event === 'opentscad:model-update') {
          if (message.data && message.data.model) {
            this.currentModel.set(message.data.model);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      // Attempt to reconnect after 2 seconds
      setTimeout(() => this.setupDirectWebSocketListener(), 2000);
    };
  }
}