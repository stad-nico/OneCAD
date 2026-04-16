import { Injectable, computed, inject, signal } from '@angular/core';
import { ModelMetadata, Node } from '@opentscad/types';
import { MeshData, MeshTree, MeshTreeNode } from '../../worker/mesh-tree';
import { TriangulationResult } from '../../worker/triangulate';
import { EvaluationStep, WorkerMessageType } from '../../worker/types';
import { callWorker } from '../../worker/worker-caller';
import { TriangulationCacheService } from './triangulation-cache.service';

/**
 * Represents a selected node in the model tree with its associated triangulation.
 */
export interface SelectedNode {
  id: string;
  label: string;
  triangulation: TriangulationResult;
  depth: number;
}

/**
 * Service for evaluating models and managing triangulation results.
 */
@Injectable({ providedIn: 'root' })
export class ModelEvaluationService {
  private readonly triangulationCache = inject(TriangulationCacheService);

  /**
   * The current loading state of the model evaluation.
   */
  private readonly isLoading = signal(false);

  /**
   * The current error message, if any.
   */
  private readonly error = signal<string | null>(null);

  /**
   * The evaluation steps (intermediate steps and final result).
   */
  private readonly evaluationSteps = signal<EvaluationStep[]>([]);

  /**
   * The mesh tree from the last evaluation.
   */
  private readonly meshTree = signal<MeshTree | null>(null);

  /**
   * The currently selected node in the evaluation tree.
   */
  private readonly selectedNode = signal<SelectedNode | null>(null);

  /**
   * Expose the loading state as a read-only signal.
   */
  public readonly isLoading$ = computed(() => this.isLoading());

  /**
   * Expose the error state as a read-only signal.
   */
  public readonly error$ = computed(() => this.error());

  /**
   * Expose the evaluation steps as a read-only signal.
   */
  public readonly evaluationSteps$ = computed(() => this.evaluationSteps());

  /**
   * Expose the mesh tree as a read-only signal.
   */
  public readonly meshTree$ = computed(() => this.meshTree());

  /**
   * Expose the selected node as a read-only signal.
   */
  public readonly selectedNode$ = computed(() => this.selectedNode());

  /**
   * Evaluate a model and generate triangulations.
   *
   * @param modelName the name of the model
   * @param metadata the model metadata
   * @param treeRoot the root node of the model tree
   */
  public async evaluateModel(modelName: string, metadata: ModelMetadata, treeRoot: Node): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    this.evaluationSteps.set([]);
    this.selectedNode.set(null);
    this.meshTree.set(null);

    try {
      // Call the worker to triangulate the model
      const response = await callWorker(WorkerMessageType.EvaluateModel, {
        node: treeRoot,
        showIntermediateSteps: metadata.showIntermediateSteps ?? false,
      });

      // Store the mesh tree for the sidebar to display
      this.meshTree.set(response.meshTree);

      // Cache the mesh tree and extract triangulations for each node
      this.cacheMeshTree(modelName, response.meshTree);

      // Convert mesh tree to triangulation result for the root (final result)
      const finalTriangulation = this.meshDataToTriangulation(response.meshTree.root.mesh);

      // Auto-select the root node as the final result
      this.selectedNode.set({
        id: treeRoot.id,
        label: 'Final Result',
        triangulation: finalTriangulation,
        depth: 0,
      });

      this.isLoading.set(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during model evaluation';
      this.error.set(errorMessage);
      this.isLoading.set(false);
    }
  }

  /**
   * Recursively cache mesh tree nodes.
   * This extracts triangulations from each mesh node and stores them in the cache.
   *
   * @param modelName the name of the model
   * @param meshTreeNode the current mesh tree node to cache
   */
  private cacheMeshTree(modelName: string, meshTree: MeshTree): void {
    const processNode = (node: MeshTreeNode) => {
      const triangulation = this.meshDataToTriangulation(node.mesh);
      this.triangulationCache.set(modelName, node.id, triangulation);

      // Recursively process children
      for (const child of node.children) {
        processNode(child);
      }
    };

    processNode(meshTree.root);
  }

  /**
   * Convert mesh data to a triangulation result.
   * This is a helper to bridge the mesh tree structure to the existing triangulation format.
   *
   * @param meshData the mesh data to convert
   * @returns the triangulation result
   */
  private meshDataToTriangulation(meshData: MeshData): TriangulationResult {
    return {
      vertices: new Float32Array(meshData.vertices),
      indices: new Uint32Array(meshData.indices),
      normals: meshData.normals ? new Float32Array(meshData.normals) : new Float32Array(0),
    };
  }

  /**
   * Select a specific evaluation step to display.
   *
   * @param step the evaluation step to select
   */
  public selectStep(step: EvaluationStep): void {
    this.selectedNode.set({
      id: step.id,
      label: step.label,
      triangulation: step.triangulation,
      depth: step.depth,
    });
  }

  /**
   * Reset the evaluation state.
   */
  public reset(): void {
    this.isLoading.set(false);
    this.error.set(null);
    this.evaluationSteps.set([]);
    this.meshTree.set(null);
    this.selectedNode.set(null);
  }
}
