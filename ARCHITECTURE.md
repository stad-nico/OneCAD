# OpenTSCAD Multi-Repository Architecture

## Overview

OpenTSCAD has been redesigned with a **multi-repository architecture** that enables distributed 3D model development while maintaining a centralized visualization server. This architecture allows teams to work on separate model repositories while sharing a common visualization and compilation environment.

## Architecture Diagram

```
External Projects (Git Repos)
┌─────────────────────────────┐    ┌─────────────────────────────┐
│ Project A                   │    │ Project B                   │
│ ├── models/                 │    │ ├── components/             │
│ │   ├── part1.model.ts      │    │ │   ├── base.model.ts       │
│ │   └── assembly.model.ts   │    │ │   └── housing.model.ts    │
│ ├── opentscad.config.json   │    │ ├── opentscad.config.json   │
│ └── package.json            │    │ └── package.json            │
└─────────────────────────────┘    └─────────────────────────────┘
              │                                    │
              │ @opentscad/cli                    │ @opentscad/cli
              │ WebSocket                          │ WebSocket
              ▼                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    OpenTSCAD Server                                 │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐ │
│ │  Vite Plugin    │ │ Project Manager │ │    Model Compiler       │ │
│ │  Enhanced       │ │ Multi-project   │ │    TypeScript→Shape     │ │
│ │  Protocol       │ │ State & Cache   │ │    Caching & Pipeline   │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                  Message Router & Protocol                      │ │
│ │     Legacy RPC ←→ Enhanced Protocol ←→ WebSocket Clients        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
              │ HMR/WebSocket
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Frontend (Angular)                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐ │
│ │ Project Manager │ │    Routing      │ │   Model Visualizer      │ │
│ │ Multi-project   │ │ URL-based       │ │   Three.js + Worker     │ │
│ │ UI Components   │ │ Deep linking    │ │   OpenCascade.js        │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Core System (`/core/`)

The heart of OpenTSCAD containing shared utilities, protocols, and compilation logic.

### 2. CLI Package (`/packages/cli/`)

Standalone npm package enabling external projects to connect to the OpenTSCAD server.

### 3. Frontend (`/angular/`)

Modern Angular-based web interface with multi-project management and 3D visualization.

### 4. Vite Plugin (`vite-plugin-opentscad.ts`)

Enhanced development server integration supporting both legacy and new protocol formats.

## Core Principles

### Multi-Project Support

- **Project Isolation**: Each project maintains its own model namespace
- **Centralized Visualization**: Single server handles multiple project connections
- **State Management**: ProjectManager tracks projects, models, and compilation cache
- **Resource Optimization**: Shared compilation infrastructure with project-scoped caching

### Type-Safe Communication

- **Protocol Layer**: Structured WebSocket messages with TypeScript interfaces
- **Message Router**: Handles legacy RPC and new protocol formats seamlessly
- **Error Handling**: Comprehensive error propagation and recovery mechanisms
- **Serialization**: Consistent data transformation between client and server

### Developer Experience

- **Hot Module Replacement**: Live updates without OpenCascade reinitialization
- **CLI Simplicity**: Single commands for development workflow (`dev`, `build`, `init`)
- **TypeScript Integration**: Full IntelliSense and type checking for 3D models
- **Backward Compatibility**: Existing projects continue to work without changes

## Data Flow

### 1. Model Development Flow

```
Developer writes model.ts → CLI watches files → TypeScript compilation →
Model execution → Shape operations → WebSocket transmission →
Server processing → Frontend visualization
```

### 2. Multi-Project Flow

```
Project A: CLI connects → Server assigns project space → Models compiled →
Project B: CLI connects → Server assigns separate space → Models compiled →
Frontend: Shows both projects → User selects models → Visualization updates
```

### 3. Protocol Flow

```
Client Message → Message Handler → Protocol Detection →
Legacy RPC → Legacy Handler → Response
Enhanced Protocol → Router → Handler → Project Manager → Response
```

## File System Organization

### Repository Structure

```
OpenTSCAD/
├── core/                          # Core system components
│   ├── api/                       # Public API interfaces
│   ├── compiler/                  # Model compilation system
│   ├── network/                   # WebSocket & message handling
│   ├── protocol/                  # Communication protocol definitions
│   ├── server/                    # Server-side management
│   ├── shape/                     # Shape class and operations
│   ├── shared/                    # Utilities and common types
│   └── visualization/             # 3D rendering utilities
├── packages/
│   └── cli/                       # Standalone CLI package
│       ├── src/
│       │   ├── commands/          # CLI command implementations
│       │   ├── compiler/          # CLI-specific compilation
│       │   ├── utils/             # CLI utilities
│       │   └── websocket/         # Client WebSocket handling
│       ├── templates/             # Project templates
│       └── package.json           # CLI package definition
├── angular/                       # Frontend application
│   └── src/app/
│       ├── main-view/             # Primary layout component
│       ├── model-visualizer/      # 3D visualization
│       ├── project-manager/       # Multi-project UI
│       │   ├── project-list/      # Project management
│       │   └── model-list/        # Model browser
│       └── app.routes.ts          # URL routing configuration
├── vite-plugin-opentscad.ts       # Enhanced Vite plugin
├── TYPESCRIPT_STYLE_GUIDE.md      # Coding standards
└── package.json                   # Main package configuration
```

### External Project Structure

```
my-cad-project/
├── models/                        # TypeScript model files
│   ├── components/
│   │   ├── bolt.model.ts
│   │   └── bracket.model.ts
│   └── assemblies/
│       └── main-assembly.model.ts
├── opentscad.config.json          # Project configuration
├── package.json                   # Project dependencies
└── README.md                      # Project documentation
```

## Configuration System

### Server Configuration

```typescript
interface ProjectManagerConfig {
	maxProjects: number; // Maximum concurrent projects
	maxModelsPerProject: number; // Model limit per project
	projectTimeoutMs: number; // Project idle timeout
	enablePersistence: boolean; // Disk persistence support
}

