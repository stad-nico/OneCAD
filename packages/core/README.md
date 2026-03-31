# OpenTSCAD Core System Documentation

The core system provides the foundational components for OpenTSCAD's multi-repository architecture, including compilation, protocol handling, project management, and server infrastructure.

## Overview

The core system is organized into several key modules:

```
core/
├── api/                    # Public API and operations
├── compiler/              # Model compilation system
├── network/               # WebSocket communication 
├── protocol/              # Communication protocols
├── server/                # Server-side management
├── shape/                 # Shape class and operations
├── shared/                # Utilities and common types
└── visualization/         # 3D rendering utilities
```

## Core Components

### 1. Compilation System (`compiler/`)

The compilation system transforms TypeScript model files into executable Shape operations.

#### ModelCompiler

The main compilation class that handles the full pipeline:

```typescript
import { ModelCompiler } from '@opentscad/core/compiler';

const compiler = new ModelCompiler({
  targetFormat: ESBuildTarget.ESNext,
  platform: ESBuildPlatform.Node,
  enableCache: true,
  debugMode: false,
  timeoutMs: 30000,
  maxMemoryMB: 512
});

await compiler.initialize();

const result = await compiler.compile(
  sourceCode, 
  'project-id', 
  'model-id',
  'Model Name'
);
```

#### Key Features

- **Fast Compilation**: ESBuild-powered TypeScript → JavaScript transformation
- **Intelligent Caching**: SHA-256 source hash based cache keys with automatic eviction
- **Memory Management**: Configurable memory limits and timeout handling
- **Error Recovery**: Comprehensive error handling with detailed diagnostics
- **Project Isolation**: Cache and compilation context separated by project

#### Configuration Options

```typescript
interface CompilerConfig {
  timeoutMs: number;                // Compilation timeout (default: 30000)
  enableCache: boolean;             // Enable result caching (default: true)
  debugMode: boolean;               // Debug output (default: false)
  maxMemoryMB: number;             // Memory limit (default: 512)
  targetFormat: ESBuildTarget;      // JS target (default: ESNext)
  platform: ESBuildPlatform;       // Platform target (default: Node)
  externals: string[];              // External dependencies (default: ['three'])
}
```

### 2. Protocol System (`protocol/`)

Type-safe communication between clients, server, and frontend components.

#### Message Types

```typescript
enum MessageType {
  ModelUpdate = 'MODEL_UPDATE',
  ModelDelete = 'MODEL_DELETE', 
  ProjectCreate = 'PROJECT_CREATE',
  ProjectDelete = 'PROJECT_DELETE',
  WorkerReady = 'WORKER_READY',
  WorkerError = 'WORKER_ERROR',
  CompilationComplete = 'COMPILATION_COMPLETE',
  CompilationError = 'COMPILATION_ERROR'
}
```

#### Protocol Structure

Each message follows a consistent structure:

```typescript
interface BaseMessage {
  readonly type: MessageType;
  readonly timestamp: number;
  readonly messageId: string;
}

interface ModelUpdateMessage extends BaseMessage {
  readonly type: MessageType.ModelUpdate;
  readonly payload: ModelUpdatePayload;
}
```

#### Serialization

The protocol includes robust serialization for complex data types:

```typescript
// Serialize operations for transmission
const serializedOps = shape.operations.map(op => serializeOperation(op));

// Deserialize on receiving end
const operations = serializedOps.map(op => deserializeOperation(op));
```

### 3. Project Management (`server/`)

Multi-project state management and lifecycle handling.

#### ProjectManager

Central coordinator for multiple concurrent projects:

```typescript
import { ProjectManager } from '@opentscad/core/server';

const manager = new ProjectManager({
  maxProjects: 50,
  maxModelsPerProject: 1000,
  projectTimeoutMs: 12 * 60 * 60 * 1000, // 12 hours
  enablePersistence: false
});

// Create or update projects
const project = manager.createOrUpdateProject({
  id: 'my-project',
  name: 'My CAD Project',
  description: 'Custom mechanical components',
  createdAt: new Date(),
  updatedAt: new Date(),
  modelCount: 0
});

// Manage models within projects
manager.addOrUpdateModel('my-project', compiledModel);
const model = manager.getModel('my-project', 'bracket.model.ts');
```

#### Features

- **Project Isolation**: Each project maintains separate model namespace
- **Resource Management**: Configurable limits and automatic cleanup
- **Statistics**: Real-time project and model statistics
- **Lifecycle Management**: Automatic timeout and cleanup of inactive projects

### 4. Network Communication (`network/`)

WebSocket-based communication with message routing and protocol handling.

#### MessageHandler

Processes incoming WebSocket messages and routes them appropriately:

```typescript
import { MessageHandler } from '@opentscad/core/network';

const processed = MessageHandler.processIncomingMessage(rawMessage);

if (processed) {
  console.log('Project:', processed.projectId);
  console.log('Model:', processed.modelId);
  console.log('Type:', processed.type);
}
```

#### MessageRouter

Routes messages to appropriate handlers based on type:

```typescript
import { MessageRouter } from '@opentscad/core/network';

const router = new MessageRouter();

// Register handlers for different message types
router.registerProtocolHandler(MessageType.ModelUpdate, async (message, projectId, modelId) => {
  // Handle model update
});

router.registerRpcHandler('BUILD', async (request, projectId, modelId) => {
  // Handle legacy RPC request
});

router.registerLegacyHandler(async (message, projectId, modelId) => {
  // Handle legacy format
});

// Process messages
await router.routeMessage(processed);
```

### 5. Shape System (`shape/`)

Core geometric representation and operations.

#### Shape Class

The fundamental unit of 3D geometry in OpenTSCAD:

