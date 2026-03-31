/**
 * Linear actuator with moving parts and assemblies
 */

import { cube, cylinder, union, difference } from '@opentscad/core';
import { STANDARD_THREADS } from '../src/utils/standards.js';
import type { ThreadSpec } from '../src/types/mechanical.js';

/**
 * Creates a threaded rod with specified thread
 */
export function createThreadedRod(
  threadDesignation: string,
  length: number
): any {
  const thread = STANDARD_THREADS[threadDesignation];
  if (!thread) {
    throw new Error(`Unknown thread designation: ${threadDesignation}`);
  }

  // Main rod body
  const rod = cylinder({
    radius: thread.major / 2,
    height: length
  });

  // Simplified thread representation with helical grooves
  // In practice, you'd create proper helical threads
  const grooveDepth = (thread.major - thread.minor) / 2;
  const numberOfGrooves = Math.floor(length / thread.pitch);

  let threadedRod = rod;

  // Create thread grooves (simplified as rings)
  for (let i = 0; i < numberOfGrooves; i++) {
    const z = i * thread.pitch;
    const groove = cylinder({
      radius: thread.minor / 2,
      height: thread.pitch * 0.3
    }).translate({ z });

    threadedRod = difference([threadedRod, groove]);
  }

  return threadedRod;
}

/**
 * Creates a threaded nut
 */
export function createThreadedNut(
  threadDesignation: string,
  nutHeight: number = 8,
  nutType: 'hex' | 'round' = 'hex'
): any {
  const thread = STANDARD_THREADS[threadDesignation];
  if (!thread) {
    throw new Error(`Unknown thread designation: ${threadDesignation}`);
  }

  let nutBody: any;

  if (nutType === 'hex') {
    // Hex nut - approximate with cylinder for simplicity
    const hexRadius = thread.major * 0.9; // Approximate hex size
    nutBody = cylinder({
      radius: hexRadius,
      height: nutHeight
    });
  } else {
    // Round nut
    nutBody = cylinder({
      radius: thread.major * 1.2,
      height: nutHeight
    });
  }

  // Thread hole
  const threadHole = cylinder({
    radius: thread.major / 2 + 0.1, // Small clearance
    height: nutHeight + 1
  }).translate({ z: -0.5 });

  return difference([nutBody, threadHole]);
}

/**
 * Creates a linear guide rail
 */
export function createLinearRail(
  length: number,
  width: number = 20,
  height: number = 12
): any {
  // Main rail body
  const railBody = cube({
    size: [length, width, height]
  }).translate({
    x: -length / 2,
    y: -width / 2,
    z: 0
  });

  // Mounting holes
  const holeSpacing = 40; // Standard rail hole spacing
  const numberOfHoles = Math.floor(length / holeSpacing);
  const startOffset = (length - (numberOfHoles - 1) * holeSpacing) / 2;

  let rail = railBody;

  for (let i = 0; i < numberOfHoles; i++) {
    const x = -length / 2 + startOffset + i * holeSpacing;
    const hole = cylinder({
      radius: 2.5, // M5 clearance
      height: height + 1
    }).translate({ x, z: -0.5 });

    rail = difference([rail, hole]);
  }

  return rail;
}

/**
 * Creates a linear bearing carriage
 */
export function createLinearCarriage(
  railWidth: number = 20,
  carriageLength: number = 60,
  carriageWidth: number = 40,
  carriageHeight: number = 20
): any {
  // Main carriage body
  const carriageBody = cube({
    size: [carriageLength, carriageWidth, carriageHeight]
  }).translate({
    x: -carriageLength / 2,
    y: -carriageWidth / 2,
    z: 0
  });

  // Rail slot
  const railSlot = cube({
    size: [carriageLength + 1, railWidth + 0.2, carriageHeight / 2]
  }).translate({
    x: -carriageLength / 2 - 0.5,
    y: -railWidth / 2 - 0.1,
    z: -0.1
  });

  // Mounting holes
  const mountingHoles = [
    cylinder(2, carriageHeight + 1)
      .translate({ x: -carriageLength / 4, y: -carriageWidth / 4, z: -0.5 }),
    cylinder(2, carriageHeight + 1)
      .translate({ x: carriageLength / 4, y: -carriageWidth / 4, z: -0.5 }),
    cylinder(2, carriageHeight + 1)
      .translate({ x: -carriageLength / 4, y: carriageWidth / 4, z: -0.5 }),
    cylinder(2, carriageHeight + 1)
      .translate({ x: carriageLength / 4, y: carriageWidth / 4, z: -0.5 })
  ];

  return difference([carriageBody, railSlot, ...mountingHoles]);
}

/**
 * Creates a complete linear actuator assembly
 */
export function createLinearActuator(
  strokeLength: number = 100,
  threadDesignation: string = 'M8'
): any {
  const thread = STANDARD_THREADS[threadDesignation];
  if (!thread) {
    throw new Error(`Unknown thread designation: ${threadDesignation}`);
  }

  // Base housing
  const housingLength = strokeLength + 60;
  const housingWidth = 40;
  const housingHeight = 30;

  const housing = cube({
    size: [housingLength, housingWidth, housingHeight]
  }).translate({
    x: -housingLength / 2,
    y: -housingWidth / 2,
    z: 0
  });

  // Thread rod (full length)
  const threadRodLength = strokeLength + 40;
  const threadRod = createThreadedRod(threadDesignation, threadRodLength)
    .translate({ z: housingHeight / 2 });

  // Moving nut assembly
  const movingNut = createThreadedNut(threadDesignation, 12, 'round')
    .translate({ z: housingHeight / 2 });

  // Linear guides
  const leftRail = createLinearRail(strokeLength + 20)
    .translate({ y: -15, z: housingHeight + 2 });
  
  const rightRail = createLinearRail(strokeLength + 20)
    .translate({ y: 15, z: housingHeight + 2 });

  // Moving carriage
  const carriage = createLinearCarriage()
    .translate({ z: housingHeight + 15 });

  // Motor mount (simplified)
  const motorMount = cylinder({
    radius: 20,
    height: 15
  }).translate({ x: -housingLength / 2 - 10, z: housingHeight / 2 });

  return union([
    housing,
    threadRod,
    movingNut,
    leftRail,
    rightRail,
    carriage,
    motorMount
  ]);
}

/**
 * Creates an actuator in different positions to show movement
 */
export function createActuatorSequence(): any {
  const positions = [-30, 0, 30]; // Different positions along stroke
  const actuators: any[] = [];

  positions.forEach((position, index) => {
    const actuator = createLinearActuator(100)
      .translate({ 
        x: index * 200, 
        y: 0, 
        z: 0 
      });

    // Move the carriage and nut to show different positions
    const movingAssembly = union([
      createLinearCarriage().translate({ x: position, z: 45 }),
      createThreadedNut('M8', 12, 'round').translate({ x: position, z: 15 })
    ]).translate({ x: index * 200 });

    actuators.push(actuator);
    actuators.push(movingAssembly);
  });

  return union(actuators);
}

/**
 * Main example showing linear actuator components
 */
export default function main() {
  return createActuatorSequence();
}