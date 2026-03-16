import * as THREE from 'three';
import { WorkerRequestType } from '../worker';
import { callWorker } from '../worker/main';
import { buildOpenCascadeShape } from './build-opencascade-shape';
import { Shape } from './shape';

const worker = new Worker(new URL('../worker/worker.ts', import.meta.url), {
  type: 'module',
});

export async function triangulate(shape: Shape): Promise<THREE.Mesh> {
  // ! TODO: Separate THREEJS Mesh creation
  const openCascadeShape = await buildOpenCascadeShape(shape);

  const triangulationResult = await callWorker(WorkerRequestType.Triangulate, openCascadeShape);

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  if (normals && normals.length === vertices.length) {
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  } else {
    geometry.computeVertexNormals();
  }

  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  const material = new THREE.MeshNormalMaterial({ wireframe: false });
  return new THREE.Mesh(geometry, material);
}
