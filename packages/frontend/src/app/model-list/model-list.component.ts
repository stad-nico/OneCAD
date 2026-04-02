import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Model } from '@opentscad/types';

@Component({
  selector: 'app-model-list',
  templateUrl: './model-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelListComponent {
  public readonly models = input.required<Array<Model>>();

  public readonly selectedModel = model<Model>();
}
