import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, viewChild } from '@angular/core';
import { Maybe } from '@opentscad/types';
import { MeshVisualization } from '../../shared/types/mesh-visualization';
import { RenderModeToggleComponent } from './components/render-mode-toggle/render-mode-toggle.component';
import { Renderer } from './renderer';

@Component({
  selector: 'app-model-visualizer',
  standalone: true,
  imports: [CommonModule, RenderModeToggleComponent],
  templateUrl: './model-visualizer.component.html',
  host: {
    class: 'block w-full h-full relative',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelVisualizerComponent {
  /**
   * The triangulation result to render.
   */
  public readonly visualizations = input.required<Maybe<Array<MeshVisualization>>>();

  /**
   * The label for the currently displayed mesh.
   */
  public readonly label = input<string | null>(null);

  /**
   * The canvas element reference used for rendering the 3D scene.
   * This will be passed to the renderer for drawing the visualizations.
   */
  protected readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  /**
   * The threejs renderer instance responsible for rendering the 3D scene on the canvas.
   */
  protected readonly renderer = computed(() => new Renderer(this.canvas().nativeElement));

  /**
   * Loading state signal.
   */
  public readonly isLoading = input(false);

  /**
   * The selected node id, used for styling highlights on meshes.
   */
  public readonly selectedId = input<string | null>(null);

  /**
   * The root model node ID so we know which one is the completed top-level mesh.
   */
  public readonly rootNodeId = input<string | null>(null);

  constructor() {
    effect(() => {
      const renderer = this.renderer();
      renderer.clear();

      const visualizations = this.visualizations();
      if (!visualizations) {
        return;
      }

      const selectedId = this.selectedId();
      const rootId = this.rootNodeId();

      for (const visualization of visualizations) {
        if (visualization.nodeId === rootId || visualization.nodeId === selectedId) {
          renderer.addVisualization(visualization, selectedId, rootId);
        }
      }
    });
  }
}
