import { box } from '@opentscad/core';

/**
 * A simple rectangular bracket component.
 * 
 * This example shows how to create configurable components
 * using the available OpenTSCAD operations.
 */

export interface BracketOptions {
  width?: number;
  height?: number; 
  thickness?: number;
}

export default function bracket(options: BracketOptions = {}) {
  const {
    width = 60,
    height = 40,
    thickness = 8
  } = options;

  // Main bracket plate - for now we'll create a simple box
  // In the full implementation, this would include holes and more complex geometry
  return box(width, height, thickness);
}