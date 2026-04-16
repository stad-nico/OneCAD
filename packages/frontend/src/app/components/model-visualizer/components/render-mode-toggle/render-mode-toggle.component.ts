import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { RenderMode } from '../../renderer';

@Component({
  selector: 'app-render-mode-toggle',
  standalone: true,
  templateUrl: './render-mode-toggle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex gap-3 items-center justify-center' },
})
export class RenderModeToggleComponent {
  /**
   * The currently selected render mode.
   */
  public readonly mode = model(RenderMode.Solid);

  /**
   * The available render modes for selection.
   */
  protected readonly modes = [RenderMode.Solid, RenderMode.Transparent, RenderMode.Lines];

  /**
   * The RenderMode enum for use in the template.
   */
  protected readonly RenderMode = RenderMode;
}
