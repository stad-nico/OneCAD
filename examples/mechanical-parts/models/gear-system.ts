/**
 * Parametric gear system with involute tooth profiles
 */

import { cylinder, union, difference, extrude } from '@opentscad/core';
import type { GearParams } from '../src/types/mechanical.js';

/**
 * Creates an involute gear tooth profile
 */
function createInvoluteGear(params: GearParams): any {
  const { module, teeth, pressureAngle, addendum, dedendum, toothWidth } = params;

  // Calculate basic gear dimensions
  const pitchDiameter = module * teeth;
  const pitchRadius = pitchDiameter / 2;
  const addendumRadius = pitchRadius + (addendum * module);
  const dedendumRadius = pitchRadius - (dedendum * module);
  const baseRadius = pitchRadius * Math.cos((pressureAngle * Math.PI) / 180);

  // Create gear blank
  const gearBlank = cylinder({
    radius: addendumRadius,
    height: toothWidth
  });

  // Create center hole (8mm shaft)
  const centerHole = cylinder({
    radius: 4,
    height: toothWidth + 1
  }).translate({ z: -0.5 });

  // For simplicity, create teeth using subtraction method
  // In a real implementation, you'd generate proper involute curves
  const toothAngle = (2 * Math.PI) / teeth;
  const spaceAngle = toothAngle * 0.4; // Space between teeth

  let gear = difference([gearBlank, centerHole]);

  // Create tooth spaces by subtracting material
  for (let i = 0; i < teeth; i++) {
    const angle = i * toothAngle;
    const spaceWidth = pitchRadius * Math.sin(spaceAngle / 2);
    
    // Create tooth space
    const toothSpace = cylinder({
      radius: spaceWidth,
      height: toothWidth + 1
    }).translate({
      x: Math.cos(angle) * (pitchRadius + dedendumRadius) / 2,
      y: Math.sin(angle) * (pitchRadius + dedendumRadius) / 2,
      z: -0.5
    });

    gear = difference([gear, toothSpace]);
  }

  return gear;
}

/**
 * Creates a spur gear with specified parameters
 */
export function createSpurGear(
  teeth: number,
  module: number,
  toothWidth: number = 6,
  pressureAngle: number = 20
): any {
  const params: GearParams = {
    module,
    teeth,
    pressureAngle,
    addendum: 1.0,    // Standard addendum coefficient
    dedendum: 1.25,   // Standard dedendum coefficient  
    toothWidth
  };

  return createInvoluteGear(params);
}

/**
 * Creates a gear train with specified ratio
 */
export function createGearTrain(
  drivingTeeth: number,
  drivenTeeth: number,
  module: number,
  toothWidth: number = 6
): any {
  // Create driving gear (pinion)
  const pinion = createSpurGear(drivingTeeth, module, toothWidth);

  // Create driven gear
  const gear = createSpurGear(drivenTeeth, module, toothWidth);

  // Calculate center distance
  const centerDistance = (module * (drivingTeeth + drivenTeeth)) / 2;

  // Position driven gear
  const positionedGear = gear.translate({ x: centerDistance, y: 0, z: 0 });

  return union([pinion, positionedGear]);
}

/**
 * Creates a planetary gear system
 */
export function createPlanetaryGearSystem(
  sunTeeth: number,
  planetTeeth: number,
  ringTeeth: number,
  module: number,
  numberOfPlanets: number = 3
): any {
  // Create sun gear (center)
  const sunGear = createSpurGear(sunTeeth, module, 6);

  // Create planet gears
  const planetGear = createSpurGear(planetTeeth, module, 8);
  const planetCenterDistance = module * (sunTeeth + planetTeeth) / 2;

  const planets: any[] = [];
  for (let i = 0; i < numberOfPlanets; i++) {
    const angle = (i * 2 * Math.PI) / numberOfPlanets;
    const x = Math.cos(angle) * planetCenterDistance;
    const y = Math.sin(angle) * planetCenterDistance;
    
    planets.push(planetGear.translate({ x, y, z: 2 }));
  }

  // Create ring gear (outer)
  const ringOuterRadius = module * ringTeeth / 2;
  const ringInnerRadius = ringOuterRadius - module * 2.25; // Dedendum depth
  const ringThickness = 10;

  const ringOuter = cylinder({
    radius: ringOuterRadius + module,
    height: ringThickness
  });

  const ringInner = cylinder({
    radius: ringInnerRadius,
    height: ringThickness + 1
  }).translate({ z: -0.5 });

  const ringGear = difference([ringOuter, ringInner]);

  // Combine all components
  return union([
    sunGear,
    ...planets,
    ringGear.translate({ z: -2 })
  ]);
}

/**
 * Creates a bevel gear (simplified)
 */
export function createBevelGear(
  teeth: number,
  module: number,
  coneAngle: number = 45,
  faceWidth: number = 10
): any {
  // Simplified bevel gear - cone shape with teeth approximation
  const pitchRadius = module * teeth / 2;
  const backConeRadius = pitchRadius / Math.sin((coneAngle * Math.PI) / 180);
  
  // Create basic cone shape
  const coneHeight = backConeRadius * Math.cos((coneAngle * Math.PI) / 180);
  
  // For simplicity, create a truncated cone
  const outerRadius = pitchRadius + module;
  const innerRadius = outerRadius * 0.3;
  
  const cone = cylinder({
    radius1: outerRadius,
    radius2: innerRadius, 
    height: faceWidth
  });

  // Center hole
  const centerHole = cylinder({
    radius: 4,
    height: faceWidth + 1
  }).translate({ z: -0.5 });

  return difference([cone, centerHole]);
}

/**
 * Main example showing different gear types
 */
export default function main() {
  // Simple gear train (1:3 ratio)
  const gearTrain = createGearTrain(12, 36, 1.5)
    .translate({ x: -60, y: 0, z: 0 });

  // Planetary gear system
  const planetary = createPlanetaryGearSystem(12, 15, 42, 1.0)
    .translate({ x: 0, y: 0, z: 0 });

  // Bevel gear
  const bevelGear = createBevelGear(20, 1.5)
    .translate({ x: 60, y: 0, z: 0 });

  return union([gearTrain, planetary, bevelGear]);
}