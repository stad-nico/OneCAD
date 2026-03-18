import * as THREE from 'three';
import { box } from '../core/api';
import { triangulate } from '../core/api/api';

export async function createBoxModel(): Promise<THREE.Mesh> {
  const shape = box(200, 10, 20).translate(0, 0, 20);

  return await triangulate(shape);
}
