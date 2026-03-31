/**
 * Interactive educational demonstrations combining multiple concepts
 */

import { union } from '@opentscad/core';
import { createParametricSpiral, createFibonacciSpiral, createSineWave } from './math-functions.js';
import { createPendulum, createWaveInterference, createSpringMassSystem } from './physics-demo.js';
import { createWaterMolecule, createBenzeneRing, createCubicLattice } from './molecules.js';

/**
 * Creates an interactive mathematics gallery
 */
export function createMathGallery() {
  // Golden ratio spiral
  const goldenSpiral = createParametricSpiral(4, 12, 5, 0.2)
    .translate({ x: -20, y: 0, z: 0 });

  // Fibonacci sequence
  const fibSpiral = createFibonacciSpiral(8)
    .translate({ x: 0, y: 0, z: 0 });

  // Trigonometric functions
  const sineWave = createSineWave(2, 0.8, 15)
    .translate({ x: 0, y: -15, z: 0 });

  const cosineWave = createSineWave(2, 0.8, 15, Math.PI / 2)
    .translate({ x: 0, y: -15, z: 2 });

  return union([goldenSpiral, fibSpiral, sineWave, cosineWave]);
}

/**
 * Creates a physics laboratory demonstration
 */
export function createPhysicsLab() {
  // Multiple pendulums showing period relationships
  const pendulum1 = createPendulum(8, 0.4, Math.PI / 6, 0)
    .translate({ x: -15, y: 0, z: 0 });

  const pendulum2 = createPendulum(6, 0.4, Math.PI / 6, 0)
    .translate({ x: -10, y: 0, z: 0 });

  const pendulum3 = createPendulum(4, 0.4, Math.PI / 6, 0)
    .translate({ x: -5, y: 0, z: 0 });

  // Spring systems with different masses
  const lightMass = createSpringMassSystem(6, 0.8, 0.5)
    .translate({ x: 5, y: 0, z: 0 });

  const heavyMass = createSpringMassSystem(6, 1.5, 1.2)
    .translate({ x: 10, y: 0, z: 0 });

  // Wave interference pattern
  const interference = createWaveInterference(
    { x: -3, y: 0 },
    { x: 3, y: 0 },
    1.5,
    0.8,
    0
  ).scale({ x: 0.5, y: 0.5, z: 1 })
    .translate({ x: 0, y: -15, z: 0 });

  return union([
    pendulum1,
    pendulum2,
    pendulum3,
    lightMass,
    heavyMass,
    interference
  ]);
}

/**
 * Creates a chemistry molecular showcase
 */
export function createChemistryShowcase() {
  // Basic molecules
  const water = createWaterMolecule()
    .translate({ x: -15, y: 0, z: 0 });

  // Organic chemistry
  const benzene = createBenzeneRing()
    .translate({ x: -5, y: 0, z: 0 });

  // Crystal structures
  const saltCrystal = createCubicLattice(3, 1.8, 'Na')
    .translate({ x: 5, y: 5, z: 0 });

  const carbonCrystal = createCubicLattice(3, 1.5, 'C')
    .translate({ x: 5, y: -5, z: 0 });

  return union([water, benzene, saltCrystal, carbonCrystal]);
}

/**
 * Creates an interactive STEM exploration space
 */
export function createSTEMExploration() {
  // Mathematics section
  const mathSection = createMathGallery()
    .translate({ x: -40, y: 0, z: 0 });

  // Physics section
  const physicsSection = createPhysicsLab()
    .translate({ x: 0, y: 0, z: 0 });

  // Chemistry section
  const chemistrySection = createChemistryShowcase()
    .translate({ x: 40, y: 0, z: 0 });

  return union([mathSection, physicsSection, chemistrySection]);
}

/**
 * Creates a progressive learning sequence
 */
export function createLearningSequence() {
  // Elementary level - simple shapes and patterns
  const elementary = createFibonacciSpiral(6)
    .scale({ x: 0.5, y: 0.5, z: 0.5 })
    .translate({ x: -30, y: -20, z: 0 });

  // Middle school - basic physics
  const middleSchool = createPendulum(6, 0.3, Math.PI / 8, 0)
    .translate({ x: -10, y: -20, z: 0 });

  // High school - complex molecules
  const highSchool = createBenzeneRing()
    .scale({ x: 0.7, y: 0.7, z: 0.7 })
    .translate({ x: 10, y: -20, z: 0 });

  // College - advanced concepts
  const college = createWaveInterference()
    .scale({ x: 0.3, y: 0.3, z: 1 })
    .translate({ x: 30, y: -20, z: 0 });

  return union([elementary, middleSchool, highSchool, college]);
}

/**
 * Creates animated demonstrations (static snapshots)
 */
export function createAnimatedDemos() {
  const timeSteps = [0, 0.5, 1.0, 1.5, 2.0];
  const demos: any[] = [];

  timeSteps.forEach((time, index) => {
    // Pendulum at different time steps
    const pendulum = createPendulum(5, 0.3, Math.PI / 4, time)
      .translate({ x: index * 8 - 16, y: 10, z: 0 });

    // Spring system at different compressions
    const compression = 0.5 + 0.3 * Math.sin(time * 2);
    const spring = createSpringMassSystem(4, 0.8, compression)
      .translate({ x: index * 8 - 16, y: -10, z: 0 });

    demos.push(pendulum, spring);
  });

  return union(demos);
}

/**
 * Creates a concept comparison display
 */
export function createConceptComparison() {
  // Different wave types
  const transverseWave = createSineWave(1.5, 1, 12)
    .translate({ x: 0, y: 8, z: 0 });

  const longitudinalWave = createSineWave(1.5, 1, 12)
    .rotateZ(Math.PI / 2)
    .translate({ x: 0, y: -8, z: 0 });

  // Different molecular geometries
  const linear = createWaterMolecule() // Simplified as linear for comparison
    .translate({ x: -15, y: 0, z: 0 });

  const tetrahedral = createCubicLattice(2, 2, 'C')
    .translate({ x: 15, y: 0, z: 0 });

  return union([transverseWave, longitudinalWave, linear, tetrahedral]);
}

/**
 * Main function - creates complete interactive demonstration
 */
export default function main() {
  return createSTEMExploration();
}

/**
 * Alternative views for different educational contexts
 */
export { createMathGallery as mathGallery };
export { createPhysicsLab as physicsLab };
export { createChemistryShowcase as chemistryShowcase };
export { createLearningSequence as learningSequence };
export { createAnimatedDemos as animatedDemos };
export { createConceptComparison as conceptComparison };