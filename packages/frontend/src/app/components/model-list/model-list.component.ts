import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ModelMetadata, Node, TreeNodeOperation } from '@opentscad/types';
import { TreeNode as BaseTreeNode, TreeComponent, TreeNodeDirective, TreeRoot } from '@pihub/components/tree';

interface TreeNode extends BaseTreeNode {
  readonly name: string;
}

@Component({
  selector: 'app-model-list',
  standalone: true,
  imports: [TreeComponent, TreeNodeDirective, NgTemplateOutlet],
  templateUrl: './model-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block p-4 space-y-4 h-full w-96 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl' },
})
export class ModelListComponent {
  /**
   * The list of models
   */
  public readonly models = input.required<Array<{ metadata: ModelMetadata; treeNode: Node }>>();

  /**
   * The tree nodes to display in the tree component, derived from the models input.
   */
  public readonly treeNodes = computed((): Array<TreeNode> => this.models().flatMap((model) => this.buildTreeNodes(model)));

  /**
   * Builds the tree nodes for a given model.
   *
   * @param model the model to build the tree nodes for.
   * @returns an array of tree nodes.
   */
  private buildTreeNodes(model: { metadata: ModelMetadata; treeNode: Node }): Array<TreeNode> {
    return [
      { id: model.metadata.name, name: model.metadata.name, parentId: TreeRoot },
      ...this.buildTreeNodeRecursively(model.treeNode, model.metadata.name),
    ];
  }

  /**
   * Recursively builds the tree nodes for a given model.
   *
   * @param node the current node to process.
   * @param parentId the id of the parent node.
   * @returns an array of tree nodes.
   */
  private buildTreeNodeRecursively(node: Node, parentId: string): Array<TreeNode> {
    const treeNode = { id: node.id, name: node.operation.toString(), parentId };

    let childNodes: Array<Node> = [];

    switch (node.operation) {
      case TreeNodeOperation.Box:
      case TreeNodeOperation.Sphere:
      case TreeNodeOperation.Cylinder:
        childNodes = [];
        break;
      case TreeNodeOperation.Translate:
      case TreeNodeOperation.Rotate:
      case TreeNodeOperation.Scale:
        childNodes = [node.left];
        break;
      case TreeNodeOperation.Union:
        childNodes = [node.left, node.right];
        break;

      case TreeNodeOperation.Difference:
        childNodes = [node.target, node.tool];
        break;
    }

    return [treeNode, ...childNodes.flatMap((child) => this.buildTreeNodeRecursively(child, node.id))];
  }
}
