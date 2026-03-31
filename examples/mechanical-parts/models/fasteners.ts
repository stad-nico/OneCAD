/**
 * Standard threaded fasteners (bolts, screws, nuts)
 */

import { cylinder, union, difference } from '@opentscad/core';
import { STANDARD_THREADS, SOCKET_HEAD_CAP_SCREWS } from '../src/utils/standards.js';
import type { ThreadSpec } from '../src/types/mechanical.js';

/**
 * Creates a socket head cap screw
 */
export function createSocketHeadCapScrew(
  threadDesignation: string,
  length: number,
  includeThread: boolean = false
): any {
  const screwSpec = SOCKET_HEAD_CAP_SCREWS[threadDesignation as keyof typeof SOCKET_HEAD_CAP_SCREWS];
  if (!screwSpec) {
    throw new Error(`Unknown screw designation: ${threadDesignation}`);
  }

  const thread = screwSpec.thread;

  // Socket head
  const head = cylinder(screwSpec.headDiameter / 2, screwSpec.headHeight);

  // Socket (hex key hole)
  const socketDepth = screwSpec.headHeight * 0.8;
  const socket = cylinder(screwSpec.keySize / 2, socketDepth + 0.1)
    .translate({ z: screwSpec.headHeight - socketDepth });

  // Screw body
  const bodyLength = length - screwSpec.headHeight;
  let body = cylinder({
    radius: thread.major / 2,
    height: bodyLength
  }).translate({ z: -bodyLength });

  // Add thread representation if requested
  if (includeThread) {
    body = createSimpleThread(thread, bodyLength)
      .translate({ z: -bodyLength });
  }

  // Combine head and body, subtract socket
  return difference([
    union([head, body]),
    socket
  ]);
}

/**
 * Creates a hex bolt
 */
export function createHexBolt(
  threadDesignation: string,
  length: number,
  includeThread: boolean = false
): any {
  const thread = STANDARD_THREADS[threadDesignation];
  if (!thread) {
    throw new Error(`Unknown thread designation: ${threadDesignation}`);
  }

  // Hex head dimensions (approximate)
  const headHeight = thread.major * 0.6;
  const hexWidth = thread.major * 1.5;

  // Approximate hex head with cylinder
  const head = cylinder({
    radius: hexWidth / 2,
    height: headHeight
  });

  // Bolt body
  const bodyLength = length - headHeight;
  let body = cylinder({
    radius: thread.major / 2,
    height: bodyLength
  }).translate({ z: -bodyLength });

  // Add thread representation if requested
  if (includeThread) {
    body = createSimpleThread(thread, bodyLength)
      .translate({ z: -bodyLength });
  }

  return union([head, body]);
}

/**
 * Creates a hex nut
 */
export function createHexNut(
  threadDesignation: string,
  nutType: 'standard' | 'thin' | 'thick' = 'standard'
): any {
  const thread = STANDARD_THREADS[threadDesignation];
  if (!thread) {
    throw new Error(`Unknown thread designation: ${threadDesignation}`);
  }

  // Nut dimensions
  let nutHeight: number;
  switch (nutType) {
    case 'thin':
      nutHeight = thread.major * 0.5;
      break;
    case 'thick':
      nutHeight = thread.major * 1.2;
      break;
    default:
      nutHeight = thread.major * 0.8;
  }

  const hexWidth = thread.major * 1.5;

  // Approximate hex shape with cylinder
  const nutBody = cylinder({
    radius: hexWidth / 2,
    height: nutHeight
  });

  // Thread hole
  const threadHole = cylinder({
    radius: thread.major / 2 + 0.1, // Small clearance
    height: nutHeight + 1
  }).translate({ z: -0.5 });

  return difference([nutBody, threadHole]);
}

/**
 * Creates a washer
 */
