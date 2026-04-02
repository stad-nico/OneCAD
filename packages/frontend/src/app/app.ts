import { Component, inject } from '@angular/core';
import { ModelListComponent } from './model-list/model-list.component';
import { ModelService } from './services/model.service';

@Component({
  selector: 'app-root',
  imports: [ModelListComponent],
  templateUrl: './app.html',
})
export class App {
  private readonly modelService = inject(ModelService);

  public readonly models = this.modelService.models;
}
