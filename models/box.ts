import * as THREE from "three";
import { box, triangulate, type ShapeHandle } from "../core/api/api";

/**
 * Create a simple box model via the public API and convert it into a Three.js mesh.
 */
export async function createBoxModel(
  w: number,
  h: number,
  d: number,
): Promise<THREE.Mesh> {
  // 1. Create the box in the kernel via the worker API
  const handle: ShapeHandle = await box(w, h, d);

  // 2. Triangulate it using the worker
  const { vertices, normals, indices } = await triangulate(handle);

  // 3. Build a rudimentary Three.js mesh from the triangulation
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  if (normals && normals.length === vertices.length) {
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  } else {
    geometry.computeVertexNormals();
  }

  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  const material = new THREE.MeshNormalMaterial({ wireframe: false });
  return new THREE.Mesh(geometry, material);
}
