// Export only the public API for use by external projects
export * from './api/operations';
export * from './shape';
export { Operation } from './shared/types/operation';

// Export API functions
export { modelMetadata } from './api/api';
// TODO: Re-enable when worker dependencies are resolved
// export { triangulateShape } from './api/api';

// Export model types
export { Model } from './api/model';

// Export plugin functionality
export { onModelChange } from './plugin';

// Export visualization utilities
export { createThreeJsMeshFromTriangulation } from './visualization';
