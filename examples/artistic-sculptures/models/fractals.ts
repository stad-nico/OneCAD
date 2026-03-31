/**
 * Fractal geometries and recursive patterns
 */

import { cube, sphere, cylinder, union } from '@opentscad/core';

/**
 * Fractal generation parameters
 */
export interface FractalParams {
  readonly iterations: number;
  readonly scaleFactor: number;
  readonly rotationAngle: number;
  readonly translationFactor: number;
}

/**
 * Creates a 3D Sierpinski triangle (tetrahedron)
 */
export function createSierpinskiTetrahedron(
  iterations: number = 4,
  size: number = 8
): any {
  if (iterations === 0) {
    // Base case: single tetrahedron (approximated as cube for simplicity)
    return cube(size, size, size)
      .translate(-size/2, -size/2, -size/2);
  }
  
  // Recursive case: create 4 smaller tetrahedra
  const newSize = size / 2;
  const offset = newSize / 2;
  
  const tetrahedra = [
    // Top tetrahedron
    createSierpinskiTetrahedron(iterations - 1, newSize)
      .translate(0, 0, offset),
    
    // Bottom tetrahedra
    createSierpinskiTetrahedron(iterations - 1, newSize)
      .translate(-offset, -offset, -offset),
    
    createSierpinskiTetrahedron(iterations - 1, newSize)
      .translate(offset, -offset, -offset),
    
    createSierpinskiTetrahedron(iterations - 1, newSize)
      .translate(0, offset, -offset)
  ];
  
  return union(tetrahedra);
}

/**
 * Creates a 3D Mandelbrot-inspired fractal
 */
export function createMandelbrotSet3D(
  size: number = 10,
  resolution: number = 0.5,
  iterations: number = 20,
  threshold: number = 4
): any {
  const elements: any[] = [];
  
  for (let x = -size; x <= size; x += resolution) {
    for (let y = -size; y <= size; y += resolution) {
      for (let z = -size; z <= size; z += resolution) {
        const c = { x: x / size, y: y / size, z: z / size };
        let zn = { x: 0, y: 0, z: 0 };
        
        let iter = 0;
        while (iter < iterations) {
          // 3D Mandelbrot iteration: z = z² + c
          const newZn = {
            x: zn.x * zn.x - zn.y * zn.y - zn.z * zn.z + c.x,
            y: 2 * zn.x * zn.y + c.y,
            z: 2 * zn.x * zn.z + c.z
          };
          
          zn = newZn;
          
          const magnitude = Math.sqrt(zn.x * zn.x + zn.y * zn.y + zn.z * zn.z);
          if (magnitude > threshold) break;
          
          iter++;
        }
        
        // Create element if point is in the set
        if (iter === iterations) {
          elements.push(
            cube(resolution, resolution, resolution)
              .translate(x, y, z)
          );
        }
      }
    }
  }
  
  return union(elements);
}

/**
 * Creates a fractal tree structure
 */
export function createFractalTree(
  depth: number = 5,
  length: number = 5,
  radius: number = 0.2,
  angleSpread: number = Math.PI / 6,
  lengthReduction: number = 0.7,
  radiusReduction: number = 0.8
): any {
  if (depth === 0) {
    return null;
  }
  
  // Create trunk
  const trunk = cylinder(radius, length)
    .translate(0, 0, length / 2);
  
  if (depth === 1) {
    return trunk;
  }
  
  // Create branches
  const branches: any[] = [];
  const numBranches = 3;
  
  for (let i = 0; i < numBranches; i++) {
    const angle = (i / numBranches) * 2 * Math.PI;
    const tiltAngle = angleSpread;
    
    const branch = createFractalTree(
      depth - 1,
      length * lengthReduction,
      radius * radiusReduction,
      angleSpread,
      lengthReduction,
      radiusReduction
    );
    
    if (branch) {
      const positionedBranch = branch
        .rotateY(tiltAngle)
        .rotateZ(angle)
        .translate({ z: length });
      
      branches.push(positionedBranch);
    }
  }
  
  return union([trunk, ...branches]);
}

/**
 * Creates a Koch snowflake in 3D
 */
