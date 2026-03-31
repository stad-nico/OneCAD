import { cube, sphere } from '@opentscad/core';

/**
 * A simple example showing basic shapes
 * This creates a cube with a sphere on top
 */
export function main() {
  // Create a base cube (20x20x5)
  const base = cube(20, 20, 5);
  
  // Create a sphere on top (radius 8, translated up by 10 units)
  const top = sphere(8)
    .translate(0, 0, 10);
  
  // Combine them
  return base.union(top);
}

// Export as default for OpenTSCAD
export default main;