interface CompilerConfig {
	timeoutMs: number; // Compilation timeout
	enableCache: boolean; // Enable result caching
	debugMode: boolean; // Debug output
	targetFormat: ESBuildTarget; // JavaScript target
	platform: ESBuildPlatform; // Compilation platform
}
```

### Project Configuration

```json
{
	"name": "My CAD Project",
	"description": "3D models for mechanical components",
	"server": {
		"host": "localhost",
		"port": 5174
	},
	"compiler": {
		"debugMode": false,
		"enableCache": true
	},
	"models": {
		"include": ["models/**/*.model.ts"],
		"exclude": ["**/node_modules/**"]
	}
}
```

## Technology Stack

### Core Technologies

- **TypeScript**: Type-safe model development and system implementation
- **Node.js**: Server runtime and CLI execution environment
- **ESBuild**: Fast TypeScript compilation and bundling
- **WebSockets**: Real-time bidirectional communication
- **OpenCascade.js**: 3D geometry kernel and operations

### Frontend Technologies

- **Angular 18+**: Modern framework with signals and standalone components
- **Three.js**: 3D rendering and scene management
- **Web Workers**: Isolated OpenCascade execution
- **Angular Router**: URL-based navigation and deep linking

### Development Tools

- **Vite**: Fast development server with HMR support
- **npm workspaces**: Monorepo package management
- **TypeScript Strict Mode**: Maximum type safety
- **ESLint**: Code quality and consistency

## Security Considerations

### Network Security

- WebSocket connections use configurable ports (default: 5174)
- No authentication required for development environment
- Production deployment should implement proper access controls

### Code Execution

- TypeScript models are compiled and executed in isolated contexts
- External dependencies are explicitly controlled via externals configuration
- Temporary files are cleaned up after compilation

### Resource Management

- Project and model limits prevent resource exhaustion
- Compilation timeouts prevent infinite loops
- Memory usage monitoring and cleanup mechanisms

## Performance Optimizations

### Compilation Caching

- Source code hash-based cache keys
- Project-scoped cache isolation
- Automatic cache eviction based on age and size limits
- Memory-based caching with optional disk persistence

### Network Optimization

- Efficient WebSocket message serialization
- Incremental model updates rather than full recompilation
- Protocol-level compression and batching support

### Frontend Performance

- Angular signals for reactive state management
- Component lazy loading and code splitting
- Three.js scene optimization and memory management
- Worker-based OpenCascade to prevent UI blocking

## Extensibility Points

### Custom Protocols

- Message router supports new protocol types
- Handler registration for custom message formats
- Pluggable serialization and transformation layers

### Compiler Extensions

- Custom ESBuild plugins for specialized model formats
- Configurable external dependencies and imports
- Post-processing hooks for generated models

### Frontend Customization

- Component-based architecture with clear boundaries
- Angular dependency injection for service replacement
- CSS custom properties for theming support

This architecture enables scalable, maintainable, and performant 3D CAD development workflows while preserving the simplicity and power of the original OpenTSCAD vision.
