import { Component, computed, effect, ElementRef, viewChild } from '@angular/core';
import * as THREE from 'three';
import { callWorker } from '../../../../core/worker/main';
import { TriangulationResult } from '../../../../core/worker/triangulate';
import { WorkerRequestType } from '../../../../core/worker/worker-event';
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

		if (import.meta && (import.meta as any).hot) {
			(import.meta as any).hot.on('MODEL_OPERATIONS', async (payload: any) => {
				// The payload received from Vite HMR custom event is correct directly.
				// The server sends { type: 'custom', event: 'MODEL_OPERATIONS', data: { file, operations } }
				// The client receives the `data` object.
				const operations = payload.operations;

				console.log('[frontend] MODEL_OPERATIONS received', {
					file: payload.file,
					operationCount: Array.isArray(operations) ? operations.length : undefined,
				});

				if (!operations) {
					console.warn('[frontend] No operations received in payload');
					return;
				}

				try {
					const result = await callWorker(WorkerRequestType.Build, operations);
					console.log('[frontend] Worker result', result);
					this.updateMeshFromWorker(result);
				} catch (err) {
					console.error('[frontend] Error executing worker pipeline', err);
				}
			});
		}
	}

	private updateMeshFromWorker(meshData: TriangulationResult) {
		const renderer = this.#renderer();
		renderer.clear();

		const geometry = new THREE.BufferGeometry();
		const vertices = new Float32Array(meshData.vertices as ArrayLike<number>);
		geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

		if (meshData.normals) {
			const normals = new Float32Array(meshData.normals as ArrayLike<number>);
			if (normals.length === vertices.length) {
				geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
			} else {
				geometry.computeVertexNormals();
			}
		} else {
			geometry.computeVertexNormals();
		}

		if (meshData.indices) {
			const indices = new Uint32Array(meshData.indices as ArrayLike<number>);
			geometry.setIndex(new THREE.BufferAttribute(indices, 1));
		}

		const material = new THREE.MeshStandardMaterial({ color: 0x808080, metalness: 0.0, roughness: 0.5 });
		const mesh = new THREE.Mesh(geometry, material);
		renderer.addMesh(mesh);
	}
}
