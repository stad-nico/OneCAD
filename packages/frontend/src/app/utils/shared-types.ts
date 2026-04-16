import { Group } from 'three';

/**
 * Represents the visual components of a triangulated mesh.
 */
export interface AssemblyVisualization {
  /**
   * The threejs group/mesh containing the 3D geometry
   */
  mesh: Group;

  /**
   * The wireframe edges of the mesh
   */
  wireframe?: any;
}
