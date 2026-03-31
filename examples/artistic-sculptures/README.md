# Artistic Sculptures Example

This example explores the creative and artistic possibilities of OpenTSCAD, demonstrating how to create beautiful, complex sculptural forms using mathematical principles, generative algorithms, and artistic vision.

## Featured Sculptures

### 1. Parametric Spirals and Helices
- **File**: `models/spiral-art.ts`
- **Features**: Golden ratio spirals, DNA helices, artistic variations
- **Learning**: Mathematical beauty, organic forms, parametric art

### 2. Fractal Geometries
- **File**: `models/fractals.ts`  
- **Features**: Mandelbrot sets, Julia sets, recursive patterns
- **Learning**: Infinite complexity, self-similarity, computational art

### 3. Voronoi and Cellular Patterns
- **File**: `models/organic-patterns.ts`
- **Features**: Natural cell structures, honeycomb patterns, growth simulation
- **Learning**: Biomimicry, natural algorithms, procedural generation

### 4. Abstract Geometric Forms
- **File**: `models/geometric-art.ts`
- **Features**: Platonic solids, tessellations, impossible objects
- **Learning**: Pure geometry, mathematical relationships, visual paradoxes

## Artistic Techniques

### Mathematical Beauty

#### Golden Ratio Applications
```typescript
const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio

// Golden spiral
function createGoldenSpiral(turns: number) {
  const points: Point3D[] = [];
  const steps = turns * 100;
  
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * turns * 2 * Math.PI;
    const radius = Math.pow(PHI, angle / (Math.PI / 2));
    
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const z = angle * 0.1; // Height variation
    
    points.push({ x, y, z });
  }
  
  return createTube(points, 0.1);
}
```

#### Fibonacci Sequences
```typescript
// Fibonacci-based sculpture
function fibonacciTower(levels: number) {
  let a = 1, b = 1;
  const elements: Shape[] = [];
  
  for (let i = 0; i < levels; i++) {
    const size = b * 0.1;
    const height = a * 0.05;
    const angle = (i * 137.5) * (Math.PI / 180); // Golden angle
    
    const element = cube({ size: [size, size, height] })
      .rotateZ(angle)
      .translate({ z: i * height })
      .color(getHueFromFibonacci(i));
    
    elements.push(element);
    [a, b] = [b, a + b];
  }
  
  return union(elements);
}
```

### Generative Algorithms

#### L-System Growth
```typescript
// Lindenmayer system for organic growth
interface LSystemRule {
  readonly symbol: string;
  readonly replacement: string;
}

function generateLSystem(
  axiom: string, 
  rules: LSystemRule[], 
  iterations: number
): string {
  let current = axiom;
  
  for (let i = 0; i < iterations; i++) {
    current = current.split('').map(char => {
      const rule = rules.find(r => r.symbol === char);
      return rule ? rule.replacement : char;
    }).join('');
  }
  
  return current;
}

// Tree-like structure
const treeRules: LSystemRule[] = [
  { symbol: 'A', replacement: 'A[+A][-A]' },
  { symbol: '[', replacement: '[' },
  { symbol: ']', replacement: ']' },
  { symbol: '+', replacement: '+' },
  { symbol: '-', replacement: '-' }
];
```

#### Perlin Noise Landscapes
```typescript
// Organic surface generation
function createPerlinSurface(width: number, height: number, detail: number) {
  const vertices: Vertex[] = [];
  
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const noiseValue = perlinNoise(x / detail, y / detail, 0);
      const z = noiseValue * 5; // Amplitude
      
      vertices.push({
        position: { x, y, z },
        normal: calculateNormal(x, y, noiseValue),
        color: getColorFromHeight(z)
      });
    }
  }
  
  return createMesh(vertices);
}
```

### Color and Texture

#### Procedural Coloring
```typescript
// HSV color space for smooth transitions
function createColorSpiral(turns: number) {
  return createSpiral(turns).modifyVertices((vertex, index) => ({
    ...vertex,
    color: {
      h: (index / totalVertices) * 360, // Hue rotation
      s: 0.8, // Saturation
      v: 0.9  // Value/brightness
    }
  }));
}

// Gradient coloring based on height
function applyHeightGradient(shape: Shape) {
  return shape.modifyVertices(vertex => ({
    ...vertex,
    color: interpolateColor(
      { r: 0.2, g: 0.4, b: 0.8 }, // Blue (low)
      { r: 0.9, g: 0.2, b: 0.1 }, // Red (high)
      (vertex.position.z + 5) / 10  // Normalize height
    )
  }));
}
```

