import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ModelMetadata, Node } from '@opentscad/types';
import { ModelListComponent } from './components/model-list/model-list.component';
import { ModelVisualizerComponent } from './components/model-visualizer/model-visualizer.component';
import { ModelEvaluationService } from './services/model-evaluation.service';
import { ModelService } from './services/model.service';

interface ModelItem {
  metadata: ModelMetadata;
  treeNode: Node;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ModelListComponent, ModelVisualizerComponent],
  templateUrl: './app.component.html',
  host: {
    class: 'flex size-full',
  },
})
export class App {
  /**
   * The model service to get model data and react to model updates from the backend.
   */
  private readonly modelService = inject(ModelService);

  /**
   * The model evaluation service for triangulation and display management.
   */
  private readonly evaluationService = inject(ModelEvaluationService);

  /**
   * The available models from the backend.
   */
  public readonly models = this.modelService.models as any;

  /**
   * The selected model (tracked internally).
   */
  private readonly selectedModel = signal<ModelItem | null>(null);

  /**
   * The selected node from evaluation service.
   */
  public readonly selectedNode = this.evaluationService.selectedNode$;

  /**
   * Loading state.
   */
  public readonly isLoading = this.evaluationService.isLoading$;

  /**
   * Error state.
   */
  public readonly error = this.evaluationService.error$;

  /**
   * Get the selected model for binding.
   */
  public getSelectedModel() {
    return this.selectedModel();
  }

  /**
   * Update the selected model.
   */
  public setSelectedModel(model: ModelItem): void {
    this.selectedModel.set(model);
  }
}
