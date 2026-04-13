import {
  BufferAttribute,
  BufferGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
} from 'three';
import { WorkerMessageType, WorkerResponsePayload } from '../worker/types';

/**
 * Represents the visual components of a triangulated mesh, including the solid mesh and its wireframe edges.
 */
export interface MeshVisualization {
  /**
   * The threejs mesh with
   */
  mesh: Mesh;

  /**
   * The wireframe edges of the mesh
   */
  wireframe: LineSegments;
}

/**
 * The material used for the mesh
 */
const MESH_MATERIAL = new MeshStandardMaterial({
  color: 0xa8a8a8,
  metalness: 0.3,
  roughness: 0.7,
  envMapIntensity: 1.0,
});

/**
 * The material used for the wireframe edges of the mesh
 */
const LINES_MATERIAL = new LineBasicMaterial({
  color: 0x404040,
  linewidth: 2,
  transparent: false,
  opacity: 1.0,
});

/**
 * Visualizes a triangulated mesh by creating a threejs mesh and its wireframe.
 *
 * @param payload the triangulated mesh data from the worker.
 * @returns the visual representation of the mesh.
 */
export function visualize(
  payload: WorkerResponsePayload<WorkerMessageType.TriangulateMeshFromSteps>,
): MeshVisualization {
  const { vertices, normals, indices } = payload.triangulation;

  const geometry = new BufferGeometry();

  geometry.setAttribute('position', new BufferAttribute(vertices, 3));

  if (normals.length === vertices.length) {
    geometry.setAttribute('normal', new BufferAttribute(normals, 3));
  } else {
    geometry.computeVertexNormals();
  }

  geometry.setIndex(new BufferAttribute(indices, 1));

  const mesh = new Mesh(geometry, MESH_MATERIAL);

  const wireframe = new LineSegments(new EdgesGeometry(geometry), LINES_MATERIAL);

  return { mesh, wireframe };
}
