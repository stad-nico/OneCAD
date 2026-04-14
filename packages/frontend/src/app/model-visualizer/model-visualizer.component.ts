import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { AssemblyVisualization } from '../shared/types/assembly-tree';
import { RenderModeToggleComponent } from './components/render-mode-toggle/render-mode-toggle.component';
import { Renderer } from './renderer';

@Component({
  selector: 'app-model-visualizer',
  standalone: true,
  imports: [RenderModeToggleComponent],
  templateUrl: './model-visualizer.component.html',
  host: {
    class: 'block w-full h-full relative',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelVisualizerComponent {
  /**
   * The list of mesh visualizations to render.
   */
  public readonly visualizations = input.required<Array<AssemblyVisualization>>();

  /**
   * The canvas element reference used for rendering the 3D scene.
   * This will be passed to the renderer for drawing the visualizations.
   */
  protected readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  /**
   * The threejs renderer instance responsible for rendering the 3D scene on the canvas.
   */
  protected readonly renderer = computed(() => new Renderer(this.canvas().nativeElement));

  constructor() {
    effect(() => {
      this.renderer().clear();

      for (const visualization of this.visualizations()) {
        this.renderer().addVisualization(visualization);
      }
    });
  }
}
