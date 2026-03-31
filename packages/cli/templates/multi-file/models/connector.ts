import { cylinder, cube } from '@opentscad/core';

/**
 * Connector component - creates various connecting pieces
 */
export function createConnector() {
  const radius = 3;
  const height = 8;
  
  // Main connector body
  const body = cylinder({ 
    radius: radius, 
    height: height 
  });
  
  // Add a flange for better connection
  const flangeRadius = radius + 1.5;
  const flangeHeight = 2;
  
  const flange = cylinder({ 
    radius: flangeRadius, 
    height: flangeHeight 
  }).translate({ z: height - flangeHeight });
  
  return body.union(flange);
}

/**
 * Creates a bracket connector for side connections
 */
export function createBracket() {
  const width = 15;
  const height = 10;
  const thickness = 3;
  
  // Vertical part
  const vertical = cube({ 
    size: [thickness, width, height] 
  }).translate({ 
    x: -thickness/2, 
    y: -width/2, 
    z: 0 
  });
  
  // Horizontal part
  const horizontal = cube({ 
    size: [width, thickness, thickness] 
  }).translate({ 
    x: 0, 
    y: -thickness/2, 
    z: 0 
  });
  
  // Add mounting hole
  const hole = cylinder({ 
    radius: 1.6, // M3 clearance
    height: thickness + 1 
  }).translate({ 
    x: width/2, 
    z: -0.5 
  });
  
  return vertical.union(horizontal).subtract(hole);
}

export default createConnector;