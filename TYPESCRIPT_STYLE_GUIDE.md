# OpenTSCAD TypeScript Style Guide

This document defines the coding standards and patterns for the OpenTSCAD project. All contributors must follow these guidelines to ensure consistent, maintainable code.

## Core Principles

1. **Type Safety First**: Avoid `any` type unless absolutely necessary (e.g., OpenCascade bindings workarounds)
2. **Explicit Over Implicit**: Prefer explicit type definitions over public APIs
3. **Consistency**: Follow established patterns within the codebase
4. **No Backwards Compatibility**: Prioritize clean architecture over backwards compatibility
5. **Clean Code**: Clear, readable code without unnecessary complexity

## Clean Code Practices

### Control Flow

**Never use inline if return - ALWAYS use brackets:**

```typescript
// ❌ Bad - inline if return
if (condition) return result;
if (error) throw new Error('Something went wrong');

// ✅ Good - always use brackets
if (condition) {
  return result;
}

if (error) {
  throw new Error('Something went wrong');
}

// ✅ Good - even for simple cases
if (isEmpty) {
  return [];
}

if (isValid) {
  processData();
}
```

### Array Type Definitions

**Always prefer Array<T> over T[]:**

```typescript
// ❌ Bad - bracket notation
const items: string[] = [];
const users: User[] = [];
const operations: Operation[] = [];

// ✅ Good - generic Array<T>
const items: Array<string> = [];
const users: Array<User> = [];
const operations: Array<Operation> = [];

// ✅ Good - in interfaces
interface ProjectData {
  readonly models: Array<ModelMetadata>;
  readonly operations: Array<Operation>;
  readonly tags: Array<string>;
}

// ✅ Good - in function parameters
function processItems(items: Array<Item>): Array<ProcessedItem> {
  return items.map(item => processItem(item));
}
```

### Comments and Documentation

**No comments inside functions (only if extremely necessary):**

```typescript
// ❌ Bad - unnecessary comments inside function
function calculateVolume(shape: Shape): number {
  // Get the operations from the shape
  const operations = shape.getOperations();
  
  // Initialize volume to zero
  let volume = 0;
  
  // Loop through each operation
  for (const operation of operations) {
    // Add the operation volume to total
    volume += getOperationVolume(operation);
  }
  
  // Return the calculated volume
  return volume;
}

// ✅ Good - clean function without internal comments
function calculateVolume(shape: Shape): number {
  const operations = shape.getOperations();
  let volume = 0;
  
  for (const operation of operations) {
    volume += getOperationVolume(operation);
  }
  
  return volume;
}

// ✅ Acceptable - extremely necessary technical explanation
function applyOpenCascadeWorkaround(mesh: TopoDS_Shape): TopoDS_Shape {
  // WORKAROUND: OpenCascade.js has a memory leak in version 2.0.0
  // when calling BRep_Tool.Triangulation multiple times
  // This manual cleanup prevents the leak until fixed upstream
  oc.Handle_Geom_Surface.delete();
  
  return processedMesh;
}
```

**Always comment every function with JSDoc:**

```typescript
/**
 * Adds two numbers together
 *
 * @param a - the first number
 * @param b - the second number
 */
function sum(a: number, b: number): number {
  return a + b;
}

/**
 * Processes a model file and returns compiled operations
 *
 * @param modelPath - path to the model file
 * @param config - compilation configuration
 */
function compileModel(
  modelPath: string, 
  config: CompilerConfig
): Promise<Array<Operation>> {
  // Implementation
}

/**
 * Creates a websocket connection to the visualization server
 *
 * @param url - websocket server url
 * @param projectId - unique project identifier
 * @param options - connection options
 */
function connectToServer(
  url: string,
  projectId: string,
  options?: ConnectionOptions
): WebSocketConnection {
  // Implementation
}

/**
 * Validates user input and returns sanitized data
 */
function validateInput(input: unknown): Maybe<ValidatedInput> {
  // Implementation
}

/**
 * Triangulates a 3d shape for rendering
 */
function triangulateShape(shape: Shape): TriangulationResult {
  // Implementation
}
```

**Comment style rules:**
- Comments never end with a dot
- Everything is lowercase in param descriptions
- Use `@param name - description` format
- Keep descriptions concise but clear
- No return description needed if obvious from function name and return type

### Visibility Modifiers

**Every class member must have explicit visibility:**

