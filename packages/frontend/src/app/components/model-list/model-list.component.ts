import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ModelMetadata, Node } from '@opentscad/types';
import { EvaluationStep } from '../../../worker/types';
import { ModelEvaluationService } from '../../services/model-evaluation.service';
import { ErrorDisplayComponent } from '../common/error-display.component';
import { LoadingSkeletonComponent } from '../common/loading-skeleton.component';
import { ModelTreeComponent } from './model-tree.component';

interface ModelItem {
  metadata: ModelMetadata;
  treeNode: Node;
}

@Component({
  selector: 'app-model-list',
  standalone: true,
  imports: [CommonModule, ModelTreeComponent, LoadingSkeletonComponent, ErrorDisplayComponent],
  templateUrl: './model-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'block p-4 space-y-4 h-full w-96 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl overflow-y-auto',
  },
})
export class ModelListComponent {
  private readonly evaluationService = inject(ModelEvaluationService);

  /**
   * The currently available models.
   */
  public readonly models = input.required<ModelItem[]>();

  /**
   * The currently selected model (input from parent).
   */
  public readonly selectedModel = input<ModelItem | null>(null);

  /**
   * Emitted when a model is selected.
   */
  public readonly modelSelected = output<ModelItem>();

  /**
   * Emitted when a step is selected.
   */
  public readonly stepSelected = output<EvaluationStep>();

  /**
   * Internal state to track the currently evaluating model.
   */
  private readonly currentEvaluatingModel = signal<ModelItem | null>(null);

  /**
   * Loading state from evaluation service.
   */
  public readonly isLoading = computed(() => this.evaluationService.isLoading$());

  /**
   * Error state from evaluation service.
   */
  public readonly error = computed(() => this.evaluationService.error$());

  /**
   * Evaluation steps from evaluation service.
   */
  public readonly evaluationSteps = computed(() => this.evaluationService.evaluationSteps$());

  /**
   * Selected node from evaluation service.
   */
  public readonly selectedNode = computed(() => this.evaluationService.selectedNode$());

  /**
   * Compute whether we should show intermediate steps.
   */
  public readonly showIntermediateSteps = computed(() => {
    const model = this.currentEvaluatingModel();
    return model?.metadata.showIntermediateSteps ?? false;
  });

  /**
   * Handle model selection.
   */
  public async selectModel(model: ModelItem): Promise<void> {
    this.currentEvaluatingModel.set(model);
    this.modelSelected.emit(model);

    // Evaluate the model
    await this.evaluationService.evaluateModel(model.metadata.name, model.metadata, model.treeNode);
  }

  /**
   * Handle step selection.
   */
  public selectStep(step: EvaluationStep): void {
    this.evaluationService.selectStep(step);
    this.stepSelected.emit(step);
  }

  /**
   * Get the display name for a model.
   */
  public getModelName(model: ModelItem): string {
    return model.metadata.name;
  }

  /**
   * Get the description for a model.
   */
  public getModelDescription(model: ModelItem): string {
    return model.metadata.description || 'No description';
  }
}
