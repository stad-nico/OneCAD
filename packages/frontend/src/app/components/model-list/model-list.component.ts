import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Node, TreeNodeOperation } from '@opentscad/types';
import { TreeComponent, TreeNodeDirective, TreeRoot } from '@pihub/components/tree';
import { Model } from '../../shared/types/model';
import { TreeNode } from './types/tree-node';

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
  public readonly models = input.required<Array<Model>>();

  /**
   * The selected node in the tree
   */
  public readonly selectedNode = output<TreeNode>();

  /**
   * The selected model containing the node
   */
  public readonly selectedModel = output<Model>();

  /**
   * The tree nodes to display in the tree component, derived from the models input
   */
  public readonly treeNodes = computed((): Array<TreeNode> => this.models().flatMap((model) => this.buildTreeNodes(model)));

  /**
   * Handles the change event when a new node is selected in the tree
   *
   * @param selectedId the id of the selected node
   */
  protected onSelectedIdChange(selectedId: null | string): void {
    if (!selectedId) {
      return;
    }

    const node = this.treeNodes().find((node) => node.id === selectedId);

    if (!node) {
      return;
    }

    const model = this.models().find((model) => model.node.id === node.modelId || model.metadata.name === node.id);

    if (model) {
      this.selectedModel.emit(model);
    }
    this.selectedNode.emit(node);
  }

  /**
   * Builds the tree nodes for a given model.
   *
   * @param model the model to build the tree nodes for.
   * @returns an array of tree nodes.
   */
  private buildTreeNodes(model: Model): Array<TreeNode> {
    return [
      { id: model.metadata.name, name: model.metadata.name, parentId: TreeRoot, node: model.node, modelId: model.node.id },
      ...this.buildTreeNodeRecursively(model.node, model.metadata.name, model.node.id),
    ];
  }

  /**
   * Recursively builds the tree nodes for a given model.
   *
   * @param node the current node to process.
   * @param parentId the id of the parent node.
   * @param modelId the id of the model.
   * @returns an array of tree nodes.
   */
  private buildTreeNodeRecursively(node: Node, parentId: string, modelId: string): Array<TreeNode> {
    const treeNode: TreeNode = { id: node.id, name: node.operation.toString(), parentId, node, modelId };

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
        childNodes = node.nodes;
        break;

      case TreeNodeOperation.Difference:
        childNodes = [node.target, node.tool];
        break;
    }

    return [treeNode, ...childNodes.flatMap((child) => this.buildTreeNodeRecursively(child, node.id, modelId))];
  }
}
