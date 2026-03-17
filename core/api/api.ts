import * as THREE from 'three';
import { callWorker } from '../worker/main';
import { WorkerRequestType } from '../worker/worker-event';
import { Shape } from './shape';

export async function initializeCore(): Promise<void> {
  return await callWorker(WorkerRequestType.Initialize);
}

export async function triangulate(shape: Shape): Promise<THREE.Mesh> {
  const { vertices, normals, indices } = await callWorker(
    WorkerRequestType.Build,
    shape.operations
  );

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
