import { Component, computed, effect, ElementRef, viewChild, inject } from '@angular/core';
import { Model, onModelChange, createThreeJsMeshFromTriangulation } from '@opentscad/core';
import { ModelUpdateService } from '../services/model-update.service';
import { Renderer } from './renderer';

@Component({
	selector: 'app-model-visualizer',
	templateUrl: './model-visualizer.component.html',
	host: { class: 'block' },
})
export class ModelVisualizerComponent {
	public readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
	
	// Inject the model update service
	private readonly modelUpdateService = inject(ModelUpdateService);
	
	// Computed property for the current model
	public readonly currentModel = this.modelUpdateService.currentModel;
	public readonly hasModel = computed(() => this.currentModel() !== null);
	public readonly modelInfo = computed(() => {
		const model = this.currentModel();
		if (!model) return null;
		
		return {
			name: model.name,
			id: model.id,
			operationsCount: model.shape?.operations?.length || 0,
			hasShape: !!model.shape
		};
	});

	readonly #renderer = computed(() => new Renderer(this.canvas().nativeElement));

	constructor() {
		effect(() => this.#renderer());

		// React to model changes from the service
		effect(() => {
			const model = this.currentModel();
			if (model) {
				this.onModelChange(model);
			}
		});

		onModelChange(this.onModelChange);
	}

	private async onModelChange(model: Model): Promise<void> {
		const { shape } = model;
		console.log('Model change received:', model);

		// TODO: Implement triangulateShape when worker dependencies are resolved
		// const triangulation = await triangulateShape(shape);

		const renderer = this.#renderer();

		renderer.clear();

		// TODO: Re-enable when triangulation is available
		// const mesh = createThreeJsMeshFromTriangulation(triangulation);
		// renderer.addMesh(mesh);
		
		// For now, just log the model info
		console.log('Model loaded:', {
			id: model.id,
			name: model.name,
			hasShape: !!model.shape,
			operationsCount: model.shape?.operations?.length || 0
		});
	}
}