```typescript
// ❌ Bad - missing visibility modifiers
class ModelCompiler {
  config: CompilerConfig;
  cache = new Map();
  
  compile(model: Model) {
    return this.processModel(model);
  }
  
  processModel(model: Model) {
    // Implementation
  }
}

// ✅ Good - explicit visibility modifiers
class ModelCompiler {
  private readonly config: CompilerConfig;
  private readonly cache = new Map<string, CompiledModel>();
  
  public compile(model: Model): Promise<CompiledModel> {
    return this.processModel(model);
  }
  
  private processModel(model: Model): Promise<CompiledModel> {
    // Implementation
  }
}

// ✅ Good - use most restrictive visibility possible
class WebSocketManager {
  private readonly connections = new Map<string, WebSocketConnection>();
  private readonly eventEmitter = new EventEmitter();
  
  public connect(projectId: string): Promise<WebSocketConnection> {
    return this.establishConnection(projectId);
  }
  
  public disconnect(projectId: string): void {
    this.closeConnection(projectId);
  }
  
  protected onConnectionError(error: Error): void {
    this.handleError(error);
  }
  
  private establishConnection(projectId: string): Promise<WebSocketConnection> {
    // Implementation
  }
  
  private closeConnection(projectId: string): void {
    // Implementation  
  }
  
  private handleError(error: Error): void {
    // Implementation
  }
}
```

## Type Definitions

### Interfaces vs Types

**✅ Preferred: Interfaces for object shapes**
```typescript
interface ModelMetadata {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly createdAt: Date;
}

interface WebSocketMessage {
  readonly type: MessageType;
  readonly payload: unknown;
}

interface CompilerConfig {
  readonly timeoutMs: number;
  readonly enableCache: boolean;
  readonly debugMode: boolean;
  readonly maxMemoryMB: number;
}
```

**✅ Use types only for aliases and complex logic**
```typescript
type ProjectId = string;
type ModelCompilerResult = ModelMetadata & { operations: Operation[] };
type EventHandler<T> = (event: T) => void;
type SerializedOperation = Pick<Operation, 'type' | 'params'>;

// Complex conditional types
type OperationParams<T extends Operation> = T extends { type: 'BOX' } 
  ? BoxParams 
  : T extends { type: 'TRANSLATE' }
  ? TranslateParams
  : never;
```

**❌ Avoid: Type aliases for simple object shapes**
```typescript
// DON'T DO THIS
type ModelMetadata = {
  id: string;
  projectId: string;
};
```

## Enums

### String Enums for External Communication
Use string enums when values need to be serialized/transmitted:

```typescript
enum MessageType {
  ModelUpdate = 'MODEL_UPDATE',
  ModelDelete = 'MODEL_DELETE', 
  ProjectCreate = 'PROJECT_CREATE',
  WorkerReady = 'WORKER_READY',
  ErrorOccurred = 'ERROR_OCCURRED'
}

enum OperationType {
  Box = 'BOX',
  Translate = 'TRANSLATE',
  Rotate = 'ROTATE',
  Union = 'UNION',
  Difference = 'DIFFERENCE',
  Intersection = 'INTERSECTION'
}
```

### Numeric Enums for Internal Logic
Use numeric enums for internal state management:

```typescript
enum CompilerState {
  Idle,
  Compiling,
  Ready,
  Error,
  Disposed
}

enum WorkerStatus {
  Initializing,
  Ready,
  Processing,
  Crashed,
  Restarting
}
```

### String Literals - Limited Usage
**✅ String literals acceptable for simple UI cases:**
```typescript
type MeshColor = 'red' | 'blue' | 'green' | 'yellow'; // OK for frontend
type ButtonSize = 'small' | 'medium' | 'large'; // OK for UI components
```

**❌ Never use string literals for complex internal types:**
```typescript
// DON'T DO THIS
type MessageType = 'MODEL_UPDATE' | 'PROJECT_CREATE' | 'WORKER_READY';
```

## Error Handling

**✅ Use direct error throwing with descriptive messages:**

```typescript
function compileModel(source: string): CompiledModel {
  if (!source || !source.trim()) {
    throw new Error('Model source cannot be empty or whitespace only');
  }
  
  try {
    const ast = parseTypeScript(source);
    return transformToModel(ast);
  } catch (parseError) {
    throw new Error(`Model compilation failed: ${parseError.message}`);
  }
}
```

