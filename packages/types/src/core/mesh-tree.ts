/**
 * Represents a mesh node in the evaluation tree.
 * Each node corresponds to a node in the input tree and contains
 * a mesh for that specific evaluation step.
 */
export interface MeshTreeNode {
  /**
   * Unique identifier that matches the input tree node id.
   * This allows mapping the mesh back to the original node in the operation tree.
   */
  id: string;

  /**
   * The mesh data for this node's evaluation result.
   * This is the triangulated geometry that represents the result
   * of evaluating this node and all its dependencies.
   */
  mesh: MeshData;

  /**
   * Child nodes in the evaluation tree.
   * For leaf nodes (primitives), this will be empty.
   * For composite operations (union, difference), this will contain the children.
   */
  children: MeshTreeNode[];
}

/**
 * Represents the mesh data returned from the worker.
 * This is a triangulated representation of a 3D shape.
 */
export interface MeshData {
  /**
   * Array of vertex positions as a flat array [x1, y1, z1, x2, y2, z2, ...]
   */
  vertices: number[];

  /**
   * Array of triangle indices as a flat array [i1, i2, i3, i4, i5, i6, ...]
   * Each triplet of indices represents one triangle.
   */
  indices: number[];

  /**
   * Optional array of vertex normals for better lighting [nx1, ny1, nz1, nx2, ny2, nz2, ...]
   */
  normals?: number[];
}

/**
 * Root type for the mesh tree structure returned from the worker.
 * This tree contains the complete mesh hierarchy with each node
 * matching the structure of the input operation tree.
 */
export interface MeshTree {
  /**
   * The root node of the mesh tree.
   * All evaluation results are contained within this tree structure.
   */
  root: MeshTreeNode;
}
