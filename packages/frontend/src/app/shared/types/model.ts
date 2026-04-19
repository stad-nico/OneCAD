import { ModelMetadata, Node } from '@opentscad/types';

export interface Model {
  /**
   * The metadata of the model directly from the backend
   */
  readonly metadata: ModelMetadata;

  /**
   * The root node of the models step by step tree structure
   */
  readonly node: Node;
}