export function createWasher(
  threadDesignation: string,
  washerType: 'flat' | 'lock' | 'spring' = 'flat'
): any {
  const thread = STANDARD_THREADS[threadDesignation];
  if (!thread) {
    throw new Error(`Unknown thread designation: ${threadDesignation}`);
  }

  const innerRadius = thread.major / 2 + 0.2; // Clearance
  const outerRadius = thread.major * 1.0;
  
  let thickness: number;
  switch (washerType) {
    case 'lock':
      thickness = thread.major * 0.15;
      break;
    case 'spring':
      thickness = thread.major * 0.2;
      break;
    default:
      thickness = thread.major * 0.1;
  }

  const washerBody = cylinder({
    radius: outerRadius,
    height: thickness
  });

  const washerHole = cylinder({
    radius: innerRadius,
    height: thickness + 1
  }).translate({ z: -0.5 });

  let washer = difference([washerBody, washerHole]);

  // Add lock washer split if applicable
  if (washerType === 'lock') {
    const split = cylinder({
      radius: outerRadius + 0.5,
      height: 0.2
    }).translate({ x: outerRadius * 0.8, z: thickness / 2 });
    
    washer = difference([washer, split]);
  }

  return washer;
}

/**
 * Creates simplified thread representation
 */
function createSimpleThread(thread: ThreadSpec, length: number): any {
  const majorRadius = thread.major / 2;
  const minorRadius = thread.minor / 2;
  
  // Main body at minor diameter
  let threadBody = cylinder({
    radius: minorRadius,
    height: length
  });

  // Add thread crests as rings
  const numberOfThreads = Math.floor(length / thread.pitch);
  
  for (let i = 0; i < numberOfThreads; i++) {
    const z = i * thread.pitch + thread.pitch / 4;
    if (z < length - thread.pitch / 4) {
      const threadCrest = cylinder({
        radius: majorRadius,
        height: thread.pitch / 2
      }).translate({ z });
      
      threadBody = union([threadBody, threadCrest]);
    }
  }

  return threadBody;
}

/**
 * Creates a complete bolt assembly
 */
export function createBoltAssembly(
  threadDesignation: string,
  boltLength: number,
  nutIncluded: boolean = true,
  washerIncluded: boolean = true
): any {
  const components: any[] = [];

  // Bolt
  const bolt = createSocketHeadCapScrew(threadDesignation, boltLength, true);
  components.push(bolt);

  // Washer (if included)
  if (washerIncluded) {
    const screwSpec = SOCKET_HEAD_CAP_SCREWS[threadDesignation as keyof typeof SOCKET_HEAD_CAP_SCREWS];
    if (screwSpec) {
      const washer = createWasher(threadDesignation)
        .translate({ z: -screwSpec.headHeight - 1 });
      components.push(washer);
    }
  }

  // Nut (if included)
  if (nutIncluded) {
    const nut = createHexNut(threadDesignation)
      .translate({ z: -boltLength });
    components.push(nut);
  }

  return union(components);
}

/**
 * Main example showing different fastener types
 */
export default function main() {
  // Socket head cap screws
  const socketScrewsM5 = createSocketHeadCapScrew('M5', 20, true)
    .translate({ x: -60, y: 0, z: 0 });

  const socketScrewsM8 = createSocketHeadCapScrew('M8', 30, true)
    .translate({ x: -30, y: 0, z: 0 });

  // Hex bolts
  const hexBoltM6 = createHexBolt('M6', 25, true)
    .translate({ x: 0, y: 0, z: 0 });

  const hexBoltM10 = createHexBolt('M10', 40, true)
    .translate({ x: 30, y: 0, z: 0 });

  // Nuts and washers
  const nutM8 = createHexNut('M8')
    .translate({ x: -30, y: 30, z: 0 });

  const washerM8 = createWasher('M8', 'flat')
    .translate({ x: -20, y: 30, z: 0 });

  const lockWasherM8 = createWasher('M8', 'lock')
    .translate({ x: -10, y: 30, z: 0 });

  // Complete assembly
  const boltAssembly = createBoltAssembly('M6', 35)
    .translate({ x: 60, y: 0, z: 0 });

  return union([
    socketScrewsM5,
    socketScrewsM8,
    hexBoltM6,
    hexBoltM10,
    nutM8,
    washerM8,
    lockWasherM8,
    boltAssembly
  ]);
}