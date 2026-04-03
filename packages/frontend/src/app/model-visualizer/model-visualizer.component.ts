import { Component, computed, effect, ElementRef, input, viewChild } from '@angular/core';
import { Mesh } from 'three';
import { Renderer } from './renderer';

@Component({
  selector: 'app-model-visualizer',
  templateUrl: './model-visualizer.component.html',
  host: { class: 'block' },
})
export class ModelVisualizerComponent {
  public readonly meshes = input.required<Array<Mesh>>();

  protected readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  readonly #renderer = computed(() => new Renderer(this.canvas().nativeElement));

  constructor() {
    effect(() => {
      this.#renderer().clear();

      for (const mesh of this.meshes()) {
        this.#renderer().addMesh(mesh);
      }
    });
  }
}
