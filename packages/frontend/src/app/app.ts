import { Component, computed, inject, linkedSignal, resource } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AstAssemblyNode, Logger, Maybe } from '@opentscad/types';
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

  private readonly changedModel = toSignal<Maybe<AstAssemblyNode>>(this.modelService.modelChange$, {
    initialValue: undefined,
  });

  public readonly models = this.modelService.models;

  // Use a regular model signal that can be updated both from linked signal and from user interaction
  public readonly selectedModel = linkedSignal(() => {
    const changed = this.changedModel();
    Logger.debug('[App] Changed model updated', { changed });
    return changed;
  });

  private readonly meshVisualizationsResource = resource({
    params: this.selectedModel,
    loader: async ({ params: assembly }) => {
      if (!assembly) {
        Logger.debug('[App] No assembly to evaluate');
        return [];
      }

      Logger.debug('[App] Evaluating assembly', { assembly });
      const { triangulation } = await callWorker(WorkerMessageType.EvaluateAssembly, { assembly });
      Logger.debug('[App] Assembly evaluated, visualizing', { triangulation });
      const mesh = visualize(triangulation);
      Logger.debug('[App] Assembly visualized', { mesh });

      return [mesh];
    },
  });

  protected readonly meshVisualizations = computed(() =>
    this.meshVisualizationsResource.hasValue() ? this.meshVisualizationsResource.value() : [],
  );
}
