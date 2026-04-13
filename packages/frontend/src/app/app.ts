import { Component, computed, inject, linkedSignal, resource } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
  host: {
    class: 'flex size-full',
  },
})
export class App {
  private readonly modelService = inject(ModelService);

  private readonly changedModel = toSignal<Maybe<Model>>(this.modelService.modelChange$, {
    initialValue: undefined,
  });

  public readonly models = this.modelService.models;

  public readonly selectedModel = linkedSignal(() => this.changedModel());

  private readonly meshVisualizationsResource = resource({
    params: this.selectedModel,
    loader: async ({ params }) => {
      const { steps } = params;

      const triangulation = await callWorker(WorkerMessageType.TriangulateMeshFromSteps, { steps });

      const mesh = visualize(triangulation);

      return mesh;
    },
  });

  protected readonly meshVisualizations = computed(() =>
    this.meshVisualizationsResource.hasValue() ? [this.meshVisualizationsResource.value()] : [],
  );
}
