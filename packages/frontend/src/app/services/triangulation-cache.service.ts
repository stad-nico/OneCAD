import { Injectable } from '@angular/core';
import { TriangulationResult } from '../../worker/triangulate';

/**
 * Service responsible for caching triangulation results to avoid
 * redundant worker computations.
 */
@Injectable({ providedIn: 'root' })
export class TriangulationCacheService {
  /**
   * Map of node IDs to cached triangulation results.
   * Key format: `${modelName}:${nodeId}` to handle multiple models.
   */
  private readonly cache = new Map<string, TriangulationResult>();

  /**
   * Get a cached triangulation result.
   *
   * @param modelName the name of the model
   * @param nodeId the ID of the node
   * @returns the cached triangulation result or undefined if not found
   */
  public get(modelName: string, nodeId: string): TriangulationResult | undefined {
    return this.cache.get(this.getCacheKey(modelName, nodeId));
  }

  /**
   * Store a triangulation result in the cache.
   *
   * @param modelName the name of the model
   * @param nodeId the ID of the node
   * @param result the triangulation result to cache
   */
  public set(modelName: string, nodeId: string, result: TriangulationResult): void {
    this.cache.set(this.getCacheKey(modelName, nodeId), result);
  }

  /**
   * Clear the cache.
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Clear cache entries for a specific model.
   *
   * @param modelName the name of the model
   */
  public clearModel(modelName: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${modelName}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get the cache key for a model and node.
   */
  private getCacheKey(modelName: string, nodeId: string): string {
    return `${modelName}:${nodeId}`;
  }
}
