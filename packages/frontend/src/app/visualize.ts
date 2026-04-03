import { BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial } from 'three';
import { WorkerMessageType, WorkerResponsePayload } from '../worker/types';

export function visualize(
  payload: WorkerResponsePayload<WorkerMessageType.TriangulateMeshFromSteps>,
): Mesh {
  const { vertices, normals, indices } = payload.triangulation;

  const geometry = new BufferGeometry();

  geometry.setAttribute('position', new BufferAttribute(vertices, 3));

  if (normals.length === vertices.length) {
    geometry.setAttribute('normal', new BufferAttribute(normals, 3));
  } else {
    geometry.computeVertexNormals();
  }

  geometry.setIndex(new BufferAttribute(indices, 1));

  const material = new MeshStandardMaterial({ color: 0x808080, metalness: 0.0, roughness: 0.5 });
  const mesh = new Mesh(geometry, material);

  return mesh;
}
