/**
 * Physics demonstration models for educational use
 */

import { sphere, cylinder, cube, union, difference } from '@opentscad/core';

/**
 * Physics constants
 */
export const PHYSICS_CONSTANTS = {
  GRAVITY: 9.81,           // m/s² (Earth)
  SPEED_OF_LIGHT: 299792458, // m/s
  PLANCK: 6.626e-34,       // J·s
  BOLTZMANN: 1.381e-23,    // J/K
  AVOGADRO: 6.022e23       // mol⁻¹
} as const;

/**
 * Creates a pendulum model at a specific time
 */
export function createPendulum(
  length: number = 10,
  bobRadius: number = 0.5,
  angle: number = Math.PI / 6,
  time: number = 0
): any {
  const omega = Math.sqrt(PHYSICS_CONSTANTS.GRAVITY / length);
  const currentAngle = angle * Math.cos(omega * time);
  
  // Calculate bob position
  const x = length * Math.sin(currentAngle);
  const y = -length * Math.cos(currentAngle);
  
  // Pendulum bob
  const bob = sphere(bobRadius)
    .translate({ x, y, z: 0 });
  
  // Pendulum string
  const string = cylinder({
    radius: 0.02,
    height: length
  }).translate({ x: x / 2, y: y / 2, z: 0 })
    .rotateZ(currentAngle);
  
  // Pivot point
  const pivot = sphere(0.1)
    .translate({ x: 0, y: 0, z: 0 });
  
  return union([bob, string, pivot]);
}

/**
 * Creates a spring system with mass
 */
export function createSpringMassSystem(
  springLength: number = 8,
  massSize: number = 1,
  compression: number = 0,
  springCoils: number = 10
): any {
  const currentLength = springLength - compression;
  const coilSpacing = currentLength / springCoils;
  
  // Spring coils
  const coils: any[] = [];
  for (let i = 0; i < springCoils; i++) {
    const z = i * coilSpacing;
    const radius = 0.5 + 0.2 * Math.sin(i * Math.PI / 2); // Variable radius
    
    coils.push(
      cylinder({
        radius: 0.05,
        height: coilSpacing * 0.8
      }).translate({ x: radius, y: 0, z: z })
    );
  }
  
  // Mass attached to spring
  const mass = cube({
    size: [massSize, massSize, massSize]
  }).translate({
    x: -massSize / 2,
    y: -massSize / 2,
    z: currentLength
  });
  
  // Fixed support
  const support = cube({
    size: [2, 2, 0.5]
  }).translate({ x: -1, y: -1, z: -0.5 });
  
  return union([...coils, mass, support]);
}

/**
 * Creates a wave visualization showing interference patterns
 */
export function createWaveInterference(
  source1Pos: { x: number; y: number } = { x: -5, y: 0 },
  source2Pos: { x: number; y: number } = { x: 5, y: 0 },
  wavelength: number = 2,
  amplitude: number = 1,
  time: number = 0
): any {
  const points: any[] = [];
  const gridSize = 20;
  const resolution = 0.5;
  
  for (let x = -gridSize / 2; x <= gridSize / 2; x += resolution) {
    for (let y = -gridSize / 2; y <= gridSize / 2; y += resolution) {
      // Distance from each source
      const dist1 = Math.sqrt(
        Math.pow(x - source1Pos.x, 2) + Math.pow(y - source1Pos.y, 2)
      );
      const dist2 = Math.sqrt(
        Math.pow(x - source2Pos.x, 2) + Math.pow(y - source2Pos.y, 2)
      );
      
      // Wave equations
      const wave1 = amplitude * Math.sin((2 * Math.PI * dist1) / wavelength - time);
      const wave2 = amplitude * Math.sin((2 * Math.PI * dist2) / wavelength - time);
      
      // Superposition
      const totalAmplitude = wave1 + wave2;
      
      if (Math.abs(totalAmplitude) > 0.1) {
        points.push(
          sphere(0.1)
            .translate({ x, y, z: totalAmplitude })
        );
      }
    }
  }
  
  // Source points
  const source1 = sphere(0.3)
    .translate({ x: source1Pos.x, y: source1Pos.y, z: 0 });
  
  const source2 = sphere(0.3)
    .translate({ x: source2Pos.x, y: source2Pos.y, z: 0 });
  
  return union([...points, source1, source2]);
}

/**
 * Creates a simple pulley system
 */
