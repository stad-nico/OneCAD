/**
 * Housing component - creates the main enclosure
 */

import { cube, cylinder, sphere } from '@opentscad/core';
import type { HousingParams } from '@/utils/parameters';
import { roundedRect } from '@/utils/helpers';

export function createHousing(params: HousingParams) {
  const { width, height, depth, wallThickness, cornerRadius } = params;
  
  // Create the outer shell
  const outer = cube({ 
    size: [width, height, depth] 
  }).translate({ 
    x: -width/2, 
    y: -height/2, 
    z: 0 
  });
  
  // Create the inner cavity
  const innerWidth = width - 2 * wallThickness;
  const innerHeight = height - 2 * wallThickness;
  const innerDepth = depth - wallThickness;
  
  const inner = cube({ 
    size: [innerWidth, innerHeight, innerDepth] 
  }).translate({ 
    x: -innerWidth/2, 
    y: -innerHeight/2, 
    z: wallThickness 
  });
  
  // Subtract inner from outer to create hollow housing
  const housing = outer.subtract(inner);
  
  // Add mounting holes
  const mountingHole = cylinder({ 
    radius: 1.6, // M3 clearance hole
    height: wallThickness + 1 
  });
  
  const holeSpacing = Math.min(width, height) * 0.7;
  const holes = [
    mountingHole.translate({ x: -holeSpacing/2, y: -holeSpacing/2, z: -0.5 }),
    mountingHole.translate({ x: holeSpacing/2, y: -holeSpacing/2, z: -0.5 }),
    mountingHole.translate({ x: -holeSpacing/2, y: holeSpacing/2, z: -0.5 }),
    mountingHole.translate({ x: holeSpacing/2, y: holeSpacing/2, z: -0.5 })
  ];
  
  // Subtract mounting holes
  let result = housing;
  for (const hole of holes) {
    result = result.subtract(hole);
  }
  
  return result;
}

export function createLid(params: HousingParams) {
  const { width, height, wallThickness, cornerRadius } = params;
  
  // Create lid with small lip for fit
  const lidThickness = 2;
  const lipDepth = 1;
  const lipWidth = 1;
  
  // Main lid body
  const lidBody = cube({ 
    size: [width, height, lidThickness] 
  }).translate({ 
    x: -width/2, 
    y: -height/2, 
    z: 0 
  });
  
  // Create lip for fitting into housing
  const lipSize = [
    width - 2 * wallThickness - 0.5, // Small clearance
    height - 2 * wallThickness - 0.5,
    lipDepth
  ];
  
  const lip = cube({ 
    size: lipSize 
  }).translate({ 
    x: -lipSize[0]/2, 
    y: -lipSize[1]/2, 
    z: -lipDepth 
  });
  
  return lidBody.union(lip);
}