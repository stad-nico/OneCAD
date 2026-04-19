import { Group, LineSegments } from 'three';

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