export function createPulleySystem(
  pulleyRadius: number = 2,
  ropeLength: number = 15,
  mass1: number = 1,
  mass2: number = 1.5
): any {
  // Pulley wheel
  const pulley = difference([
    cylinder(pulleyRadius, 0.5),
    cylinder(pulleyRadius - 0.2, 0.6)
      .translate({ z: -0.05 })
  ]).translate({ z: ropeLength });
  
  // Rope (simplified as two straight lines)
  const ropeRadius = 0.05;
  const leftRope = cylinder({
    radius: ropeRadius,
    height: ropeLength - mass1
  }).translate({ x: -pulleyRadius + 0.1, z: 0 });
  
  const rightRope = cylinder({
    radius: ropeRadius,
    height: ropeLength - mass2
  }).translate({ x: pulleyRadius - 0.1, z: 0 });
  
  // Masses
  const mass1Object = cube({
    size: [mass1, mass1, mass1]
  }).translate({
    x: -pulleyRadius + 0.1 - mass1 / 2,
    y: -mass1 / 2,
    z: -mass1
  });
  
  const mass2Object = cube({
    size: [mass2, mass2, mass2]
  }).translate({
    x: pulleyRadius - 0.1 - mass2 / 2,
    y: -mass2 / 2,
    z: -mass2
  });
  
  // Support structure
  const support = cube({
    size: [1, 1, 2]
  }).translate({
    x: -0.5,
    y: -0.5,
    z: ropeLength
  });
  
  return union([
    pulley,
    leftRope,
    rightRope,
    mass1Object,
    mass2Object,
    support
  ]);
}

/**
 * Creates an inclined plane demonstration
 */
export function createInclinedPlane(
  length: number = 10,
  height: number = 5,
  angle?: number
): any {
  const planeAngle = angle || Math.atan(height / Math.sqrt(length * length - height * height));
  
  // Inclined plane
  const plane = cube({
    size: [length, 3, 0.5]
  }).rotateY(planeAngle)
    .translate({ x: 0, y: 0, z: 0 });
  
  // Block on plane
  const blockSize = 1;
  const block = cube({
    size: [blockSize, blockSize, blockSize]
  }).rotateY(planeAngle)
    .translate({
      x: -length / 4,
      y: 0,
      z: height / 2
    });
  
  // Force vectors (represented as arrows)
  const gravityArrow = cylinder({
    radius: 0.05,
    height: 3
  }).translate({
    x: -length / 4,
    y: 1.5,
    z: height / 2 - 1.5
  });
  
  const normalArrow = cylinder({
    radius: 0.05,
    height: 2
  }).rotateY(planeAngle + Math.PI / 2)
    .translate({
      x: -length / 4,
      y: -1.5,
      z: height / 2
    });
  
  return union([plane, block, gravityArrow, normalArrow]);
}

/**
 * Creates a Doppler effect visualization
 */
export function createDopplerEffect(
  sourcePosition: number = 0,
  sourceVelocity: number = 1,
  time: number = 0
): any {
  const waveSpeed = 5;
  const frequency = 1;
  const wavelength = waveSpeed / frequency;
  
  // Moving source
  const currentSourcePos = sourcePosition + sourceVelocity * time;
  const source = sphere(0.3)
    .translate({ x: currentSourcePos, y: 0, z: 0 });
  
  // Wave fronts
  const waveFronts: any[] = [];
  for (let i = 0; i < 10; i++) {
    const emissionTime = time - i * 0.5;
    if (emissionTime > 0) {
      const emissionPos = sourcePosition + sourceVelocity * emissionTime;
      const radius = waveSpeed * (time - emissionTime);
      
      if (radius > 0) {
        // Create wave front as thin sphere
        waveFronts.push(
          difference([
            sphere(radius),
            sphere(radius - 0.1)
          ]).translate({ x: emissionPos, y: 0, z: 0 })
        );
      }
    }
  }
  
  // Observer positions
  const observer1 = cube([0.5, 0.5, 0.5])
    .translate({ x: -10, y: 0, z: 0 });
  
  const observer2 = cube([0.5, 0.5, 0.5])
    .translate({ x: 10, y: 0, z: 0 });
  
  return union([source, ...waveFronts, observer1, observer2]);
}

/**
 * Main function demonstrating various physics concepts
 */
export default function main() {
  // Pendulum at different time positions
  const pendulum1 = createPendulum(8, 0.5, Math.PI / 4, 0)
    .translate({ x: -20, y: 0, z: 0 });
  
  const pendulum2 = createPendulum(8, 0.5, Math.PI / 4, 1)
    .translate({ x: -15, y: 0, z: 0 });
  
  // Spring-mass system
  const springSystem = createSpringMassSystem(6, 1, 1)
    .translate({ x: -5, y: 0, z: 0 });
  
  // Pulley system
  const pulley = createPulleySystem(1.5, 8, 1, 1.2)
    .translate({ x: 5, y: 0, z: 0 });
  
  // Inclined plane
  const incline = createInclinedPlane(8, 3)
    .translate({ x: 15, y: 0, z: 0 });
  
  // Wave interference
  const waves = createWaveInterference()
    .scale({ x: 0.3, y: 0.3, z: 1 })
    .translate({ x: 0, y: -15, z: 0 });
  
  return union([
    pendulum1,
    pendulum2,
    springSystem,
    pulley,
    incline,
    waves
  ]);
}