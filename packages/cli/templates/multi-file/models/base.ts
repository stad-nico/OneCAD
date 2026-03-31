import { cube, cylinder } from '@opentscad/core';

/**
 * Base component - the foundation of our assembly
 */
export function createBase() {
  const width = 40;
  const length = 60;
  const height = 10;
  
  // Main base body
  const body = cube({ 
    size: [width, length, height] 
  }).translate({ 
    x: -width/2, 
    y: -length/2, 
    z: 0 
  });
  
  // Add mounting posts
  const postRadius = 2;
  const postHeight = 5;
  const postSpacing = 25;
  
  const post = cylinder({ 
    radius: postRadius, 
    height: postHeight 
  }).translate({ z: height });
  
  const posts = [
    post.translate({ x: -postSpacing/2, y: -postSpacing/2 }),
    post.translate({ x: postSpacing/2, y: -postSpacing/2 }),
    post.translate({ x: -postSpacing/2, y: postSpacing/2 }),
    post.translate({ x: postSpacing/2, y: postSpacing/2 })
  ];
  
  // Combine body with posts
  let result = body;
  for (const p of posts) {
    result = result.union(p);
  }
  
  return result;
}

export default createBase;