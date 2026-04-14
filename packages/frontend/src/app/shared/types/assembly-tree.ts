import { LineSegments, Mesh } from 'three';

export interface AssemblyVisualization {
  mesh: Mesh;

  wireframe: LineSegments;
}
