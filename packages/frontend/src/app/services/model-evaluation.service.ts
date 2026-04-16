import { Injectable, computed, inject, signal } from '@angular/core';
import { ModelMetadata, Node } from '@opentscad/types';
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
  public async evaluateModel(
    modelName: string,
    metadata: ModelMetadata,
    treeRoot: Node,
  ): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    this.evaluationSteps.set([]);
    this.selectedNode.set(null);

    try {
      // Call the worker to triangulate the model
      const response = await callWorker(WorkerMessageType.EvaluateModel, {
        node: treeRoot,
        showIntermediateSteps: metadata.showIntermediateSteps ?? false,
      });

      // Store steps
      this.evaluationSteps.set(response.steps);

      // Cache the final result
      this.triangulationCache.set(modelName, treeRoot.id, response.final);

      // Cache intermediate steps
      for (const step of response.steps) {
        this.triangulationCache.set(modelName, step.id, step.triangulation);
      }

      // Auto-select the first available node (either first step or final)
      if (response.steps.length > 0) {
        this.selectedNode.set({
          id: response.steps[0].id,
          label: response.steps[0].label,
          triangulation: response.steps[0].triangulation,
          depth: response.steps[0].depth,
        });
      } else {
        this.selectedNode.set({
          id: treeRoot.id,
          label: 'Final Result',
          triangulation: response.final,
          depth: 0,
        });
      }

      this.isLoading.set(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error during model evaluation';
      this.error.set(errorMessage);
      this.isLoading.set(false);
    }
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
    this.selectedNode.set(null);
  }
}
