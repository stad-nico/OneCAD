import { Component, computed, effect, ElementRef, viewChild } from '@angular/core';
import { triangulateShape } from '../../../../core/api';
import { Model } from '../../../../core/api/model';
import { onModelChange } from '../../../../core/plugin';
import { createThreeJsMeshFromTriangulation } from './../../../../core/visualization';
import { Renderer } from './renderer';

@Component({
	selector: 'app-model-visualizer',
	templateUrl: './model-visualizer.component.html',
	host: { class: 'block' },
})
export class ModelVisualizerComponent {
	public readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

	readonly #renderer = computed(() => new Renderer(this.canvas().nativeElement));

	constructor() {
		effect(() => this.#renderer());

		onModelChange(this.onModelChange);
	}

	private async onModelChange(model: Model): Promise<void> {
		const { shape } = model;

		const triangulation = await triangulateShape(shape);

		const renderer = this.#renderer();

		renderer.clear();

		const mesh = createThreeJsMeshFromTriangulation(triangulation);

		renderer.addMesh(mesh);
	}
}
