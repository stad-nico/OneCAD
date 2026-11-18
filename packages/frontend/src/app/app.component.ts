import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Maybe } from '@opentscad/types';
import { from, map, of } from 'rxjs';
import { WorkerMessageType } from '../worker/types';
import { callWorker } from '../worker/worker-caller';
import { ModelListComponent } from './components/model-list/model-list.component';
import { TreeNode } from './components/model-list/types/tree-node';
import { ModelVisualizerComponent } from './components/model-visualizer/model-visualizer.component';
import { ModelService } from './services/model.service';
import { Model } from './shared/types/model';
import { rxSignal } from './utils/rxSignal';
import { visualize } from './utils/visualize';

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
   * The available models from the backend.
   */
  public readonly models = this.modelService.models;

  /**
   * The currently selected node in the model tree, which determines what is visualized in the ModelVisualizerComponent.
   */
  protected readonly selectedNode = signal<Maybe<TreeNode>>(undefined);

  /**
   * The selected model
   */
  protected readonly selectedModel = signal<Maybe<Model>>(undefined);

  /**
   * The visualizations derived from the selected model.
   */
  protected readonly visualizations = rxSignal(this.selectedModel, (model) => {
    if (!model) {
      return of([]);
    }

    return from(
      callWorker(WorkerMessageType.EvaluateModel, {
        node: model.node,
        showIntermediateSteps: model.metadata.showIntermediateSteps ?? false,
      })
    ).pipe(map(({ triangulations }) => triangulations.map(({ id, triangulation }) => visualize(triangulation, id))));
  });
}
