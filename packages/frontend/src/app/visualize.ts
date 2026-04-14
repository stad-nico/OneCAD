import {
  BufferAttribute,
  BufferGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
} from 'three';
import { TriangulationResult } from '../worker/triangulate';
import { AssemblyVisualization } from './shared/types/assembly-tree';

/**
 * Represents the visual components of a triangulated mesh, including the solid mesh and its wireframe edges.
 */
export interface MeshVisualization {
  /**
   * The threejs mesh or group containing meshes
   */
  mesh: Group;

  /**
   * The wireframe edges of the mesh
   */
  wireframe: LineSegments | Group;
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
 * The material used for the wireframe edges when in lines-only mode
 */
export const LINES_ONLY_MATERIAL = new LineBasicMaterial({
  color: 0xffffff,
  linewidth: 2,
  transparent: false,
  opacity: 1.0,
});

/**
 * Visualizes a MeshNode tree by creating threejs meshes and wireframes.
 * Recursively processes the tree to handle assemblies with multiple parts.
 *
 * @param meshNode the mesh node tree from the worker.
 * @returns the visual representation of the mesh(es).
 */
export function visualize(triangulation: TriangulationResult): AssemblyVisualization {
  const { vertices, normals, indices } = triangulation;

  if (!vertices) {
    console.error('[visualizeSingleMesh] Mesh has no vertices', { triangulation });
    throw new Error('Mesh has no vertices');
  }

  // Create geometry
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(vertices, 3));
  if (normals && normals.length > 0) {
    geometry.setAttribute('normal', new BufferAttribute(normals, 3));
  } else {
    // If no normals, compute them
    geometry.computeVertexNormals();
  }
  if (indices && indices.length > 0) {
    geometry.setIndex(new BufferAttribute(indices, 1));
  }

  // Always compute vertex normals to be safe
  geometry.computeVertexNormals();

  const mesh = new Mesh(geometry, MESH_MATERIAL.clone());

  const edgesGeometry = new EdgesGeometry(geometry);
  const wireframe = new LineSegments(edgesGeometry, LINES_MATERIAL.clone());

  return { mesh, wireframe };
}
