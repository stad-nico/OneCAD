import { union } from '@opentscad/core';
import { createBase } from './base';
import { createTop } from './top';
import { createConnector, createBracket } from './connector';

/**
 * Main assembly - combines all components
 */
export function main() {
  // Create the base component
  const base = createBase();
  
  // Create the top component, positioned above the base
  const top = createTop().translate({ z: 15 });
  
  // Create connectors positioned around the assembly
  const connector1 = createConnector().translate({ x: 35, y: 0, z: 0 });
  const connector2 = createConnector().translate({ x: -35, y: 0, z: 0 });
  
  // Create brackets for side connections
  const bracket1 = createBracket().translate({ x: 0, y: 35, z: 5 });
  const bracket2 = createBracket().translate({ x: 0, y: -35, z: 5 });
  
  // Combine all components
  return union([
    base,
    top,
    connector1,
    connector2,
    bracket1,
    bracket2
  ]);
}

/**
 * Alternative assemblies for different views or printing
 */

export function baseOnly() {
  return createBase();
}

export function topOnly() {
  return createTop();
}

export function connectorsOnly() {
  const connector1 = createConnector().translate({ x: 10, y: 0, z: 0 });
  const connector2 = createConnector().translate({ x: -10, y: 0, z: 0 });
  const bracket1 = createBracket().translate({ x: 0, y: 15, z: 0 });
  const bracket2 = createBracket().translate({ x: 0, y: -15, z: 0 });
  
  return union([
    connector1,
    connector2,
    bracket1,
    bracket2
  ]);
}

// Export main as default for OpenTSCAD
export default main;