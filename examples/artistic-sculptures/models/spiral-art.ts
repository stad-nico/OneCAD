/**
 * Parametric spiral and helix art forms
 */

import { cylinder, sphere, union } from '@opentscad/core';

/**
 * Mathematical constants for artistic purposes
 */
export const ART_CONSTANTS = {
  PHI: (1 + Math.sqrt(5)) / 2,        // Golden ratio
  TAU: 2 * Math.PI,                   // Full circle
  FIBONACCI: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144],
  SQRT2: Math.sqrt(2),
  SQRT3: Math.sqrt(3),
  EULER: Math.E
} as const;

/**
 * Creates a golden ratio spiral sculpture
 */
export function createGoldenSpiral(
  turns: number = 4,
  height: number = 20,
  tubeRadius: number = 0.3,
  scale: number = 1
): any {
  const points: Array<{ x: number; y: number; z: number }> = [];
  const steps = turns * 100;
  
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * turns * ART_CONSTANTS.TAU;
    const radius = scale * Math.pow(ART_CONSTANTS.PHI, angle / (Math.PI / 2));
    
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const z = (height * i) / steps;
    
    points.push({ x, y, z });
  }
  
  // Create spiral as connected spheres
  const spheres: any[] = [];
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const sphereRadius = tubeRadius * (1 + Math.sin(i * 0.1) * 0.3); // Varying radius
    
    spheres.push(
      sphere(sphereRadius)
        .translate(point.x, point.y, point.z)
    );
  }
  
  return union(spheres);
}

/**
 * Creates a DNA-inspired double helix sculpture
 */
export function createDoubleHelix(
  length: number = 25,
  radius: number = 3,
  pitch: number = 4,
  tubeRadius: number = 0.2
): any {
  const helices: any[] = [];
  const steps = 200;
  
  // Create two intertwined helices
  for (let strand = 0; strand < 2; strand++) {
    const strandSpheres: any[] = [];
    const phaseOffset = strand * Math.PI;
    
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * length;
      const angle = (t / pitch) * ART_CONSTANTS.TAU + phaseOffset;
      
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const z = t;
      
      // Color variation along the helix
      const colorPhase = (i / steps) * ART_CONSTANTS.TAU * 3;
      const sphereRadius = tubeRadius * (1 + Math.sin(colorPhase) * 0.4);
      
      strandSpheres.push(
        sphere(sphereRadius)
          .translate(x, y, z)
      );
    }
    
    helices.push(union(strandSpheres));
  }
  
  // Add connecting rungs between helices
  const rungs: any[] = [];
  const rungSpacing = 2;
  for (let z = 0; z < length; z += rungSpacing) {
    const angle1 = (z / pitch) * ART_CONSTANTS.TAU;
    const angle2 = angle1 + Math.PI;
    
    const x1 = radius * Math.cos(angle1);
    const y1 = radius * Math.sin(angle1);
    const x2 = radius * Math.cos(angle2);
    const y2 = radius * Math.sin(angle2);
    
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    
    rungs.push(
      cylinder(tubeRadius * 0.5, distance)
        .translate((x1 + x2) / 2, (y1 + y2) / 2, z)
    );
  }
  
  return union([...helices, ...rungs]);
}

/**
 * Creates a Fibonacci-based spiral tower
 */
export function createFibonacciTower(levels: number = 12): any {
  const elements: any[] = [];
  const fibonacci = ART_CONSTANTS.FIBONACCI;
  
  let totalHeight = 0;
  
  for (let i = 0; i < Math.min(levels, fibonacci.length); i++) {
    const size = fibonacci[i] * 0.3;
    const height = fibonacci[i] * 0.2;
    const angle = (i * 137.5) * (Math.PI / 180); // Golden angle
    
    // Create element with golden ratio proportions
    const element = cylinder(size / 2, height)
      .translate(0, 0, totalHeight + height / 2);
    
    // Rotate by golden angle (rotation not supported in simplified API)
    const rotatedElement = element;
    
    elements.push(rotatedElement);
    totalHeight += height * 0.8; // Slight overlap
  }
  
  return union(elements);
}

