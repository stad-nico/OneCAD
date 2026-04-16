import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { TriangulationResult } from '../../../worker/triangulate';
import { visualize } from '../../utils/visualize';
import { ErrorDisplayComponent } from '../common/error-display.component';
import { RenderModeToggleComponent } from './components/render-mode-toggle/render-mode-toggle.component';
import { Renderer } from './renderer';

@Component({
  selector: 'app-model-visualizer',
  standalone: true,
  imports: [CommonModule, RenderModeToggleComponent, ErrorDisplayComponent],
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
  public readonly triangulation = input<TriangulationResult | null>(null);

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
   * Error message signal.
   */
  public readonly error = input<string | null>(null);

  constructor() {
    effect(() => {
      const tri = this.triangulation();
      if (!tri) {
        this.renderer().clear();
        return;
      }

      // Clear previous meshes
      this.renderer().clear();

      // Convert TriangulationResult to visualization
      try {
        const visualization = visualize(tri);
        this.renderer().addVisualization(visualization);
      } catch (err) {
        console.error('Error visualizing triangulation:', err);
      }
    });
  }
}
