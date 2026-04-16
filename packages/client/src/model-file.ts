import { isModelMetadata, Logger, ModelMetadata, Shape } from '@opentscad/types';

/**
 * Interface representing the structure of a model file
 */
export interface ModelFile {
  /**
   * Exports of the model file
   */
  default: {
    /**
     * The default export of the model file
     *
     * @returns the shape represented by the model file.
     */
    default: () => Shape;

    /**
     * The metadata for the model
     */
    metadata: ModelMetadata;
  };
}

/**
 * Type guard to narrow down to model file.
 *
 * @param object the object to check
 * @returns true if the object is a valid ModelFile, false otherwise
 */
export function isModelFile(object: unknown): object is ModelFile {
  if (typeof object !== 'object' || object === null) {
    return false;
  }

  if (!('default' in object) || typeof object.default !== 'object' || object.default === null) {
    return false;
  }

  const exports = object.default;

  const hasDefault = 'default' in exports && typeof exports.default === 'function';

  if (!hasDefault) {
    Logger.debug(`[model-file] Object does not have a valid default export. Expected a function, got ${typeof (object as any).default}.`);
    return false;
  }

  const hasMetadata = 'metadata' in exports && isModelMetadata(exports.metadata);

  if (!hasMetadata) {
    Logger.debug(`[model-file] Object does not have a valid metadata. Expected an object, got ${typeof (object as any).metadata}.`);
    return false;
  }

  return true;
}
