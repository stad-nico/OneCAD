import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModelUpdateService } from '../services/model-update.service';
import { ModelListComponent } from './model-list/model-list.component';
import { ProjectListComponent } from './project-list/project-list.component';

type Maybe<T> = T | undefined;

/**
 * Project metadata interface for frontend use
 */
export interface ProjectInfo {
	readonly id: string;
	readonly name: string;
	readonly description: Maybe<string>;
	readonly modelCount: number;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

/**
 * Model metadata interface for frontend use
 */
export interface ModelInfo {
	readonly id: string;
	readonly projectId: string;
	readonly name: string;
	readonly tags: Array<string>;
	readonly createdAt: Date;
	readonly updatedAt: Date;
	readonly version: number;
}

/**
 * Main project manager component that handles project and model organization
 */
@Component({
	selector: 'app-project-manager',
	templateUrl: './project-manager.component.html',
	styleUrls: ['./project-manager.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, FormsModule, ProjectListComponent, ModelListComponent],
})
export class ProjectManagerComponent {
	// Injected services
	private readonly modelUpdateService = inject(ModelUpdateService);

	// State management
	public readonly projects = signal<Array<ProjectInfo>>([]);
	public readonly models = signal<Array<ModelInfo>>([]);
	public readonly selectedProjectId = signal<Maybe<string>>(undefined);
	public readonly selectedModelId = signal<Maybe<string>>(undefined);
	public readonly isProjectsViewOpen = signal(true);

	// Computed properties
	public readonly selectedProject = computed(() => {
		const projectId = this.selectedProjectId();
		if (!projectId) {
			return undefined;
		}
		return this.projects().find((p) => p.id === projectId);
	});

	public readonly selectedProjectModels = computed(() => {
		const projectId = this.selectedProjectId();
		if (!projectId) {
			return [];
		}
		return this.models().filter((m) => m.projectId === projectId);
	});

	public readonly selectedModel = computed(() => {
		const modelId = this.selectedModelId();
		if (!modelId) {
			return undefined;
		}
		return this.models().find((m) => m.id === modelId);
	});

	public readonly getProjectStats = computed(() => {
		const projects = this.projects();
		const models = this.models();

		return {
			totalProjects: projects.length,
			totalModels: models.length,
			modelsPerProject: projects.map((project) => ({
				projectId: project.id,
				modelCount: models.filter((m) => m.projectId === project.id).length,
			})),
		};
	});

	public readonly hasProjects = computed(() => this.projects().length > 0);
	public readonly hasModelsInSelectedProject = computed(() => this.selectedProjectModels().length > 0);

	public readonly projectStats = computed(() => ({
		totalProjects: this.projects().length,
		totalModels: this.models().length,
		activeProject: this.selectedProject()?.name || 'None',
	}));

	// Current model from update service
	public readonly currentModel = this.modelUpdateService.currentModel;

	public constructor() {
		this.initializeDefaultProject();

		// Listen for model updates and add them to the project
		effect(() => {
			const model = this.currentModel();
			if (model) {
				this.handleModelUpdate(model);
			}
		});
	}

	/**
	 * Handles incoming model updates from the WebSocket
	 */
	private handleModelUpdate(model: any): void {
		console.log('Project manager received model update:', model);

		// Extract filename from model ID to create a clean model name
		const modelId = model.id || 'unknown';
		const modelName = this.extractModelName(modelId);

		// Add model to the local project
		this.addOrUpdateModel({
			id: modelId,
			projectId: 'local',
			name: modelName,
			tags: ['auto-imported'],
			createdAt: new Date(),
			updatedAt: new Date(),
			version: 1,
		});

		// Auto-select the model
		this.selectedModelId.set(modelId);
	}

	/**
	 * Extracts a clean model name from the file path
	 */
	private extractModelName(filePath: string): string {
		const parts = filePath.split(/[/\\]/);
		const filename = parts[parts.length - 1];
		return filename.replace(/\.(model\.)?ts$/, '');
	}

	/**
	 * Handles project selection
	 */
	public onProjectSelected(projectId: string): void {
		this.selectedProjectId.set(projectId);
		this.selectedModelId.set(undefined); // Clear model selection when project changes
	}

	/**
	 * Handles model selection
	 */
	public onModelSelected(modelId: string): void {
		this.selectedModelId.set(modelId);
	}

	/**
	 * Toggles the projects panel visibility
	 */
	public toggleProjectsView(): void {
		this.isProjectsViewOpen.update((open) => !open);
	}

	/**
	 * Creates a new project
	 */
	public createProject(name: string, description?: string): void {
		const newProject: ProjectInfo = {
			id: `project-${Date.now()}`,
			name: name.trim(),
			description: description?.trim(),
			modelCount: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.projects.update((projects) => [...projects, newProject]);
		this.selectedProjectId.set(newProject.id);
	}

	/**
	 * Deletes a project and all its models
	 */
	public deleteProject(projectId: string): void {
		if (projectId === 'local') {
			// Don't allow deletion of default project
			return;
		}

		// Remove project
		this.projects.update((projects) => projects.filter((p) => p.id !== projectId));

		// Remove all models in the project
		this.models.update((models) => models.filter((m) => m.projectId !== projectId));

		// Update selection
		if (this.selectedProjectId() === projectId) {
			const remainingProjects = this.projects();
			this.selectedProjectId.set(remainingProjects.length > 0 ? remainingProjects[0].id : undefined);
			this.selectedModelId.set(undefined);
		}
	}

	/**
	 * Adds or updates a model in the current project
	 */
	public addOrUpdateModel(modelInfo: Partial<ModelInfo> & { id: string; projectId: string }): void {
		const projectId = modelInfo.projectId;
		const existingModelIndex = this.models().findIndex((m) => m.id === modelInfo.id && m.projectId === projectId);

		const modelData: ModelInfo = {
			id: modelInfo.id,
			projectId,
			name: modelInfo.name || modelInfo.id,
			tags: modelInfo.tags || [],
			createdAt: modelInfo.createdAt || new Date(),
			updatedAt: new Date(),
			version: modelInfo.version || 1,
		};

		if (existingModelIndex >= 0) {
			// Update existing model
			this.models.update((models) => {
				const updated = [...models];
				updated[existingModelIndex] = modelData;
				return updated;
			});
		} else {
			// Add new model
			this.models.update((models) => [...models, modelData]);

			// Update project model count
			this.updateProjectModelCount(projectId);
		}
	}

	/**
	 * Removes a model from its project
	 */
	public removeModel(modelId: string, projectId: string): void {
		this.models.update((models) => models.filter((m) => !(m.id === modelId && m.projectId === projectId)));

		// Update selection
		if (this.selectedModelId() === modelId) {
			this.selectedModelId.set(undefined);
		}

		// Update project model count
		this.updateProjectModelCount(projectId);
	}

	/**
	 * Initializes the default local project for legacy support
	 */
	private initializeDefaultProject(): void {
		const defaultProject: ProjectInfo = {
			id: 'local',
			name: 'Local Development',
			description: 'Default project for local models',
			modelCount: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.projects.set([defaultProject]);
		this.selectedProjectId.set('local');
	}

	/**
	 * Updates the model count for a project
	 */
	private updateProjectModelCount(projectId: string): void {
		const modelCount = this.models().filter((m) => m.projectId === projectId).length;

		this.projects.update((projects) =>
			projects.map((project) =>
				project.id === projectId ? { ...project, modelCount, updatedAt: new Date() } : project
			)
		);
	}
}
