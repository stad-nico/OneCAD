import { Maybe } from '../maybe';

export interface ModelMetadata {
  /**
   * The name of the model
   */
  name: string;

  /**
   * A description of the model
   */
  description?: Maybe<string>;

  /**
   * Whether to show every intermediate step in the model as a
   * separate mesh or just the final result. This can be useful
   * for debugging but may cause performance issues for large models.
   */
  showIntermediateSteps?: boolean;
}

/**
 * Type guard to narrow down to model metadata.
 *
 * @param object the object to check
 * @returns true if the object is a valid ModelMetadata, false otherwise
 */
export function isModelMetadata(object: unknown): object is ModelMetadata {
  if (typeof object !== 'object' || object === null) {
    return false;
  }

  const hasName = 'name' in object && typeof object.name === 'string';
  const hasNoDescription = !('description' in object);
  const hasValidDescription = 'description' in object && (typeof object.description === 'string' || object.description === null);
  const hasDescription = hasNoDescription || hasValidDescription;
  const hasShowIntermediateSteps = !('showIntermediateSteps' in object) || typeof object.showIntermediateSteps === 'boolean';

  return hasName && hasDescription && hasShowIntermediateSteps;
}
