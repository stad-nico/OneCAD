import { Component } from '@angular/core';
import { ModelVisualizerComponent } from './model-visualizer/model-visualizer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [ModelVisualizerComponent],
  host: { class: 'block size-full' },
})
export class AppComponent {}