/**
 * Creates a parametric wave sculpture
 */
export function createWaveSculpture(
  amplitude: number = 3,
  frequency: number = 2,
  length: number = 20,
  width: number = 10,
  resolution: number = 0.5
): any {
  const elements: any[] = [];
  
  for (let x = -length / 2; x <= length / 2; x += resolution) {
    for (let y = -width / 2; y <= width / 2; y += resolution) {
      // Create wave interference pattern
      const wave1 = amplitude * Math.sin(frequency * x * 0.3);
      const wave2 = amplitude * Math.sin(frequency * y * 0.3);
      const wave3 = amplitude * Math.sin(frequency * Math.sqrt(x * x + y * y) * 0.2);
      
      const z = (wave1 + wave2 + wave3) / 3;
      
      if (Math.abs(z) > 0.2) {
        const elementHeight = Math.abs(z);
        const elementRadius = resolution * 0.4;
        
        elements.push(
          cylinder(elementRadius, elementHeight)
            .translate(x, y, elementHeight / 2)
        );
      }
    }
  }
  
  return union(elements);
}

/**
 * Creates a logarithmic spiral shell
 */
export function createLogarithmicShell(
  turns: number = 6,
  growthRate: number = 0.3,
  shellThickness: number = 0.5
): any {
  const shells: any[] = [];
  const steps = turns * 80;
  
  for (let layer = 0; layer < 5; layer++) {
    const layerSpheres: any[] = [];
    const layerOffset = layer * shellThickness;
    
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * turns * ART_CONSTANTS.TAU;
      const radius = Math.exp(growthRate * angle);
      
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const z = angle * 0.5 + layerOffset;
      
      const sphereRadius = 0.1 + layer * 0.05;
      
      layerSpheres.push(
        sphere(sphereRadius)
          .translate(x, y, z)
      );
    }
    
    shells.push(union(layerSpheres));
  }
  
  return union(shells);
}

/**
 * Creates an artistic torus knot
 */
export function createTorusKnot(
  p: number = 2,    // How many times around the major radius
  q: number = 3,    // How many times around the minor radius
  majorRadius: number = 5,
  minorRadius: number = 2,
  tubeRadius: number = 0.3
): any {
  const knots: any[] = [];
  const steps = 200;
  
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * ART_CONSTANTS.TAU;
    
    // Parametric torus knot equations
    const r = Math.cos(q * t) + majorRadius;
    const x = r * Math.cos(p * t);
    const y = r * Math.sin(p * t);
    const z = -Math.sin(q * t) * minorRadius;
    
    // Vary tube radius along the path
    const variableRadius = tubeRadius * (1 + Math.sin(t * 5) * 0.3);
    
    knots.push(
      sphere(variableRadius)
        .translate(x, y, z)
    );
  }
  
  return union(knots);
}

/**
 * Main function showcasing spiral art forms
 */
export default function main() {
  // Golden spiral
  const goldenSpiral = createGoldenSpiral(3, 15, 0.2, 0.5)
    .translate({ x: -20, y: 0, z: 0 });
  
  // Double helix
  const doubleHelix = createDoubleHelix(20, 2, 3, 0.15)
    .translate({ x: -10, y: 0, z: 0 });
  
  // Fibonacci tower
  const fibTower = createFibonacciTower(10)
    .translate({ x: 0, y: 0, z: 0 });
  
  // Wave sculpture
  const waves = createWaveSculpture(2, 1.5, 12, 8, 0.8)
    .translate({ x: 10, y: 0, z: 0 });
  
  // Logarithmic shell
  const shell = createLogarithmicShell(4, 0.2, 0.3)
    .translate({ x: 20, y: 0, z: 0 });
  
  // Torus knot
  const torusKnot = createTorusKnot(3, 2, 3, 1.5, 0.2)
    .translate({ x: 0, y: -15, z: 0 });
  
  return union([
    goldenSpiral,
    doubleHelix,
    fibTower,
    waves,
    shell,
    torusKnot
  ]);
}