**✅ For async operations - always use try/catch:**
```typescript
async function loadModelFromServer(modelId: string): Promise<Model> {
  try {
    const response = await fetch(`/api/models/${modelId}`);
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (networkError) {
    throw new Error(`Failed to load model ${modelId}: ${networkError.message}`);
  }
}
```

## Async Patterns - Comprehensive Rules

### Sequential Operations (Dependencies)
```typescript
async function compileAndSaveModel(source: string, projectId: string): Promise<SavedModel> {
  let compiledModel: CompiledModel;
  
  try {
    compiledModel = await compileModelSource(source);
  } catch (error) {
    throw new Error(`Compilation failed: ${error.message}`);
  }
  
  try {
    await validateCompiledModel(compiledModel);
  } catch (error) {
    throw new Error(`Model validation failed: ${error.message}`);
  }
  
  try {
    const savedModel = await saveModelToProject(compiledModel, projectId);
    return savedModel;
  } catch (error) {
    throw new Error(`Failed to save model to project: ${error.message}`);
  }
}
```

### Parallel Operations (Independent)
```typescript
async function loadProjectData(projectId: string): Promise<ProjectData> {
  try {
    const [metadata, models, settings] = await Promise.all([
      loadProjectMetadata(projectId),
      loadProjectModels(projectId), 
      loadProjectSettings(projectId)
    ]);
    
    return { metadata, models, settings };
  } catch (error) {
    throw new Error(`Failed to load project data for ${projectId}: ${error.message}`);
  }
}
```

**❌ Never mix async/await with .then()/.catch():**
```typescript
// DON'T DO THIS
async function badMixedPattern() {
  const data = await loadData();
  return processData(data).then(result => result.value); // WRONG
}
```

## Function Patterns

### Arrow Functions - When to Use

**✅ Short utilities (1-3 lines):**
```typescript
const toUpperCase = (str: string): string => str.toUpperCase();
const isValidModel = (model: Model): boolean => model.operations.length > 0;

// Array operations
const validModels = models.filter(model => isValidModel(model));
const modelNames = models.map(model => model.name);
```

**✅ Event handlers and callbacks:**
```typescript
button.addEventListener('click', (event: MouseEvent) => {
  handleButtonClick(event);
});

websocket.addEventListener('message', (event: MessageEvent) => {
  processIncomingMessage(JSON.parse(event.data));
});
```

### Function Declarations - When to Use

**✅ Main business logic:**
```typescript
function compileModelToOperations(source: string, config: CompilerConfig): Operation[] {
  validateSourceCode(source);
  validateCompilerConfig(config);
  
  const ast = parseTypeScriptSource(source);
  const operations = transformASTToOperations(ast, config);
  return validateOperations(operations);
}
```

**✅ Public API functions:**
```typescript
export function createModelCompiler(config?: Partial<CompilerConfig>): ModelCompiler {
  const fullConfig = { ...createDefaultCompilerConfig(), ...config };
  validateCompilerConfig(fullConfig);
  return new ModelCompiler(fullConfig);
}
```

### Class Methods - When to Use

**✅ Stateful operations:**
```typescript
class ModelCompiler {
  private compilationCache = new Map<string, CompiledModel>();
  private isCompiling = false;
  
  async compile(source: string): Promise<CompiledModel> {
    if (this.isCompiling) {
      throw new Error('Compilation already in progress');
    }
    
    this.isCompiling = true;
    try {
      const compiled = await this.performCompilation(source);
      this.compilationCache.set(source, compiled);
      return compiled;
    } finally {
      this.isCompiling = false;
    }
  }
}
```

## Classes vs Functions

### Use Classes When:
- Managing related state that needs coordination
- Complex lifecycle management (initialization, cleanup)
- Multiple methods that operate on shared data

### Use Functions When:
- Pure transformations without state
- Utility operations
- Factory functions for object creation

## Maybe Pattern for Null Handling

**✅ Use Maybe<T> pattern instead of null unions:**

