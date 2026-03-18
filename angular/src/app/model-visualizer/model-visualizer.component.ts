import { Component, computed, effect, ElementRef, OnInit, viewChild } from '@angular/core';
import { createBoxModel } from '../../../../models/box';
import { Renderer } from './renderer';

@Component({
  selector: 'app-model-visualizer',
  templateUrl: './model-visualizer.component.html',
  host: { class: 'block' },
})
export class ModelVisualizerComponent implements OnInit {
  public readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  readonly #renderer = computed(() => new Renderer(this.canvas().nativeElement));

  constructor() {
    effect(() => this.#renderer());
  }

  public ngOnInit() {
    createBoxModel().then((box) => this.#renderer().addMesh(box));
  }
}
