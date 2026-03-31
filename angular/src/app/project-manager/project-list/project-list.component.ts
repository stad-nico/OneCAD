import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { ProjectInfo } from '../project-manager.component';

type Maybe<T> = T | undefined;

/**
 * Event for creating a new project.
 */
export interface ProjectCreateEvent {
	readonly name: string;
	readonly description: Maybe<string>;
}

/**
 * Component for displaying and managing the list of projects.
 */
@Component({
	selector: 'app-project-list',
	templateUrl: './project-list.component.html',
	styleUrls: ['./project-list.component.css'],
	imports: [CommonModule, FormsModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent {
	public readonly projects = input<Array<ProjectInfo>>([]);
	public readonly selectedProjectId = input<Maybe<string>>(undefined);

	public readonly projectSelected = output<string>();
	public readonly projectCreated = output<ProjectCreateEvent>();
	public readonly projectDeleted = output<string>();

	// Create project form state
	public readonly isCreateFormOpen = signal(false);
	public readonly newProjectName = signal('');
	public readonly newProjectDescription = signal('');
	public readonly isCreating = signal(false);

	public readonly formattedProjects = computed(() => {
		return this.projects().map(project => ({
			...project,
			formattedCreatedDate: this.formatDate(project.createdAt),
			formattedUpdatedDate: this.formatDate(project.updatedAt),
			shortDescription: this.getShortDescription(project.description),
		}));
	});

	/**
	 * Handles project selection.
	 */
	public selectProject(projectId: string): void {
		this.projectSelected.emit(projectId);
	}

	/**
	 * Opens the create project form.
	 */
	public openCreateForm(): void {
		this.isCreateFormOpen.set(true);
		this.newProjectName.set('');
		this.newProjectDescription.set('');
	}

	/**
	 * Cancels project creation.
	 */
	public cancelCreate(): void {
		this.isCreateFormOpen.set(false);
		this.newProjectName.set('');
		this.newProjectDescription.set('');
	}

	/**
	 * Creates a new project.
	 */
	public async createProject(): Promise<void> {
		const name = this.newProjectName().trim();

		if (!name) {
			return;
		}

		this.isCreating.set(true);

		try {
			this.projectCreated.emit({
				name,
				description: this.newProjectDescription().trim() || undefined,
			});

			// Reset form
			this.cancelCreate();
		} finally {
			this.isCreating.set(false);
		}
	}

	/**
	 * Deletes a project with confirmation.
	 */
	public deleteProject(event: Event, projectId: string): void {
		event.stopPropagation(); // Prevent project selection

		const project = this.projects().find(p => p.id === projectId);
		if (!project) {
			return;
		}

		if (projectId === 'local') {
			alert('Cannot delete the default local project.');
			return;
		}

		const confirmMessage = `Are you sure you want to delete project "${project.name}"?\n\nThis will also delete all models in the project.`;

		if (confirm(confirmMessage)) {
			this.projectDeleted.emit(projectId);
		}
	}

	/**
	 * TrackBy function for project list performance.
	 */
	public trackByProjectId(index: number, project: ProjectInfo): string {
		return project.id;
	}

	/**
	 * Formats a date for display.
	 */
	private formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		}).format(date);
	}

	/**
	 * Gets a short description for display.
	 */
	private getShortDescription(description: Maybe<string>): string {
		if (!description) {
			return '';
		}
		return description.length > 60 ? description.substring(0, 60) + '...' : description;
	}
}