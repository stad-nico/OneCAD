import { sphere, cylinder, union, Shape } from '@opentscad/core';

/**
 * Organic Patterns - Natural and cellular forms inspired by biology
 * Demonstrates voronoi patterns, cellular structures, and growth simulation
 */

export interface CellularParams {
  readonly cellSize: number;
  readonly spacing: number;
  readonly variation: number;
  readonly layers: number;
}

/**
 * Creates a honeycomb-like cellular pattern
 */
export function createHoneycombPattern(params: CellularParams): Shape {
  const cells: Array<Shape> = [];
  const { cellSize, spacing, variation, layers } = params;
  
  for (let layer = 0; layer < layers; layer++) {
    for (let i = -5; i <= 5; i++) {
      for (let j = -5; j <= 5; j++) {
        // Create hexagonal offset pattern
        const offsetX = (j % 2) * (spacing / 2);
        const x = i * spacing + offsetX;
        const y = j * spacing * 0.866; // √3/2 for hexagonal spacing
        const z = layer * cellSize * 1.2;
        
        // Add some organic variation
        const noiseX = (Math.sin(i * 0.3 + j * 0.7) * variation);
        const noiseY = (Math.cos(i * 0.5 + j * 0.2) * variation);
        const noiseZ = (Math.sin(i * j * 0.1) * variation * 0.5);
        
        // Create hexagonal cell
        const cell = createHexagonalCell(cellSize)
          .translate(x + noiseX, y + noiseY, z + noiseZ);
          
        cells.push(cell);
      }
    }
  }
  
  return union(cells);
}

/**
 * Creates a single hexagonal cell structure
 */
function createHexagonalCell(size: number): Shape {
  const walls: Array<Shape> = [];
  
  // Create 6 walls in hexagonal arrangement
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = Math.cos(angle) * size * 0.8;
    const y = Math.sin(angle) * size * 0.8;
    
    const wall = cylinder(size * 0.05, size * 0.6)
      .translate(x, y, 0);
      
    walls.push(wall);
  }
  
  return union(walls);
}

/**
 * Creates a voronoi-like pattern with organic cell structures
 */
export function createVoronoiStructure(seed: number, cellCount: number): Shape {
  // Generate random seed points
  const seedPoints = generateSeedPoints(cellCount, seed);
  const regions: Array<Shape> = [];
  
  // Create organic regions around each seed point
  for (let i = 0; i < seedPoints.length; i++) {
    const point = seedPoints[i];
    const region = createOrganicRegion(point, i, seedPoints);
    regions.push(region);
  }
  
  return union(regions);
}

/**
 * Generates random seed points for voronoi pattern
 */
function generateSeedPoints(count: number, seed: number): Array<Point3D> {
  const points: Array<Point3D> = [];
  
  // Simple seeded random number generator
  let random = seed;
  function nextRandom() {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  }
  
  for (let i = 0; i < count; i++) {
    points.push({
      x: (nextRandom() - 0.5) * 20,
      y: (nextRandom() - 0.5) * 20,
      z: (nextRandom() - 0.5) * 10
    });
  }
  
  return points;
}

/**
 * Creates an organic region around a seed point
 */
function createOrganicRegion(seedPoint: Point3D, index: number, allPoints: Array<Point3D>): Shape {
  // Calculate distances to other points for natural boundaries
  const avgDistance = calculateAverageDistance(seedPoint, allPoints);
  
  // Create base sphere with organic variation
  const baseRadius = Math.max(0.5, avgDistance * 0.4);
  
  // Add organic bumps and variations
  const organicElements: Array<Shape> = [];
  
  // Main cell body
  organicElements.push(
    sphere(baseRadius)
      .translate(seedPoint.x, seedPoint.y, seedPoint.z)
  );
  
  // Add smaller organic details
  for (let i = 0; i < 3 + (index % 4); i++) {
    const angle1 = (i / 3) * Math.PI * 2;
    const angle2 = ((i + index) / 5) * Math.PI;
    
    const x = seedPoint.x + Math.cos(angle1) * Math.sin(angle2) * baseRadius * 0.7;
    const y = seedPoint.y + Math.sin(angle1) * Math.sin(angle2) * baseRadius * 0.7;
    const z = seedPoint.z + Math.cos(angle2) * baseRadius * 0.5;
    
    const detail = sphere(baseRadius * (0.2 + (i % 3) * 0.1))
      .translate(x, y, z);
      
    organicElements.push(detail);
  }
  
  return union(organicElements);
}

/**
 * Calculates average distance to nearby points
 */
function calculateAverageDistance(point: Point3D, allPoints: Array<Point3D>): number {
  const distances = allPoints
    .filter(p => p !== point)
    .map(p => Math.sqrt(
      (p.x - point.x) ** 2 + 
      (p.y - point.y) ** 2 + 
      (p.z - point.z) ** 2
    ))
    .sort((a, b) => a - b)
    .slice(0, 3); // Take 3 nearest neighbors
    
  return distances.reduce((sum, d) => sum + d, 0) / distances.length;
}

/**
 * Creates a growth simulation structure
 */
export function createGrowthSimulation(steps: number): Shape {
  const elements: Array<Shape> = [];
  
  // Start with a seed
  let currentPoints: Array<Point3D> = [{ x: 0, y: 0, z: 0 }];
  
  for (let step = 0; step < steps; step++) {
    const newPoints: Array<Point3D> = [];
    
    // Each point can spawn new growth points
    for (const point of currentPoints) {
      const branchCount = 1 + Math.floor(Math.random() * 3);
      
      for (let branch = 0; branch < branchCount; branch++) {
        const angle = (branch / branchCount) * Math.PI * 2 + Math.random() * 0.5;
        const radius = 1 + step * 0.3;
        const height = Math.random() * 0.5 + 0.5;
        
        const newPoint: Point3D = {
          x: point.x + Math.cos(angle) * radius,
          y: point.y + Math.sin(angle) * radius,
          z: point.z + height
        };
        
        newPoints.push(newPoint);
        
        // Create connecting branch
        const branchThickness = 0.1 * (1 - step / steps);
        const branchElement = cylinder(branchThickness, radius)
          .translate(
            (point.x + newPoint.x) / 2,
            (point.y + newPoint.y) / 2,
            (point.z + newPoint.z) / 2
          );
          
        elements.push(branchElement);
        
        // Create node at new point
        const node = sphere(branchThickness * 2)
          .translate(newPoint.x, newPoint.y, newPoint.z);
          
        elements.push(node);
      }
    }
    
    currentPoints = newPoints;
  }
  
  return union(elements);
}

/**
 * Simple interface for 3D points
 */
interface Point3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * Main organic patterns showcase
 */
export default function createOrganicPatternsShowcase(): Shape {
  const patterns: Array<Shape> = [];
  
  // Honeycomb pattern
  const honeycomb = createHoneycombPattern({
    cellSize: 1.0,
    spacing: 2.0,
    variation: 0.3,
    layers: 3
  }).translate(-15, 0, 0);
  
  // Voronoi structure
  const voronoi = createVoronoiStructure(12345, 8)
    .translate(0, 0, 0);
  
  // Growth simulation
  const growth = createGrowthSimulation(6)
    .translate(15, 0, 0);
  
  patterns.push(honeycomb, voronoi, growth);
  
  return union(patterns);
}