#### Texture Patterns
```typescript
// Procedural texture generation
function createWoodTexture(rings: number, noise: number) {
  return function(position: Point3D): Color {
    const distance = Math.sqrt(position.x ** 2 + position.y ** 2);
    const ringValue = Math.sin(distance * rings * Math.PI);
    const noiseValue = perlinNoise(position.x, position.y, position.z) * noise;
    
    const intensity = (ringValue + noiseValue + 1) / 2;
    
    return {
      r: 0.4 + intensity * 0.3,
      g: 0.2 + intensity * 0.2,
      b: 0.1 + intensity * 0.1
    };
  };
}
```

## Creative Workflows

### Iterative Development

#### Parametric Exploration
```typescript
// Create variations of the same concept
function createSculptureVariation(params: SculptureParams) {
  const baseForm = createBaseForm(params);
  
  // Apply different transformations
  const variations = [
    baseForm.scale({ x: 1, y: 1, z: params.heightScale }),
    baseForm.twist(params.twistAngle),
    baseForm.bend(params.bendRadius),
    baseForm.array(params.arrayCount, params.arraySpacing)
  ];
  
  return union(variations);
}

// Batch generation for exploration
function exploreDesignSpace() {
  const variations: Shape[] = [];
  
  for (let twist = 0; twist <= 360; twist += 45) {
    for (let scale = 0.5; scale <= 2.0; scale += 0.5) {
      const params = { twistAngle: twist, heightScale: scale };
      variations.push(createSculptureVariation(params));
    }
  }
  
  return arrangeInGrid(variations, 3, 3);
}
```

#### Randomized Generation
```typescript
// Controlled randomness for artistic variation
function createRandomSculpture(seed: number) {
  const random = new SeededRandom(seed);
  
  const params = {
    complexity: random.range(3, 12),
    twist: random.range(0, 720),
    scale: random.range(0.3, 3.0),
    colorShift: random.range(0, 360),
    pattern: random.choice(['spiral', 'radial', 'organic'])
  };
  
  return generateFromParams(params);
}
```

### Animation and Motion

#### Kinetic Sculptures
```typescript
// Time-based transformations for dynamic art
function animatedSculpture(time: number) {
  const rotationSpeed = 0.5;
  const breathingRate = 2.0;
  const colorCycle = 1.0;
  
  return createBaseSculpture()
    .rotateY(time * rotationSpeed)
    .scale({
      x: 1 + Math.sin(time * breathingRate) * 0.1,
      y: 1 + Math.sin(time * breathingRate) * 0.1,
      z: 1
    })
    .modifyColors(color => ({
      ...color,
      h: (color.h + time * colorCycle * 60) % 360
    }));
}
```

#### Morphing Sequences
```typescript
// Smooth transitions between forms
function morphingSculpture(time: number, duration: number) {
  const t = (Math.sin(time / duration * Math.PI * 2) + 1) / 2; // 0 to 1
  
  const form1 = createCubeForm();
  const form2 = createSphereForm();
  
  return interpolateShapes(form1, form2, t);
}
```

## Installation and Display

### 3D Printing Considerations

#### Structural Integrity
```typescript
// Add support structures for complex overhangs
function addPrintSupports(sculpture: Shape) {
  return sculpture.union(
    generateSupports({
      overhangAngle: 45,
      supportDensity: 0.2,
      supportHeight: 0.3
    })
  );
}

// Optimize for printing orientation
function optimizeForPrinting(sculpture: Shape) {
  const analysis = analyzeGeometry(sculpture);
  const optimalRotation = findBestPrintOrientation(analysis);
  
  return sculpture.rotate(optimalRotation);
}
```

