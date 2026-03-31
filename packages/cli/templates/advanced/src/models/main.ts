/**
 * Main assembly - combines all components
 */

import { union } from '@opentscad/core';
import { defaultParams } from '@/utils/parameters';
import { createHousing, createLid } from '@/models/housing';
import { createMechanism } from '@/models/mechanical';

/**
 * Main assembly function
 * Combines housing, mechanism, and other components
 */
export function main() {
  const params = defaultParams;
  
  // Create main components
  const housing = createHousing(params.housing);
  const mechanism = createMechanism(params.mechanical)
    .translate({ z: params.housing.wallThickness + 2 });
  
  // Create lid (positioned above for visibility)
  const lid = createLid(params.housing)
    .translate({ z: params.housing.depth + 5 });
  
  // Combine all components
  return union([
    housing,
    mechanism,
    lid
  ]);
}

/**
 * Alternative view - housing only for printing
 */
export function housingOnly() {
  return createHousing(defaultParams.housing);
}

/**
 * Alternative view - lid only for printing
 */
export function lidOnly() {
  return createLid(defaultParams.housing);
}

/**
 * Alternative view - mechanism only for analysis
 */
export function mechanismOnly() {
  return createMechanism(defaultParams.mechanical);
}

// Export main as default
export default main;