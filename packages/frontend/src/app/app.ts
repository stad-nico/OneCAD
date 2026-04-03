import { Component, computed, inject, resource, signal } from '@angular/core';
import { Maybe, Model } from '@opentscad/types';
import { WorkerMessageType } from '../worker/types';
import { callWorker } from '../worker/worker-caller';
import { ModelListComponent } from './model-list/model-list.component';
import { ModelVisualizerComponent } from './model-visualizer/model-visualizer.component';
import { ModelService } from './services/model.service';
import { visualize } from './visualize';

@Component({
  selector: 'app-root',
  imports: [ModelListComponent, ModelVisualizerComponent],
  templateUrl: './app.html',
})
export class App {
  private readonly modelService = inject(ModelService);

  public readonly models = this.modelService.models;

  public readonly selectedModel = signal<Maybe<Model>>(undefined);

  private readonly meshesResource = resource({
    params: this.selectedModel,
    loader: async ({ params }) => {
      const { steps } = params;

      const triangulation = await callWorker(WorkerMessageType.TriangulateMeshFromSteps, { steps });

      const mesh = visualize(triangulation);

      return mesh;
    },
  });

  protected readonly meshes = computed(() =>
    this.meshesResource.hasValue() ? [this.meshesResource.value()] : [],
  );
}
