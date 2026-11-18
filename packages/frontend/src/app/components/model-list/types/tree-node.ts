import { Maybe, Node } from '@opentscad/types';
import { TreeNode as BaseTreeNode } from '@pihub/components/tree';
import { MeshVisualization } from '../../../shared/types/mesh-visualization';

export interface TreeNode extends BaseTreeNode {
  /**
   * The name to display for the tree node, derived from the node's operation.
   */
  readonly name: string;

  /**
   * The underlying node data for this tree node, containing the operation and its details.
   */
  readonly node: Node;

  /**
   * The ID of the model this node belongs to.
   */
  readonly modelId?: string;

  /**
   * The precalculated mesh for this node, if computed directly by the backend.
   */
  readonly visualizations?: Maybe<Array<MeshVisualization>>;
}
