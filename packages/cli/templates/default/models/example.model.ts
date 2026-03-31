import { box } from '@opentscad/core';

/**
 * Example OpenTSCAD model - a simple box.
 * 
 * This demonstrates the basic structure of an OpenTSCAD model file.
 * Models export a default function that returns a Shape.
 */
export default function createExampleBox() {
  // Create a 10x10x10 box and translate it up by 5 units
  return box(10, 10, 10).translate(0, 0, 5);
}