export function createKochSnowflake3D(
  iterations: number = 3,
  size: number = 6,
  thickness: number = 0.2
): any {
  // Start with equilateral triangle
  const trianglePoints = [
    { x: 0, y: size * Math.sqrt(3) / 3, z: 0 },
    { x: -size / 2, y: -size * Math.sqrt(3) / 6, z: 0 },
    { x: size / 2, y: -size * Math.sqrt(3) / 6, z: 0 }
  ];
  
  function kochLine(
    p1: { x: number; y: number; z: number },
    p2: { x: number; y: number; z: number },
    iter: number
  ): any[] {
    if (iter === 0) {
      // Create line segment
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      return [
        cylinder(thickness / 2, length)
          .translate((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, 0)
      ];
    }
    
    // Divide line into three parts and add Koch bump
    const oneThird = {
      x: p1.x + (p2.x - p1.x) / 3,
      y: p1.y + (p2.y - p1.y) / 3,
      z: 0
    };
    
    const twoThird = {
      x: p1.x + 2 * (p2.x - p1.x) / 3,
      y: p1.y + 2 * (p2.y - p1.y) / 3,
      z: 0
    };
    
    // Calculate peak of equilateral triangle
    const midX = (oneThird.x + twoThird.x) / 2;
    const midY = (oneThird.y + twoThird.y) / 2;
    const dx = twoThird.x - oneThird.x;
    const dy = twoThird.y - oneThird.y;
    const peak = {
      x: midX - dy * Math.sqrt(3) / 2,
      y: midY + dx * Math.sqrt(3) / 2,
      z: 0
    };
    
    // Recursively create four segments
    return [
      ...kochLine(p1, oneThird, iter - 1),
      ...kochLine(oneThird, peak, iter - 1),
      ...kochLine(peak, twoThird, iter - 1),
      ...kochLine(twoThird, p2, iter - 1)
    ];
  }
  
  const segments: any[] = [];
  
  // Create three sides of the snowflake
  for (let i = 0; i < 3; i++) {
    const p1 = trianglePoints[i];
    const p2 = trianglePoints[(i + 1) % 3];
    segments.push(...kochLine(p1, p2, iterations));
  }
  
  return union(segments);
}

/**
 * Creates a Menger sponge fractal
 */
export function createMengerSponge(
  iterations: number = 3,
  size: number = 9
): any {
  if (iterations === 0) {
    return cube(size, size, size)
      .translate(-size/2, -size/2, -size/2);
  }
  
  const newSize = size / 3;
  const sponges: any[] = [];
  
  // Create 20 smaller sponges (27 - 7 holes)
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        // Skip the holes (cross pattern on each face)
        const holes = [
          (x === 1 && y === 1), // Center of each face
          (x === 1 && z === 1),
          (y === 1 && z === 1)
        ];
        
        if (!holes.some(hole => hole)) {
          const offsetX = (x - 1) * newSize;
          const offsetY = (y - 1) * newSize;
          const offsetZ = (z - 1) * newSize;
          
          sponges.push(
            createMengerSponge(iterations - 1, newSize)
              .translate({ x: offsetX, y: offsetY, z: offsetZ })
          );
        }
      }
    }
  }
  
  return union(sponges);
}

/**
 * Creates a dragon curve in 3D
 */
export function createDragonCurve3D(
  iterations: number = 8,
  segmentLength: number = 1,
  tubeRadius: number = 0.1
): any {
  // Generate dragon curve points
  function generateDragonSequence(iter: number): string {
    if (iter === 0) return "F";
    
    const prev = generateDragonSequence(iter - 1);
    return prev + "L" + prev.split("").reverse().map(c => 
      c === "L" ? "R" : c === "R" ? "L" : c
    ).join("");
  }
  
  const sequence = generateDragonSequence(iterations);
  const segments: any[] = [];
  
  let x = 0, y = 0, z = 0;
  let direction = 0; // 0: +X, 1: +Y, 2: -X, 3: -Y
  let zDirection = 0; // Elevation changes
  
  for (const command of sequence) {
    if (command === "F") {
      // Move forward and create segment
      const newX = x + (direction === 0 ? segmentLength : direction === 2 ? -segmentLength : 0);
      const newY = y + (direction === 1 ? segmentLength : direction === 3 ? -segmentLength : 0);
      const newZ = z + Math.sin(segments.length * 0.1) * 0.2; // Gentle wave in Z
      
      const dx = newX - x;
      const dy = newY - y;
      const dz = newZ - z;
      const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (length > 0) {
        const segment = cylinder(tubeRadius, length)
          .translate((x + newX) / 2, (y + newY) / 2, (z + newZ) / 2);
        segments.push(segment);
      }
      
      x = newX;
      y = newY;
      z = newZ;
      
    } else if (command === "L") {
      direction = (direction + 1) % 4;
    } else if (command === "R") {
      direction = (direction + 3) % 4;
    }
  }
  
  return union(segments);
}

/**
 * Main function showcasing fractal art
 */
export default function main() {
  // Sierpinski tetrahedron
  const sierpinski = createSierpinskiTetrahedron(3, 6)
    .translate({ x: -25, y: 0, z: 0 });
  
  // Fractal tree
  const tree = createFractalTree(4, 4, 0.3, Math.PI / 4, 0.7, 0.8)
    .translate({ x: -15, y: 0, z: 0 });
  
  // Koch snowflake
  const snowflake = createKochSnowflake3D(2, 8, 0.2)
    .translate({ x: -5, y: 0, z: 0 });
  
  // Menger sponge
  const sponge = createMengerSponge(2, 6)
    .translate({ x: 5, y: 0, z: 0 });
  
  // Dragon curve
  const dragon = createDragonCurve3D(6, 0.8, 0.08)
    .translate({ x: 15, y: 0, z: 0 });
  
  // Mandelbrot set (small due to computation)
  const mandelbrot = createMandelbrotSet3D(3, 1, 8, 2)
    .translate({ x: 25, y: 0, z: 0 });
  
  return union([
    sierpinski,
    tree,
    snowflake,
    sponge,
    dragon,
    mandelbrot
  ]);
}