```typescript
// Define Maybe<T> as a simple type alias
type Maybe<T> = T | undefined;

// ❌ Bad - union with null
function findUser(id: string): User | null {
  return users.find(user => user.id === id) || null;
}

let selectedUser: User | null = null;
const userData: string | null = null;

// ✅ Good - Maybe<T> pattern  
function findUser(id: string): Maybe<User> {
  return users.find(user => user.id === id);
}

let selectedUser: Maybe<User> = undefined;
const userData: Maybe<string> = undefined;

// ✅ Good - usage with type guards
function processUser(maybeUser: Maybe<User>): void {
  if (maybeUser === undefined) {
    console.log('No user provided');
    return;
  }
  
  // maybeUser is now typed as User
  console.log(`Processing user: ${maybeUser.name}`);
}

// ✅ Good - with optional chaining
function getUserEmail(maybeUser: Maybe<User>): Maybe<string> {
  return maybeUser?.email;
}

// ✅ Good - with nullish coalescing
function getUserName(maybeUser: Maybe<User>): string {
  return maybeUser?.name ?? 'Anonymous';
}
```

**Benefits of Maybe<T>:**
- Consistent nullability pattern throughout codebase
- Better integration with modern JavaScript features (optional chaining, nullish coalescing)
- Clearer intent than `| null`
- Works naturally with Angular signals and reactive patterns

## Import/Export Patterns

### Default Exports
**✅ Single main class or function:**
```typescript
// model-compiler.ts
export default class ModelCompiler {
  // Implementation
}

// Usage
import ModelCompiler from './model-compiler';
```

### Named Exports  
**✅ Multiple related utilities:**
```typescript
// operations.ts
export interface Operation { /* */ }
export enum OperationType { /* */ }
export function createBoxOperation(): Operation { /* */ }
export function validateOperation(operation: Operation): void { /* */ }

// Usage
import { Operation, OperationType, createBoxOperation } from './operations';
```

### Namespace Imports
**✅ Large external libraries:**
```typescript
import * as OpenCascade from 'opencascade';
import * as THREE from 'three';

const box = new OpenCascade.BRepPrimAPI_MakeBox(10, 10, 10);
```

## Forbidden Patterns

### ❌ Never Use 'any' for Known Types
```typescript
// DON'T DO THIS
function handleMessage(message: any) { /* */ }

// DO THIS
interface WebSocketMessage {
  readonly type: MessageType;
  readonly payload: unknown;
}
function handleMessage(message: WebSocketMessage) { /* */ }
```

### ❌ Don't Mix Promise Patterns
```typescript
// DON'T DO THIS
async function badPattern() {
  const data = await loadData();
  return processData(data).then(result => result.value);
}

// DO THIS
async function goodPattern() {
  const data = await loadData();
  const processed = await processData(data);
  return processed.value;
}
```

## File Organization

### Naming Conventions
- **Files**: `kebab-case.ts` (e.g., `model-compiler.ts`)
- **Classes**: `PascalCase` (e.g., `ModelCompiler`)
- **Functions**: `camelCase` (e.g., `compileModel`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `DEFAULT_TIMEOUT`)
- **Interfaces**: `PascalCase` (e.g., `CompilerConfig`)
- **Enums**: `PascalCase` (e.g., `MessageType`)

### Directory Structure
```
core/
├── api/              # Public API definitions
├── compiler/         # Model compilation logic
├── protocol/         # Message protocols and types  
├── server/           # WebSocket server logic
└── worker/           # OpenCascade worker implementation
```

## Documentation Requirements

### Interface Documentation
```typescript
/**
 * Configuration for the model compiler.
 */
interface CompilerConfig {
  /** Maximum compilation time in milliseconds */
  readonly timeoutMs: number;
  
  /** Enable debug output during compilation */
  readonly debug: boolean;
}
```

### Function Documentation
```typescript
/**
 * Compiles TypeScript model source code into executable operations.
 * 
 * @param source - TypeScript source code for the model
 * @param config - Compiler configuration options
 * @returns Compiled model with operation list
 * @throws Error when compilation fails or source is invalid
 */
function compileModel(source: string, config: CompilerConfig): CompiledModel {
  // Implementation
}
```

## Enforcement

This style guide must be followed for all new code and when modifying existing code. Key enforcement:

- **TypeScript Strict Mode**: Enable all strict type checking
- **Code Reviews**: All code must be reviewed for compliance  
- **Documentation**: Public APIs must have JSDoc comments

**Key Reminders:**
- Type safety is non-negotiable
- Use `any` only for OpenCascade bindings workarounds
- Prefer interfaces over type aliases for objects
- Use string enums for external APIs, numeric for internal
- Always handle errors with try/catch and explicit throwing
- Use Maybe<T> pattern for nullable values
- Document all public APIs