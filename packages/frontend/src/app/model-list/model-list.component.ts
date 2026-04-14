import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { AstAssemblyNode } from '@opentscad/types';

@Component({
  selector: 'app-model-list',
  templateUrl: './model-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'block p-4 space-y-2 h-full w-80 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl',
  },
})
export class ModelListComponent {
  /**
   * The currently available models (Solid or Assembly).
   */
  public readonly models = input.required<Array<AstAssemblyNode>>();

  /**
   * The currently selected model.
   */
  public readonly selectedModel = model<AstAssemblyNode | undefined>();

  /**
   * Get the ID of a model.
   */
  public getId(model: AstAssemblyNode): string {
    return model.id;
  }

  /**
   * Get the name of a model.
   */
  public getName(model: AstAssemblyNode): string {
    return model.name;
  }
}
