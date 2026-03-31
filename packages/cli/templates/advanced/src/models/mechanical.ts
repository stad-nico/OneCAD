/**
 * Mechanical components - gears, shafts, and mechanisms
 */

import { cube, cylinder, sphere, union } from '@opentscad/core';
import type { MechanicalParams } from '@/utils/parameters';
import { circularArray, degToRad } from '@/utils/helpers';
import { STANDARD_SIZES } from '@/utils/constants';

export function createShaft(params: MechanicalParams, length: number) {
  const { shaftDiameter } = params;
  
  return cylinder({ 
    radius: shaftDiameter / 2, 
    height: length 
  });
}

export function createBearing(params: MechanicalParams) {
  const { bearingDiameter } = params;
  
  // Use standard bearing if available, or create custom
  const bearing = STANDARD_SIZES.bearings['608']; // Default to 608 bearing
  
  const outer = cylinder({ 
    radius: bearing.outer / 2, 
    height: bearing.width 
  });
  
  const inner = cylinder({ 
    radius: bearing.inner / 2, 
    height: bearing.width + 1 
  }).translate({ z: -0.5 });
  
  return outer.subtract(inner);
}

export function createGear(teeth: number, module: number, thickness: number) {
  // Simplified gear profile - in practice would use proper involute curves
  const pitchRadius = (teeth * module) / 2;
  const outerRadius = pitchRadius + module;
  const rootRadius = pitchRadius - 1.25 * module;
  
  // Create gear body
  const gearBody = cylinder({ 
    radius: outerRadius, 
    height: thickness 
  });
  
  // Create center hole for shaft
  const shaftHole = cylinder({ 
    radius: 4, // 8mm shaft
    height: thickness + 1 
  }).translate({ z: -0.5 });
  
  // Create teeth by subtracting material between teeth
  const toothAngle = (2 * Math.PI) / teeth;
  const gapAngle = toothAngle * 0.4; // 40% gap, 60% tooth
  
  let gear = gearBody.subtract(shaftHole);
  
  // Create tooth gaps (simplified)
  for (let i = 0; i < teeth; i++) {
    const angle = i * toothAngle;
    const gapRadius = outerRadius * 0.8;
    
    const gap = cylinder({ 
      radius: gapRadius * Math.sin(gapAngle / 2), 
      height: thickness + 1 
    }).translate({ 
      x: Math.cos(angle) * gapRadius,
      y: Math.sin(angle) * gapRadius,
      z: -0.5 
    });
    
    gear = gear.subtract(gap);
  }
  
  return gear;
}

export function createMechanism(params: MechanicalParams) {
  const { shaftDiameter, gearRatio, moduleSize } = params;
  
  // Create main shaft
  const mainShaft = createShaft(params, 30);
  
  // Create driving gear (smaller)
  const drivingGear = createGear(12, moduleSize, 6)
    .translate({ z: 5 });
  
  // Create driven gear (larger, based on gear ratio)
  const drivenTeeth = Math.round(12 * gearRatio);
  const drivenGear = createGear(drivenTeeth, moduleSize, 6)
    .translate({ 
      x: (12 + drivenTeeth) * moduleSize / 2, 
      z: 5 
    });
  
  // Create driven shaft
  const drivenShaft = createShaft(params, 30)
    .translate({ 
      x: (12 + drivenTeeth) * moduleSize / 2 
    });
  
  // Combine all components
  return union([
    mainShaft,
    drivingGear,
    drivenGear,
    drivenShaft
  ]);
}