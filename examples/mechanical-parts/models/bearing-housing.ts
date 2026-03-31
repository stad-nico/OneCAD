/**
 * Bearing housing with standard fits and mounting features
 */

import { cube, cylinder, union, difference } from '@opentscad/core';
import { STANDARD_BEARINGS } from '../src/utils/standards.js';
import { createClearanceFit } from '../src/utils/tolerances.js';
import { ToleranceGrade } from '../src/types/mechanical.js';
import type { BearingSpec } from '../src/types/mechanical.js';

/**
 * Creates a bearing housing for a specified bearing
 */
export function createBearingHousing(
  bearingDesignation: string,
  housingThickness: number = 5,
  mountingHoles: boolean = true
) {
  const bearing = STANDARD_BEARINGS[bearingDesignation];
  if (!bearing) {
    throw new Error(`Unknown bearing designation: ${bearingDesignation}`);
  }

  // Calculate housing dimensions
  const outerDiameter = bearing.outer + 2 * housingThickness;
  const height = bearing.width + 2;

  // Create main housing body
  const housingBody = cylinder({
    radius: outerDiameter / 2,
    height: height
  });

  // Create bearing pocket with H7 fit
  const fit = createClearanceFit(bearing.outer, ToleranceGrade.H7, ToleranceGrade.H8);
  const bearingPocket = cylinder({
    radius: fit.hole / 2,
    height: bearing.width + 0.1
  }).translate({ z: 1 });

  // Create shaft hole with H8 fit for easy shaft insertion
  const shaftFit = createClearanceFit(bearing.inner, ToleranceGrade.H7, ToleranceGrade.H9);
  const shaftHole = cylinder({
    radius: shaftFit.hole / 2,
    height: height + 1
  }).translate({ z: -0.5 });

  // Start with housing body
  let housing = housingBody;

  // Subtract bearing pocket and shaft hole
  housing = difference([housing, bearingPocket, shaftHole]);

  // Add mounting holes if requested
  if (mountingHoles) {
    const mountingHoleRadius = 2; // M4 clearance holes
    const boltCircleDiameter = outerDiameter * 0.8;
    const numberOfHoles = 4;

    for (let i = 0; i < numberOfHoles; i++) {
      const angle = (i * 2 * Math.PI) / numberOfHoles;
      const x = Math.cos(angle) * (boltCircleDiameter / 2);
      const y = Math.sin(angle) * (boltCircleDiameter / 2);

      const mountingHole = cylinder({
        radius: mountingHoleRadius,
        height: height + 1
      }).translate({ x, y, z: -0.5 });

      housing = difference([housing, mountingHole]);
    }
  }

  return housing;
}

/**
 * Creates a pillow block bearing housing
 */
export function createPillowBlock(
  bearingDesignation: string,
  baseLength: number = 60,
  baseWidth: number = 40,
  baseHeight: number = 8
) {
  const bearing = STANDARD_BEARINGS[bearingDesignation];
  if (!bearing) {
    throw new Error(`Unknown bearing designation: ${bearingDesignation}`);
  }

  // Create base
  const base = cube({
    size: [baseLength, baseWidth, baseHeight]
  }).translate({
    x: -baseLength / 2,
    y: -baseWidth / 2,
    z: 0
  });

  // Create bearing housing
  const housing = createBearingHousing(bearingDesignation, 5, false)
    .translate({ z: baseHeight });

  // Create mounting holes in base
  const mountingHoleRadius = 2.5; // M5 clearance
  const holeSpacingX = baseLength * 0.7;
  const holeSpacingY = baseWidth * 0.7;

  const holes = [
    cylinder(mountingHoleRadius, baseHeight + 1)
      .translate({ x: -holeSpacingX / 2, y: -holeSpacingY / 2, z: -0.5 }),
    cylinder(mountingHoleRadius, baseHeight + 1)
      .translate({ x: holeSpacingX / 2, y: -holeSpacingY / 2, z: -0.5 }),
    cylinder(mountingHoleRadius, baseHeight + 1)
      .translate({ x: -holeSpacingX / 2, y: holeSpacingY / 2, z: -0.5 }),
    cylinder(mountingHoleRadius, baseHeight + 1)
      .translate({ x: holeSpacingX / 2, y: holeSpacingY / 2, z: -0.5 })
  ];

  // Combine and subtract holes
  return difference([
    union([base, housing]),
    ...holes
  ]);
}

/**
 * Creates a flanged bearing housing
 */
export function createFlangedHousing(
  bearingDesignation: string,
  flangeThickness: number = 6
) {
  const bearing = STANDARD_BEARINGS[bearingDesignation];
  if (!bearing) {
    throw new Error(`Unknown bearing designation: ${bearingDesignation}`);
  }

  // Main housing
  const housing = createBearingHousing(bearingDesignation, 4, false);
  
  // Flange
  const flangeRadius = bearing.outer / 2 + 15;
  const flange = cylinder({
    radius: flangeRadius,
    height: flangeThickness
  });

  // Mounting holes in flange
  const boltCircleRadius = flangeRadius * 0.8;
  const numberOfHoles = 6;
  const holes: any[] = [];

  for (let i = 0; i < numberOfHoles; i++) {
    const angle = (i * 2 * Math.PI) / numberOfHoles;
    const x = Math.cos(angle) * boltCircleRadius;
    const y = Math.sin(angle) * boltCircleRadius;

    holes.push(
      cylinder(2.5, flangeThickness + 1)
        .translate({ x, y, z: -0.5 })
    );
  }

  // Combine housing and flange, subtract holes
  return difference([
    union([housing.translate({ z: flangeThickness }), flange]),
    ...holes
  ]);
}

/**
 * Main example showing different bearing housings
 */
export default function main() {
  // Different bearing housing examples
  const simple608 = createBearingHousing('608')
    .translate({ x: -40, y: 0, z: 0 });

  const pillowBlock6201 = createPillowBlock('6201')
    .translate({ x: 0, y: 0, z: 0 });

  const flanged6203 = createFlangedHousing('6203')
    .translate({ x: 40, y: 0, z: 0 });

  return union([simple608, pillowBlock6201, flanged6203]);
}