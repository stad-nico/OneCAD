import { 
  ProjectId, 
  ModelId, 
  ProjectMetadata, 
  CompiledModel, 
  ModelMetadata 
} from '../protocol/payloads';
import { Maybe } from '../../shared/maybe';

/**
 * Represents a project containing multiple models.
 */
export interface Project {
  readonly metadata: ProjectMetadata;
  models: Map<ModelId, CompiledModel>;
  readonly createdAt: Date;
  readonly lastAccessedAt: Date;
}

/**
 * Statistics about project usage and performance.
 */
export interface ProjectStats {
  readonly totalProjects: number;
  readonly totalModels: number;
  readonly activeProjects: number;
  readonly memoryUsageMB: number;
  readonly oldestProject?: Date;
  readonly newestProject?: Date;
}

/**
 * Configuration for project management.
 */
export interface ProjectManagerConfig {
  readonly maxProjects: number;
  readonly maxModelsPerProject: number;
  readonly projectTimeoutMs: number;
  readonly enablePersistence: boolean;
  readonly persistenceDir?: string;
}

/**
 * Manages multiple OpenTSCAD projects with models, caching, and lifecycle management.
 */
export class ProjectManager {
  private projects = new Map<ProjectId, Project>();
  private readonly config: ProjectManagerConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;
  
  constructor(config: Partial<ProjectManagerConfig> = {}) {
    this.config = {
      maxProjects: 100,
      maxModelsPerProject: 1000,
      projectTimeoutMs: 24 * 60 * 60 * 1000, // 24 hours
      enablePersistence: false,
      ...config
    };
    
    // Start periodic cleanup
    this.startPeriodicCleanup();
  }
  
  /**
   * Creates a new project or updates existing project metadata.
   * 
   * @param projectMetadata - Project metadata
   * @returns The created or updated project
   * @throws Error when project limits are exceeded
   */
  createOrUpdateProject(projectMetadata: ProjectMetadata): Project {
    this.validateProjectLimits();
    
    const existingProject = this.projects.get(projectMetadata.id);
    
    if (existingProject) {
      // Update existing project metadata
      const updatedProject: Project = {
        ...existingProject,
        metadata: {
          ...projectMetadata,
          createdAt: existingProject.metadata.createdAt, // Preserve creation date
          updatedAt: new Date(),
          modelCount: existingProject.models.size
        },
        lastAccessedAt: new Date()
      };
      
      this.projects.set(projectMetadata.id, updatedProject);
      return updatedProject;
    } else {
      // Create new project
      const now = new Date();
      const project: Project = {
        metadata: {
          ...projectMetadata,
          createdAt: now,
          updatedAt: now,
          modelCount: 0
        },
        models: new Map<ModelId, CompiledModel>(),
        createdAt: now,
        lastAccessedAt: now
      };
      
      this.projects.set(projectMetadata.id, project);
      return project;
    }
  }
  
  /**
   * Gets a project by ID.
   * 
   * @param projectId - Project identifier
   * @returns Project if found, undefined otherwise
   */
  getProject(projectId: ProjectId): Maybe<Project> {
    const project = this.projects.get(projectId);
    
    if (project) {
      // Update last accessed time
      const updatedProject: Project = {
        ...project,
        lastAccessedAt: new Date()
      };
      this.projects.set(projectId, updatedProject);
      
      return updatedProject;
    }
    
    return undefined;
  }
  
  /**
   * Deletes a project and all its models.
   * 
   * @param projectId - Project identifier
   * @returns True if project was deleted, false if not found
   */
  deleteProject(projectId: ProjectId): boolean {
    return this.projects.delete(projectId);
  }
  
