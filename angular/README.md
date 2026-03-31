# OpenTSCAD Frontend Documentation

The OpenTSCAD frontend is a modern Angular application providing an intuitive interface for multi-project 3D CAD model management and visualization.

## Overview

The frontend architecture is built on Angular 18+ with standalone components, signals-based reactivity, and a comprehensive routing system that supports multi-project workflows.

```
angular/src/app/
├── main-view/              # Primary layout and navigation
├── model-visualizer/       # 3D rendering with Three.js
├── project-manager/        # Multi-project management
│   ├── project-list/       # Project browser and creation
│   └── model-list/         # Model browser within projects
├── app.routes.ts           # URL routing configuration
├── app.component.ts        # Root application component
└── app.config.ts          # Application configuration
```

## Architecture Principles

### 1. Standalone Components
All components are standalone, reducing bundle size and improving modularity:

```typescript
@Component({
  selector: 'app-project-manager',
  templateUrl: './project-manager.component.html',
  styleUrls: ['./project-manager.component.css'],
  imports: [CommonModule, FormsModule, ProjectListComponent, ModelListComponent]
})
export class ProjectManagerComponent {
  // Component implementation
}
```

### 2. Signals-Based Reactivity
Uses Angular's new signals for efficient, reactive state management:

```typescript
export class ProjectManagerComponent {
  readonly projects = signal<ProjectInfo[]>([]);
  readonly selectedProjectId = signal<string | null>(null);
  
  readonly selectedProject = computed(() => {
    const projectId = this.selectedProjectId();
    return this.projects().find(p => p.id === projectId) || null;
  });
}
```

### 3. Type-Safe Data Flow
Comprehensive TypeScript interfaces ensure type safety throughout:

```typescript
interface ProjectInfo {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly modelCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

interface ModelInfo {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly tags: string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}
```

## Component Architecture

### MainViewComponent

The primary layout component that orchestrates the entire interface:

```typescript
@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css'],
  imports: [CommonModule, ProjectManagerComponent, ModelVisualizerComponent]
})
export class MainViewComponent {
  readonly projectId = signal<string | null>(null);
  readonly modelId = signal<string | null>(null);
  readonly isProjectManagerVisible = signal(true);
  
  readonly currentView = computed(() => {
    // Returns 'model', 'project', or 'default' based on route params
  });
}
```

#### Key Features

- **Route-Aware Navigation**: Responds to URL changes and updates UI accordingly
- **Responsive Layout**: Collapsible project manager panel with smooth transitions
- **Breadcrumb Navigation**: Clear hierarchy showing current project and model
- **Overlay States**: Loading indicators and empty state messages

### ProjectManagerComponent

Central hub for project and model organization:

```typescript
export class ProjectManagerComponent {
  // State management
  readonly projects = signal<ProjectInfo[]>([]);
  readonly models = signal<ModelInfo[]>([]);
  readonly selectedProjectId = signal<string | null>(null);
  readonly selectedModelId = signal<string | null>(null);
  
  // Methods
  createProject(name: string, description?: string): void;
  deleteProject(projectId: string): void;
  addOrUpdateModel(modelInfo: Partial<ModelInfo>): void;
  removeModel(modelId: string, projectId: string): void;
}
```

#### Project Management Features

- **Create Projects**: Interactive form with validation
- **Delete Projects**: Confirmation dialog with cascade delete warning
- **Project Statistics**: Real-time counts of projects, models, and active project
- **Default Project**: Automatic "local" project for backward compatibility

## Development Workflow

### Local Development

```bash
# Start Angular development server
cd angular
npm run dev

# Server runs on http://localhost:4200 with hot reloading
```

### Building for Production

```bash
# Build optimized bundle
npm run build

# Output in dist/ directory ready for deployment
```

### Integration Testing

```bash
# Start full system (server + frontend + CLI)
# Terminal 1: Start main server
npm run dev

# Terminal 2: Start CLI client
cd my-project  
npx @opentscad/cli dev

# Test end-to-end workflow
```

For complete documentation including component details, routing system, performance optimizations, and testing strategies, see the [full frontend documentation](https://opentscad.dev/docs/frontend).
