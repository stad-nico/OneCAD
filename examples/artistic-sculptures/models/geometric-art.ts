import { cube, sphere, cylinder, union, Shape } from '@opentscad/core';

/**
 * Geometric Art - Abstract geometric sculptures and mathematical forms
 * Demonstrates platonic solids, tessellations, and impossible objects
 */

/**
 * Creates the five Platonic solids (tetrahedron, cube, octahedron, dodecahedron, icosahedron)
 */
export function createPlatonicSolids(): Shape {
  const solids: Shape[] = [];
  const spacing = 6;
  
  // Tetrahedron (approximated with spheres at vertices)
  const tetrahedron = createTetrahedron(2).translate(-2 * spacing, 0, 0);
  
  // Cube 
  const cubeShape = cube(2).translate(-spacing, 0, 0);
  
  // Octahedron (approximated)
  const octahedron = createOctahedron(2).translate(0, 0, 0);
  
  // Dodecahedron (approximated with spherical arrangement)
  const dodecahedron = createDodecahedron(2).translate(spacing, 0, 0);
  
  // Icosahedron (approximated)
  const icosahedron = createIcosahedron(2).translate(2 * spacing, 0, 0);
  
  solids.push(tetrahedron, cubeShape, octahedron, dodecahedron, icosahedron);
  
  return union(solids);
}

/**
 * Creates an approximation of a tetrahedron using spheres at vertices
 */
function createTetrahedron(size: number): Shape {
  const vertices: Shape[] = [];
  const radius = size / 4;
  
  // Tetrahedron vertices
  const height = size * Math.sqrt(2/3);
  
  vertices.push(
    sphere(radius).translate(0, -size/2, -height/3),
    sphere(radius).translate(-size/2, size/4, -height/3),
    sphere(radius).translate(size/2, size/4, -height/3),
    sphere(radius).translate(0, 0, height * 2/3)
  );
  
  // Add edges
  const edges: Shape[] = [];
  const edgeRadius = radius / 3;
  
  // Bottom triangle edges
  edges.push(
    cylinder(edgeRadius, size * 0.866)
      .translate(-size/4, -size/8, -height/3),
    cylinder(edgeRadius, size * 0.866)
      .translate(size/4, -size/8, -height/3),
    cylinder(edgeRadius, size)
      .translate(0, size/4, -height/3)
  );
  
  return union([...vertices, ...edges]);
}

/**
 * Creates an approximation of an octahedron
 */
function createOctahedron(size: number): Shape {
  const faces: Shape[] = [];
  const faceThickness = size / 20;
  
  // Create 8 triangular faces
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const x = Math.cos(angle) * size * 0.7;
    const y = Math.sin(angle) * size * 0.7;
    
    // Top pyramid faces
    faces.push(
      cube(faceThickness, size * 0.8, size * 0.8)
        .translate(x, y, size/2)
    );
    
    // Bottom pyramid faces  
    faces.push(
      cube(faceThickness, size * 0.8, size * 0.8)
        .translate(x, y, -size/2)
    );
  }
  
  return union(faces);
}

/**
 * Creates an approximation of a dodecahedron using spherical arrangement
 */
function createDodecahedron(size: number): Shape {
  const faces: Shape[] = [];
  const faceSize = size / 3;
  
  // Golden ratio for pentagon construction
  const phi = (1 + Math.sqrt(5)) / 2;
  
  // Create 12 pentagonal faces (approximated as small cubes)
  for (let i = 0; i < 12; i++) {
    const angle1 = (i / 6) * Math.PI;
    const angle2 = ((i % 2) * Math.PI) / 3;
    
    const radius = size * 0.8;
    const x = radius * Math.cos(angle1) * Math.cos(angle2);
    const y = radius * Math.sin(angle1) * Math.cos(angle2);
    const z = radius * Math.sin(angle2);
    
    faces.push(
      cube(faceSize)
        .translate(x, y, z)
    );
  }
  
  return union(faces);
}

/**
 * Creates an approximation of an icosahedron
 */
function createIcosahedron(size: number): Shape {
  const vertices: Shape[] = [];
  const radius = size / 8;
  
  // Golden ratio for icosahedron construction  
  const phi = (1 + Math.sqrt(5)) / 2;
  const scale = size / 2;
  
  // 12 vertices of icosahedron
  const coords = [
    [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0],
    [0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi],
    [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1]
  ];
  
  for (const [x, y, z] of coords) {
    vertices.push(
      sphere(radius)
        .translate(x * scale, y * scale, z * scale)
    );
  }
  
  return union(vertices);
}

/**
 * Creates a geometric tessellation pattern
 */
export function createTessellation(): Shape {
  const tiles: Shape[] = [];
  const tileSize = 1.5;
  const spacing = tileSize * 1.1;
  
  // Hexagonal tessellation
  for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
      const offsetX = (j % 2) * (spacing / 2);
      const x = i * spacing + offsetX;
      const y = j * spacing * 0.866; // √3/2 for hexagonal spacing
      
      // Alternate between different geometric shapes
      let tile: Shape;
      const pattern = (i + j) % 3;
      
      switch (pattern) {
        case 0:
          tile = createHexagonalTile(tileSize);
          break;
        case 1:
          tile = createTriangularTile(tileSize);
          break;
        default:
          tile = createSquareTile(tileSize);
      }
      
      tiles.push(tile.translate(x, y, 0));
    }
  }
  
  return union(tiles);
}

