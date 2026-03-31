import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ModelInfo } from '../project-manager.component';

type Maybe<T> = T | undefined;

/**
 * Event for model deletion.
 */
export interface ModelDeleteEvent {
	readonly modelId: string;
	readonly projectId: string;
}

/**
 * Component for displaying and managing models within a project.
 */
@Component({
	selector: 'app-model-list',
	templateUrl: './model-list.component.html',
	styleUrls: ['./model-list.component.css'],
	imports: [CommonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelListComponent {
	public readonly models = input<Array<ModelInfo>>([]);
	public readonly selectedModelId = input<Maybe<string>>(undefined);
	public readonly projectId = input.required<string>();

	public readonly modelSelected = output<string>();
	public readonly modelDeleted = output<ModelDeleteEvent>();

	public readonly formattedModels = computed(() => {
		return this.models().map(model => ({
			...model,
			formattedDate: this.formatDate(model.updatedAt),
			formattedTags: this.formatTags(model.tags),
			fileName: this.getFileName(model.id),
			fileExtension: this.getFileExtension(model.id),
		}));
	});

	/**
	 * Handles model selection.
	 */
	public selectModel(modelId: string): void {
		this.modelSelected.emit(modelId);
	}

	/**
	 * Deletes a model with confirmation.
	 */
	public deleteModel(event: Event, model: ModelInfo): void {
		event.stopPropagation(); // Prevent model selection

		const confirmMessage = `Are you sure you want to delete model "${model.name}"?`;

		if (confirm(confirmMessage)) {
			this.modelDeleted.emit({
				modelId: model.id,
				projectId: model.projectId,
			});
		}
	}

	/**
	 * TrackBy function for model list performance.
	 */
	public trackByModelId(index: number, model: ModelInfo): string {
		return `${model.projectId}_${model.id}`;
	}

	/**
	 * Formats a date for display.
	 */
	private formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date);
	}

	/**
	 * Formats tags for display.
	 */
	private formatTags(tags: Array<string>): string {
		if (tags.length === 0) {
			return '';
		}
		if (tags.length <= 2) {
			return tags.join(', ');
		}
		return `${tags.slice(0, 2).join(', ')} +${tags.length - 2}`;
	}

	/**
	 * Gets file extension from model ID for display.
	 */
	private getFileExtension(modelId: string): string {
		const lastDot = modelId.lastIndexOf('.');
		if (lastDot === -1) {
			return '';
		}
		return modelId.substring(lastDot);
	}

	/**
	 * Gets file name without extension for display.
	 */
	private getFileName(modelId: string): string {
		const lastDot = modelId.lastIndexOf('.');
		const lastSlash = Math.max(modelId.lastIndexOf('/'), modelId.lastIndexOf('\\'));

		let name = modelId;
		if (lastSlash !== -1) {
			name = name.substring(lastSlash + 1);
		}

		if (lastDot !== -1 && lastDot > lastSlash) {
			name = name.substring(0, lastDot - lastSlash - 1);
		}

		return name || modelId;
	}
}