#### Material Considerations
```typescript
// Adjust design based on material properties
interface MaterialProperties {
  readonly minWallThickness: number;
  readonly maxOverhang: number;
  readonly supportRequired: boolean;
  readonly shrinkageFactor: number;
}

function adaptForMaterial(sculpture: Shape, material: MaterialProperties) {
  return sculpture
    .ensureMinimumThickness(material.minWallThickness)
    .adjustForShrinkage(material.shrinkageFactor)
    .addSupportsIf(material.supportRequired);
}
```

### Scale and Proportion

#### Human Scale Integration
```typescript
// Design sculptures that relate to human proportions
const HUMAN_SCALE = {
  height: 1700,        // Average human height (mm)
  armSpan: 1700,       // Arm span
  reachHeight: 2100,   // Vertical reach
  eyeLevel: 1600       // Eye level height
};

function scaleForHuman(sculpture: Shape, targetHeight: number) {
  const currentBounds = getBoundingBox(sculpture);
  const scaleFactor = targetHeight / currentBounds.height;
  
  return sculpture.scale(scaleFactor);
}
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Generate sculpture variations
npm run generate

# Export for 3D printing
npm run export
```

## Creative Exercises

### Beginner Projects
1. **Twisted Tower**: Start with a cylinder, add twist and taper
2. **Spiral Garden**: Create flowing organic forms using curves
3. **Geometric Mandala**: Combine basic shapes in radial patterns
4. **Color Wave**: Explore color gradients and transitions

### Intermediate Projects  
1. **Fractal Tree**: Implement recursive branching algorithms
2. **Voronoi Vessel**: Create organic container forms
3. **Parametric Pavilion**: Design architectural sculptural forms
4. **Dynamic Sculpture**: Add time-based animation

### Advanced Projects
1. **Generative System**: Build custom algorithmic creation tools
2. **Interactive Installation**: Respond to user input or sensors
3. **Multi-Material Assembly**: Combine different materials and properties
4. **Large-Scale Monument**: Design for architectural integration

## Files Structure

```
artistic-sculptures/
├── models/
│   ├── spiral-art.ts         # Parametric spirals and helices
│   ├── fractals.ts           # Fractal geometries
│   ├── organic-patterns.ts   # Natural and cellular forms
│   ├── geometric-art.ts      # Abstract geometric sculptures
│   └── kinetic-sculptures.ts # Animated and moving forms
├── src/
│   ├── algorithms/           # Generative algorithms
│   ├── color/               # Color and texture systems
│   ├── animation/           # Motion and transformation
│   └── export/              # Output and fabrication tools
├── examples/
│   ├── beginner/            # Simple starter projects
│   ├── intermediate/        # More complex explorations
│   └── advanced/            # Professional-level work
├── docs/
│   ├── creative-process.md  # Artistic workflow guide
│   ├── fabrication.md       # Making physical sculptures
│   └── exhibition.md        # Display and presentation
├── gallery/                 # Completed sculpture images
├── package.json
└── README.md
```

## Inspiration and Resources

### Mathematical Art
- **Bridges Conference**: Mathematics and art intersection
- **Sacred Geometry**: Ancient mathematical principles in art
- **Algorithmic Art**: Computer-generated creative works
- **Parametric Architecture**: Computational design in buildings

### Artist References
- **Bathsheba Grossman**: Mathematical sculpture pioneer
- **Keenan Crane**: Geometric processing researcher
- **Nervous System**: Generative jewelry and sculpture
- **Michael Hansmeyer**: Computational architecture

### Technical Resources
- **Processing/p5.js**: Creative coding fundamentals
- **Grasshopper/Rhino**: Parametric design tools
- **Blender Geometry Nodes**: Procedural 3D modeling
- **TouchDesigner**: Real-time generative systems

## Next Steps

After exploring artistic sculptures:

1. **Develop Personal Style**: Find your unique aesthetic approach
2. **Learn New Algorithms**: Explore advanced generative techniques
3. **Physical Creation**: Move from digital to physical fabrication
4. **Exhibition Preparation**: Present work in galleries or online
5. **Community Engagement**: Share and collaborate with other artists

## Community and Sharing

- **Online Gallery**: Submit your sculptures for community showcase
- **Artist Collaboration**: Connect with other creative technologists
- **Open Source Contribution**: Share algorithms and techniques
- **Teaching Opportunities**: Help others learn creative coding
- **Exhibition Support**: Assistance with physical installation and display