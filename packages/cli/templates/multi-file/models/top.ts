import { cube, cylinder } from '@opentscad/core';

/**
 * Top component - sits on top of the base
 */
export function createTop() {
  const width = 30;
  const length = 50;
  const height = 15;
  
  // Main top body
  const body = cube({ 
    size: [width, length, height] 
  }).translate({ 
    x: -width/2, 
    y: -length/2, 
    z: 0 
  });
  
  // Add mounting holes that align with base posts
  const holeRadius = 2.2; // Slightly larger than posts for clearance
  const holeDepth = 8;
  const postSpacing = 25;
  
  const hole = cylinder({ 
    radius: holeRadius, 
    height: holeDepth + 1 
  }).translate({ z: -0.5 });
  
  const holes = [
    hole.translate({ x: -postSpacing/2, y: -postSpacing/2 }),
    hole.translate({ x: postSpacing/2, y: -postSpacing/2 }),
    hole.translate({ x: -postSpacing/2, y: postSpacing/2 }),
    hole.translate({ x: postSpacing/2, y: postSpacing/2 })
  ];
  
  // Subtract holes from body
  let result = body;
  for (const h of holes) {
    result = result.subtract(h);
  }
  
  // Add decorative feature on top
  const feature = cylinder({ 
    radius: 8, 
    height: 3 
  }).translate({ z: height });
  
  return result.union(feature);
}

export default createTop;