/**
 * Mathematical function visualizations for educational purposes
 */

import { cylinder, sphere, cube, union, extrude } from '@opentscad/core';

/**
 * Mathematical constants
 */
export const MATH_CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
  PHI: (1 + Math.sqrt(5)) / 2, // Golden ratio
  TAU: 2 * Math.PI,
  SQRT2: Math.sqrt(2),
  SQRT3: Math.sqrt(3)
} as const;

/**
 * Creates a 3D representation of a mathematical function
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Creates a parametric spiral based on mathematical equations
 */
export function createParametricSpiral(
  turns: number = 3,
  height: number = 20,
  radius: number = 5,
  tubeRadius: number = 0.3
): any {
  const points: Point3D[] = [];
  const steps = turns * 50; // Points per turn

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * MATH_CONSTANTS.TAU;
    const r = radius * (1 - i / (steps * 2)); // Decreasing radius
    
    const x = r * Math.cos(t);
    const y = r * Math.sin(t);
    const z = (height * i) / steps;
    
    points.push({ x, y, z });
  }

  // Create spiral as series of small spheres
  const spheres: any[] = [];
  for (const point of points) {
    spheres.push(
      sphere(tubeRadius)
        .translate({ x: point.x, y: point.y, z: point.z })
    );
  }

  return union(spheres);
}

/**
 * Creates Fibonacci sequence visualization
 */
export function createFibonacciSpiral(iterations: number = 10): any {
  let a = 1, b = 1;
  const rectangles: any[] = [];
  let totalWidth = 0, totalHeight = 0;

  for (let i = 0; i < iterations; i++) {
    const width = a;
    const height = a;
    
    // Create square representing Fibonacci number
    const square = cube({
      size: [width, height, 1]
    }).translate({
      x: totalWidth,
      y: totalHeight,
      z: 0
    });

    rectangles.push(square);

    // Update for next iteration
    [a, b] = [b, a + b];
    
    // Arrange squares in spiral pattern (simplified)
    if (i % 4 === 0) totalWidth += width;
    if (i % 4 === 1) totalHeight += height;
    if (i % 4 === 2) totalWidth -= width;
    if (i % 4 === 3) totalHeight -= height;
  }

  return union(rectangles);
}

/**
 * Creates a 3D graph of a mathematical function z = f(x, y)
 */
export function createFunctionGraph(
  func: (x: number, y: number) => number,
  xRange: [number, number] = [-5, 5],
  yRange: [number, number] = [-5, 5],
  resolution: number = 0.5
): any {
  const points: any[] = [];
  
  for (let x = xRange[0]; x <= xRange[1]; x += resolution) {
    for (let y = yRange[0]; y <= yRange[1]; y += resolution) {
      const z = func(x, y);
      
      // Only plot finite values
      if (isFinite(z)) {
        points.push(
          cube([resolution * 0.8, resolution * 0.8, Math.abs(z) * 0.1])
            .translate({ x, y, z: z * 0.05 })
        );
      }
    }
  }

  return union(points);
}

/**
 * Creates sine wave visualization
 */
export function createSineWave(
  amplitude: number = 2,
  frequency: number = 1,
  length: number = 20,
  phase: number = 0
): any {
  const points: Point3D[] = [];
  const steps = 100;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * length - length / 2;
    const y = amplitude * Math.sin(frequency * x + phase);
    const z = 0;
    
    points.push({ x, y, z });
  }

  // Create wave as series of connected spheres
  const spheres: any[] = [];
  for (const point of points) {
    spheres.push(
      sphere(0.2)
        .translate({ x: point.x, y: point.y, z: point.z })
    );
  }

  return union(spheres);
}

/**
 * Creates cosine wave visualization
 */
export function createCosineWave(
  amplitude: number = 2,
  frequency: number = 1,
  length: number = 20,
  phase: number = 0
): any {
  const points: Point3D[] = [];
  const steps = 100;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * length - length / 2;
    const y = amplitude * Math.cos(frequency * x + phase);
    const z = 0;
    
    points.push({ x, y, z });
  }

  const spheres: any[] = [];
  for (const point of points) {
    spheres.push(
      sphere(0.2)
        .translate({ x: point.x, y: point.y, z: point.z })
    );
  }

  return union(spheres);
}

/**
 * Creates a 3D coordinate system for reference
 */
export function createCoordinateSystem(length: number = 10): any {
  const thickness = 0.1;
  
  // X-axis (red)
  const xAxis = cylinder({
    radius: thickness,
    height: length
  }).rotateY(Math.PI / 2).translate({ x: length / 2, y: 0, z: 0 });

  // Y-axis (green)  
  const yAxis = cylinder({
    radius: thickness,
    height: length
  }).rotateX(-Math.PI / 2).translate({ x: 0, y: length / 2, z: 0 });

  // Z-axis (blue)
  const zAxis = cylinder({
    radius: thickness,
    height: length
  }).translate({ x: 0, y: 0, z: length / 2 });

  return union([xAxis, yAxis, zAxis]);
}

/**
 * Creates geometric series visualization
 */
export function createGeometricSeries(
  firstTerm: number = 1,
  ratio: number = 0.8,
  terms: number = 8
): any {
  const cubes: any[] = [];
  let currentSize = firstTerm;
  let currentX = 0;

  for (let i = 0; i < terms; i++) {
    const cube_obj = cube({
      size: [currentSize, currentSize, currentSize]
    }).translate({
      x: currentX + currentSize / 2,
      y: 0,
      z: currentSize / 2
    });

    cubes.push(cube_obj);
    
    currentX += currentSize + 0.5;
    currentSize *= ratio;
  }

  return union(cubes);
}

/**
 * Main function showcasing various mathematical concepts
 */
export default function main() {
  // Coordinate system
  const coords = createCoordinateSystem(15);

  // Fibonacci spiral
  const fibonacci = createFibonacciSpiral(8)
    .translate({ x: -20, y: -10, z: 0 });

  // Parametric spiral  
  const spiral = createParametricSpiral(4, 15, 3)
    .translate({ x: 0, y: 0, z: 0 });

  // Sine and cosine waves
  const sineWave = createSineWave(3, 0.5, 15)
    .translate({ x: 0, y: -15, z: 0 });

  const cosineWave = createCosineWave(3, 0.5, 15, Math.PI / 2)
    .translate({ x: 0, y: -15, z: 3 });

  // Geometric series
  const geoSeries = createGeometricSeries(2, 0.7, 6)
    .translate({ x: -15, y: 15, z: 0 });

  // Function graph (paraboloid)
  const paraboloid = createFunctionGraph(
    (x, y) => (x * x + y * y) * 0.1,
    [-5, 5],
    [-5, 5],
    0.5
  ).translate({ x: 20, y: 0, z: 0 });

  return union([
    coords,
    fibonacci,
    spiral,
    sineWave,
    cosineWave,
    geoSeries,
    paraboloid
  ]);
}