/**
 * Creates a hexagonal tile
 */
function createHexagonalTile(size: number): Shape {
  const segments: Shape[] = [];
  const thickness = size / 10;
  
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = Math.cos(angle) * size * 0.8;
    const y = Math.sin(angle) * size * 0.8;
    
    segments.push(
      cylinder(thickness, thickness * 2)
        .translate(x, y, 0)
    );
  }
  
  return union(segments);
}

/**
 * Creates a triangular tile
 */
function createTriangularTile(size: number): Shape {
  const vertices: Shape[] = [];
  const radius = size / 8;
  
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const x = Math.cos(angle) * size;
    const y = Math.sin(angle) * size;
    
    vertices.push(
      sphere(radius)
        .translate(x, y, 0)
    );
  }
  
  return union(vertices);
}

/**
 * Creates a square tile
 */
function createSquareTile(size: number): Shape {
  return cube(size, size, size / 5);
}

/**
 * Creates an impossible object (Penrose triangle)
 */
export function createImpossibleObject(): Shape {
  const segments: Shape[] = [];
  const beamSize = 0.8;
  const radius = 4;
  
  // Create three beams that appear to form an impossible triangle
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    
    // Each beam is rotated and positioned to create the illusion
    const beam = cube(beamSize, radius * 2, beamSize)
      .translate(0, 0, 0);
    
    const rotatedBeam = beam
      .translate(Math.cos(angle) * radius, Math.sin(angle) * radius, i * beamSize * 0.3);
    
    segments.push(rotatedBeam);
  }
  
  return union(segments);
}

/**
 * Creates a spiral staircase geometric form
 */
export function createSpiralStaircase(): Shape {
  const steps: Shape[] = [];
  const stepCount = 24;
  const radius = 5;
  const stepWidth = 1.5;
  const stepHeight = 0.3;
  const totalHeight = 8;
  
  for (let i = 0; i < stepCount; i++) {
    const angle = (i / stepCount) * Math.PI * 4; // 2 full rotations
    const height = (i / stepCount) * totalHeight;
    
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    const step = cube(stepWidth, stepWidth, stepHeight)
      .translate(x, y, height);
    
    steps.push(step);
  }
  
  // Add central support column
  const column = cylinder(0.5, totalHeight)
    .translate(0, 0, totalHeight / 2);
  
  steps.push(column);
  
  return union(steps);
}

/**
 * Creates a fractal cube structure (Menger sponge iteration)
 */
export function createFractalCube(iterations: number = 2): Shape {
  let currentCubes: Shape[] = [cube(6)];
  
  for (let iter = 0; iter < iterations; iter++) {
    const newCubes: Shape[] = [];
    
    for (const currentCube of currentCubes) {
      // Divide each cube into 27 smaller cubes and remove the middle ones
      const subdivisions = subdivideAndRemoveMiddle(currentCube, 3);
      newCubes.push(...subdivisions);
    }
    
    currentCubes = newCubes;
  }
  
  return union(currentCubes);
}

/**
 * Subdivides a cube and removes middle sections for fractal generation
 */
function subdivideAndRemoveMiddle(baseCube: Shape, divisions: number): Shape[] {
  const subcubes: Shape[] = [];
  const size = 6 / Math.pow(divisions, 2); // Assuming base size of 6
  
  for (let x = 0; x < divisions; x++) {
    for (let y = 0; y < divisions; y++) {
      for (let z = 0; z < divisions; z++) {
        // Skip middle cubes to create the fractal pattern
        const isMiddle = (x === 1 && (y === 1 || z === 1)) || 
                        (y === 1 && z === 1);
        
        if (!isMiddle) {
          const offsetX = (x - 1) * size;
          const offsetY = (y - 1) * size;
          const offsetZ = (z - 1) * size;
          
          subcubes.push(
            cube(size)
              .translate(offsetX, offsetY, offsetZ)
          );
        }
      }
    }
  }
  
  return subcubes;
}

/**
 * Main geometric art showcase
 */
export default function createGeometricArtShowcase(): Shape {
  const artworks: Shape[] = [];
  
  // Platonic solids
  const platonics = createPlatonicSolids()
    .translate(0, 20, 0);
  
  // Tessellation
  const tessellation = createTessellation()
    .translate(0, 0, 0);
  
  // Impossible object  
  const impossible = createImpossibleObject()
    .translate(20, 10, 5);
  
  // Spiral staircase
  const spiral = createSpiralStaircase()
    .translate(-20, 10, 0);
  
  // Fractal cube
  const fractal = createFractalCube(2)
    .translate(0, -20, 0);
  
  artworks.push(platonics, tessellation, impossible, spiral, fractal);
  
  return union(artworks);
}