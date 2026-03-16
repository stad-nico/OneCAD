import * as THREE from 'three';
import { box } from '../core/api';
import { triangulate } from '../core/api/api';

/**
 * Create a simple box model via the public API and convert it into a Three.js mesh.
 */
export async function createBoxModel(): Promise<THREE.Mesh> {
  const shape = box(1, 1, 1).translate(-20, -10, -20);

  // 2. Triangulate it using the worker
  const { vertices, normals, indices } = await triangulate(shape);

  // 3. Build a rudimentary Three.js mesh from the triangulation
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