  /**
   * Lists all projects with optional filtering.
   * 
   * @param filter - Optional filter function
   * @returns Array of projects sorted by last accessed time (newest first)
   */
  listProjects(filter?: (project: Project) => boolean): Project[] {
    let projects = Array.from(this.projects.values());
    
    if (filter) {
      projects = projects.filter(filter);
    }
    
    return projects.sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime());
  }
  
  /**
   * Adds or updates a model in a project.
   * 
   * @param projectId - Project identifier
   * @param compiledModel - Compiled model to add/update
   * @throws Error when project not found or model limits exceeded
   */
  addOrUpdateModel(projectId: ProjectId, compiledModel: CompiledModel): void {
    const project = this.getProject(projectId);
    
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }
    
    // Check model limits
    if (!project.models.has(compiledModel.metadata.id) && 
        project.models.size >= this.config.maxModelsPerProject) {
      throw new Error(`Project ${projectId} has reached maximum model limit (${this.config.maxModelsPerProject})`);
    }
    
    // Add/update model
    project.models.set(compiledModel.metadata.id, compiledModel);
    
    // Update project metadata
    const updatedProject: Project = {
      ...project,
      metadata: {
        ...project.metadata,
        updatedAt: new Date(),
        modelCount: project.models.size
      },
      lastAccessedAt: new Date()
    };
    
    this.projects.set(projectId, updatedProject);
  }
  
  /**
   * Removes a model from a project.
   * 
   * @param projectId - Project identifier
   * @param modelId - Model identifier
   * @returns True if model was removed, false if not found
   */
  removeModel(projectId: ProjectId, modelId: ModelId): boolean {
    const project = this.getProject(projectId);
    
    if (!project) {
      return false;
    }
    
    const wasRemoved = project.models.delete(modelId);
    
    if (wasRemoved) {
      // Update project metadata
      const updatedProject: Project = {
        ...project,
        metadata: {
          ...project.metadata,
          updatedAt: new Date(),
          modelCount: project.models.size
        },
        lastAccessedAt: new Date()
      };
      
      this.projects.set(projectId, updatedProject);
    }
    
    return wasRemoved;
  }
  
  /**
   * Gets a specific model from a project.
   * 
   * @param projectId - Project identifier
   * @param modelId - Model identifier
   * @returns Model if found, undefined otherwise
   */
  getModel(projectId: ProjectId, modelId: ModelId): Maybe<CompiledModel> {
    const project = this.getProject(projectId);
    
    if (!project) {
      return undefined;
    }
    
    return project.models.get(modelId);
  }
  
  /**
   * Lists all models in a project.
   * 
   * @param projectId - Project identifier
   * @returns Array of models sorted by update time (newest first)
   */
  listModels(projectId: ProjectId): CompiledModel[] {
    const project = this.getProject(projectId);
    
    if (!project) {
      return [];
    }
    
    const models = Array.from(project.models.values());
    
    return models.sort((a, b) => 
      b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime()
    );
  }
  
  /**
   * Gets statistics about all projects.
   * 
   * @returns Current project statistics
   */
  getStatistics(): ProjectStats {
    const projects = Array.from(this.projects.values());
    const totalModels = projects.reduce((sum, project) => sum + project.models.size, 0);
    const activeProjects = projects.filter(p => 
      Date.now() - p.lastAccessedAt.getTime() < this.config.projectTimeoutMs
    ).length;
    
    const creationDates = projects.map(p => p.createdAt);
    const oldestProject = creationDates.length > 0 ? new Date(Math.min(...creationDates.map(d => d.getTime()))) : undefined;
    const newestProject = creationDates.length > 0 ? new Date(Math.max(...creationDates.map(d => d.getTime()))) : undefined;
    
    // Rough memory estimation (not precise)
    const memoryUsageMB = Math.round((projects.length * 0.1 + totalModels * 0.05) * 100) / 100;
    
    return {
      totalProjects: projects.length,
      totalModels,
      activeProjects,
      memoryUsageMB,
      oldestProject,
      newestProject
    };
  }
  
  /**
   * Cleans up inactive projects to free memory.
   * 
   * @param forceCleanup - Force cleanup regardless of timeout
   * @returns Number of projects cleaned up
   */
  cleanup(forceCleanup = false): number {
    const now = Date.now();
    let cleanedCount = 0;
    
    const projectEntries = Array.from(this.projects.entries());
    for (const [projectId, project] of projectEntries) {
      const isInactive = now - project.lastAccessedAt.getTime() > this.config.projectTimeoutMs;
      
      if (forceCleanup || isInactive) {
        this.projects.delete(projectId);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }
  
  /**
   * Disposes the project manager and cleans up resources.
   */
  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    this.projects.clear();
  }
  
  /**
   * Validates that project limits haven't been exceeded.
   */
  private validateProjectLimits(): void {
    if (this.projects.size >= this.config.maxProjects) {
      // Try cleanup first
      const cleanedCount = this.cleanup();
      
      if (cleanedCount === 0 && this.projects.size >= this.config.maxProjects) {
        throw new Error(`Maximum project limit reached (${this.config.maxProjects}). Consider increasing limits or cleaning up inactive projects.`);
      }
    }
  }
  
  /**
   * Starts periodic cleanup of inactive projects.
   */
  private startPeriodicCleanup(): void {
    const cleanupIntervalMs = Math.min(this.config.projectTimeoutMs / 4, 60 * 60 * 1000); // Every hour or quarter timeout
    
    this.cleanupTimer = setInterval(() => {
      const cleanedCount = this.cleanup();
      
      if (cleanedCount > 0) {
        console.log(`[ProjectManager] Cleaned up ${cleanedCount} inactive projects`);
      }
    }, cleanupIntervalMs);
  }
}