/**
 * Main assembly combining all mechanical components
 */

import { union, difference } from '@opentscad/core';
import { createBearingHousing } from './bearing-housing.js';
import { createGearTrain } from './gear-system.js';
import { createLinearActuator } from './linear-actuator.js';
import { createBoltAssembly } from './fasteners.js';

/**
 * Creates a complete mechanical assembly demonstrating
 * how different components work together
 */
export function createMechanicalAssembly() {
  // Base bearing housing
  const mainBearing = createBearingHousing('6203', 6, true)
    .translate({ x: 0, y: 0, z: 10 });

  // Gear reduction system
  const gearSystem = createGearTrain(12, 36, 1.5, 8)
    .translate({ x: 0, y: 0, z: 25 });

  // Linear actuator driven by gear system
  const actuator = createLinearActuator(80, 'M8')
    .translate({ x: 60, y: 0, z: 10 });

  // Assembly bolts
  const assemblyBolt1 = createBoltAssembly('M6', 25)
    .translate({ x: -20, y: 20, z: 0 });

  const assemblyBolt2 = createBoltAssembly('M6', 25)
    .translate({ x: 20, y: 20, z: 0 });

  const assemblyBolt3 = createBoltAssembly('M6', 25)
    .translate({ x: -20, y: -20, z: 0 });

  const assemblyBolt4 = createBoltAssembly('M6', 25)
    .translate({ x: 20, y: -20, z: 0 });

  return union([
    mainBearing,
    gearSystem,
    actuator,
    assemblyBolt1,
    assemblyBolt2,
    assemblyBolt3,
    assemblyBolt4
  ]);
}

/**
 * Exploded view showing component relationships
 */
export function createExplodedView() {
  // Spacing for exploded view
  const explodeDistance = 80;

  const bearing = createBearingHousing('6203', 6, true)
    .translate({ x: 0, y: 0, z: 0 });

  const gearSystem = createGearTrain(12, 36, 1.5, 8)
    .translate({ x: 0, y: 0, z: explodeDistance });

  const actuator = createLinearActuator(80, 'M8')
    .translate({ x: explodeDistance * 1.5, y: 0, z: explodeDistance / 2 });

  const bolts = union([
    createBoltAssembly('M6', 25).translate({ x: -30, y: 30, z: 0 }),
    createBoltAssembly('M6', 25).translate({ x: 30, y: 30, z: 0 }),
    createBoltAssembly('M6', 25).translate({ x: -30, y: -30, z: 0 }),
    createBoltAssembly('M6', 25).translate({ x: 30, y: -30, z: 0 })
  ]).translate({ z: -explodeDistance / 2 });

  return union([bearing, gearSystem, actuator, bolts]);
}

/**
 * Individual component showcase
 */
export function createComponentShowcase() {
  // Grid layout for individual components
  const spacing = 120;

  // Row 1: Bearing housings
  const bearings = union([
    createBearingHousing('608').translate({ x: -spacing, y: spacing, z: 0 }),
    createBearingHousing('6201').translate({ x: 0, y: spacing, z: 0 }),
    createBearingHousing('6203').translate({ x: spacing, y: spacing, z: 0 })
  ]);

  // Row 2: Gear systems
  const gears = union([
    createGearTrain(12, 24, 1.0).translate({ x: -spacing, y: 0, z: 0 }),
    createGearTrain(15, 45, 1.5).translate({ x: 0, y: 0, z: 0 }),
    createGearTrain(10, 30, 1.2).translate({ x: spacing, y: 0, z: 0 })
  ]);

  // Row 3: Fasteners
  const fasteners = union([
    createBoltAssembly('M5', 20).translate({ x: -spacing, y: -spacing, z: 0 }),
    createBoltAssembly('M6', 25).translate({ x: 0, y: -spacing, z: 0 }),
    createBoltAssembly('M8', 30).translate({ x: spacing, y: -spacing, z: 0 })
  ]);

  return union([bearings, gears, fasteners]);
}

/**
 * Main function - shows complete assembly by default
 */
export default function main() {
  return createMechanicalAssembly();
}

/**
 * Alternative views available as named exports
 */
export { createExplodedView as exploded };
export { createComponentShowcase as showcase };
export { createMechanicalAssembly as assembly };