```typescript
import { Shape } from '@opentscad/core/shape';

// Shapes contain an array of operations
const shape = new Shape([
  { type: 'box', params: { width: 10, height: 10, depth: 10 } },
  { type: 'translate', params: { x: 0, y: 0, z: 5 } }
]);

// Operations are immutable - transformations return new shapes
const translatedShape = shape.translate(5, 5, 0);
const rotatedShape = shape.rotate(45, 0, 0);
```

#### Operation System

All 3D operations are represented as serializable data structures:

```typescript
interface OperationCall {
  readonly type: string;
  readonly params: Record<string, unknown>;
}

// Example operations
const boxOp: OperationCall = {
  type: 'box',
  params: { width: 10, height: 20, depth: 5 }
};

const translateOp: OperationCall = {
  type: 'translate', 
  params: { x: 10, y: 0, z: 0 }
};
```

### 6. Shared Utilities (`shared/`)

Common utilities used across the system.

#### Logger

Structured logging with configurable levels:

```typescript
import { Logger } from '@opentscad/core/shared';

Logger.info('Server started', { port: 5174 });
Logger.debug('Processing model', { projectId, modelId, operations: shape.operations.length });
Logger.warn('Project approaching model limit', { projectId, modelCount: 950, limit: 1000 });
Logger.error('Compilation failed', { error: error.message, projectId, modelId });
```

#### Types

Core TypeScript type definitions:

```typescript
// Type aliases for clarity
type ProjectId = string;
type ModelId = string; 

// Maybe type for nullable values
type Maybe<T> = T | undefined;

// Operation type definitions
interface OperationCall {
  readonly type: string;
  readonly params: Record<string, unknown>;
}
```

## Integration Points

### Vite Plugin Integration

The core system integrates with the Vite plugin through well-defined interfaces:

```typescript
// In vite-plugin-opentscad.ts
import { ProjectManager, ModelCompiler, MessageRouter } from '@opentscad/core';

const projectManager = new ProjectManager(config.projectManager);
const modelCompiler = new ModelCompiler(config.compiler);
const messageRouter = new MessageRouter();

// Register handlers
messageRouter.registerProtocolHandler(MessageType.ModelUpdate, async (message, projectId, modelId) => {
  const result = await modelCompiler.compile(sourceCode, projectId, modelId);
  projectManager.addOrUpdateModel(projectId, result.compiledModel);
  
  // Send to frontend via HMR
  devServer.ws.send(createHmrMessage(PluginEventType.ModelOperations, { model }));
});
```

### Frontend Integration

The core system communicates with the frontend through the protocol layer:

```typescript
// Frontend receives messages via Vite HMR
import.meta.hot?.on('MODEL_OPERATIONS', (payload) => {
  const { model } = payload;
  // Update 3D visualization
  updateVisualization(model);
});
```

### CLI Integration

The CLI package uses core utilities for consistency:

```typescript
// In CLI package
import { ModelCompiler, MessageFactory } from '@opentscad/core';

const compiler = new ModelCompiler(config);
const message = MessageFactory.createModelUpdate(projectId, modelId, compiledModel);

// Send to server
websocket.send(JSON.stringify(message));
```

## Performance Considerations

### Compilation Caching

The compilation system implements sophisticated caching:

- **Source Hash**: SHA-256 of TypeScript source code
- **Project Scoped**: Cache isolated per project 
- **Memory Management**: LRU eviction with configurable size limits
- **Persistence**: Optional disk-based cache for server restarts

### Memory Management

Resource usage is carefully managed:

- **Project Limits**: Configurable maximum projects and models per project
- **Timeout Cleanup**: Automatic cleanup of inactive projects
- **Compilation Limits**: Memory and time limits for model compilation
- **Cache Eviction**: Automatic cleanup of old cache entries

### Network Optimization

Communication is optimized for performance:

- **Incremental Updates**: Only changed models are recompiled
- **Efficient Serialization**: Structured data with minimal overhead
- **Protocol Versioning**: Backward compatibility with legacy clients
- **Compression**: WebSocket compression for large model data

## Error Handling

The core system implements comprehensive error handling:

### Compilation Errors

```typescript
try {
  const result = await compiler.compile(source, projectId, modelId);
} catch (error) {
  if (error instanceof CompilationError) {
    Logger.error('Model compilation failed', {
      projectId,
      modelId, 
      error: error.message,
      line: error.lineNumber,
      column: error.columnNumber
    });
  }
}
```

### Network Errors

```typescript
socket.on('error', (error) => {
  Logger.error('WebSocket error', { 
    error: error.message,
    code: error.code 
  });
});
```

### Resource Errors

```typescript
try {
  projectManager.addOrUpdateModel(projectId, model);
} catch (error) {
  if (error.message.includes('limit')) {
    Logger.warn('Resource limit reached', { projectId, error: error.message });
  }
}
```

## Testing and Debugging

### Debug Mode

Enable detailed logging for development:

```typescript
const compiler = new ModelCompiler({
  debugMode: true,
  // ... other config
});

// Enables detailed compilation logging
Logger.debug('Compiling model', { projectId, modelId, sourceLines: source.split('\n').length });
```

### Statistics

Monitor system performance:

```typescript
const stats = projectManager.getStatistics();
console.log('Projects:', stats.totalProjects);
console.log('Models:', stats.totalModels);
console.log('Memory Usage:', stats.memoryUsageMB, 'MB');

const compilerStats = compiler.getCompilationStats();
console.log('Compilations:', compilerStats.totalCompilations);
console.log('Cache Hit Rate:', compilerStats.cacheHitRate);
```

This core system provides the robust foundation for OpenTSCAD's distributed architecture while maintaining simplicity and performance.