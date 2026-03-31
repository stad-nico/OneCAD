# Educational Models Example

This example provides learning-focused 3D models perfect for STEM education, demonstrating mathematical concepts, scientific principles, and engineering fundamentals through interactive 3D visualization.

## Featured Models

### 1. Mathematical Shapes and Functions
- **File**: `models/math-functions.ts`  
- **Features**: Parametric equations, fractals, geometric progressions
- **Learning**: Mathematics visualization, function graphing, geometric concepts

### 2. Physics Demonstrations
- **File**: `models/physics-demo.ts`
- **Features**: Wave propagation, pendulum motion, gear ratios
- **Learning**: Physics principles, motion simulation, mechanical advantage

### 3. Chemical Molecular Models  
- **File**: `models/molecules.ts`
- **Features**: Atomic structures, molecular bonds, crystal lattices
- **Learning**: Chemistry concepts, 3D molecular visualization, bonding

### 4. Engineering Principles
- **File**: `models/engineering-basics.ts`
- **Features**: Beam deflection, stress visualization, structural elements
- **Learning**: Structural engineering, materials science, load analysis

## Educational Concepts

### Mathematics Visualization

#### Parametric Equations
```typescript
// Spiral visualization
function createSpiral(turns: number, height: number, radius: number) {
  const points: Point3D[] = [];
  const steps = turns * 50;
  
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * 2 * Math.PI;
    const x = radius * Math.cos(t);
    const y = radius * Math.sin(t);  
    const z = (height * i) / steps;
    points.push({ x, y, z });
  }
  
  return createPath(points);
}
```

#### Geometric Progressions
```typescript
// Fibonacci sequence visualization
function fibonacciSpiral(iterations: number) {
  let a = 1, b = 1;
  const rectangles: Rectangle[] = [];
  
  for (let i = 0; i < iterations; i++) {
    rectangles.push(createRectangle(a, b));
    [a, b] = [b, a + b];
  }
  
  return union(rectangles);
}
```

### Physics Simulations

#### Wave Propagation
```typescript
interface WaveParams {
  readonly amplitude: number;
  readonly frequency: number;
  readonly wavelength: number;
  readonly phase: number;
}

function createWave(params: WaveParams, time: number) {
  const points: Point3D[] = [];
  const length = 10 * params.wavelength;
  
  for (let x = 0; x <= length; x += 0.1) {
    const y = params.amplitude * Math.sin(
      (2 * Math.PI * x) / params.wavelength + 
      params.frequency * time + 
      params.phase
    );
    points.push({ x, y, z: 0 });
  }
  
  return createCurve(points);
}
```

#### Pendulum Motion
```typescript
function pendulumPosition(length: number, angle: number, time: number) {
  const g = 9.81; // gravity
  const omega = Math.sqrt(g / length); // angular frequency
  
  const theta = angle * Math.cos(omega * time);
  const x = length * Math.sin(theta);
  const y = -length * Math.cos(theta);
  
  return { x, y };
}
```

### Chemistry Models

#### Molecular Structures
```typescript
// Water molecule (H2O)
function createWaterMolecule() {
  const oxygen = sphere({ radius: 0.6 }).color('red');
  const hydrogen1 = sphere({ radius: 0.3 })
    .translate({ x: 0.96, y: 0, z: 0 })
    .color('white');
  const hydrogen2 = sphere({ radius: 0.3 })
    .translate({ x: -0.24, y: 0.93, z: 0 })
    .color('white');
  
  // Bond visualization
  const bond1 = cylinder({ radius: 0.05, height: 0.96 })
    .rotateY(Math.PI / 2)
    .translate({ x: 0.48, y: 0, z: 0 })
    .color('gray');
  
  const bond2 = cylinder({ radius: 0.05, height: 0.96 })
    .rotateZ(-Math.PI / 4)
    .translate({ x: -0.12, y: 0.465, z: 0 })
    .color('gray');
  
  return union([oxygen, hydrogen1, hydrogen2, bond1, bond2]);
}
```

#### Crystal Lattices
```typescript
// Cubic crystal structure
function createCubicLattice(size: number, spacing: number) {
  const atoms: Sphere[] = [];
  
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        const atom = sphere({ radius: 0.2 })
          .translate({ 
            x: x * spacing, 
            y: y * spacing, 
            z: z * spacing 
          })
          .color(getAtomColor(x + y + z));
        atoms.push(atom);
      }
    }
  }
  
  return union(atoms);
}
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server  
npm run dev

# Access interactive models at http://localhost:3000
```

## Interactive Features

### Parameter Controls
Each model includes interactive controls for real-time exploration:

```typescript
// Example: Interactive wave parameters
export const waveControls = {
  amplitude: { min: 0.1, max: 2.0, step: 0.1, default: 1.0 },
  frequency: { min: 0.5, max: 5.0, step: 0.1, default: 1.0 },
  wavelength: { min: 1.0, max: 10.0, step: 0.5, default: 4.0 },
  phase: { min: 0, max: 2 * Math.PI, step: 0.1, default: 0 }
};
```

### Animation Support
Models can be animated to show dynamic concepts:

```typescript
// Animated pendulum
function animatedPendulum(time: number) {
  const position = pendulumPosition(5, Math.PI / 6, time);
  
  return group([
    // Pendulum bob
    sphere({ radius: 0.2 })
      .translate({ x: position.x, y: position.y, z: 0 })
      .color('blue'),
    
    // Pendulum string  
    line({ 
      from: { x: 0, y: 0, z: 0 },
      to: { x: position.x, y: position.y, z: 0 }
    }).color('black')
  ]);
}
```

## Curriculum Integration

### Grade Level Alignment

#### Elementary (K-5)
- **Basic Shapes**: Geometric primitives and combinations
- **Simple Patterns**: Repeating structures and symmetry
- **Color and Size**: Visual learning concepts

#### Middle School (6-8)  
- **Coordinate Systems**: 3D coordinate understanding
- **Mathematical Functions**: Linear and quadratic visualization
- **Simple Physics**: Basic motion and force concepts

#### High School (9-12)
- **Advanced Mathematics**: Trigonometry, calculus concepts
- **Physics Principles**: Wave mechanics, pendulum motion
- **Chemistry Basics**: Molecular structure, bonding

#### College/University
- **Engineering Applications**: Stress analysis, structural design
- **Advanced Physics**: Complex wave interactions, quantum concepts
- **Mathematical Modeling**: Parametric equations, differential equations

### Lesson Plan Integration

#### Example Lesson: Wave Properties
```typescript
// Lesson objectives covered by wave model:
// 1. Understand amplitude, frequency, wavelength relationships
// 2. Visualize wave interference patterns  
// 3. Explore Doppler effect concepts
// 4. Connect mathematics to physical phenomena

const lessonActivities = {
  introduction: "Create simple sine wave",
  exploration: "Modify parameters and observe changes", 
  application: "Model real-world wave phenomena",
  assessment: "Predict wave behavior from parameters"
};
```

## Assessment Tools

### Interactive Quizzes
Built-in assessment capabilities with instant feedback:

```typescript
// Example quiz question
interface QuizQuestion {
  readonly question: string;
  readonly modelParams: Record<string, number>;
  readonly correctAnswer: string;
  readonly explanation: string;
}

const waveQuiz: QuizQuestion = {
  question: "If frequency doubles, what happens to wavelength?",
  modelParams: { frequency: 2, wavelength: 2 },
  correctAnswer: "Wavelength halves",
  explanation: "Wave speed = frequency × wavelength (constant)"
};
```

### Progress Tracking
Monitor student understanding through interaction patterns:

```typescript
// Track student interactions
interface StudentProgress {
  readonly studentId: string;
  readonly modelInteractions: ModelInteraction[];
  readonly quizResults: QuizResult[];
  readonly timeSpent: number;
  readonly conceptsMastered: string[];
}
```

## Teacher Resources

### Classroom Setup
- **Hardware**: Computers with WebGL support, projectors for group viewing
- **Software**: Web browser (Chrome recommended), no additional installation
- **Network**: Basic internet for initial loading, can work offline afterward

### Implementation Guide
1. **Preparation**: Review models and concepts beforehand
2. **Introduction**: Start with simple shapes, build complexity gradually
3. **Guided Exploration**: Use parameter controls to demonstrate concepts
4. **Student Investigation**: Allow hands-on exploration time
5. **Discussion**: Connect observations to theoretical knowledge
6. **Assessment**: Use built-in quizzes and activities

## Files Structure

```
educational-models/
├── models/
│   ├── math-functions.ts     # Mathematical visualizations
│   ├── physics-demo.ts       # Physics simulations  
│   ├── molecules.ts          # Chemistry models
│   ├── engineering-basics.ts # Engineering concepts
│   └── interactive-demos.ts  # Combined demonstrations
├── src/
│   ├── controls/             # Interactive parameter controls
│   ├── animations/           # Animation systems
│   ├── quizzes/             # Assessment tools
│   └── curriculum/          # Lesson plan integration
├── lessons/
│   ├── elementary/          # K-5 lesson plans
│   ├── middle-school/       # 6-8 lesson plans  
│   ├── high-school/         # 9-12 lesson plans
│   └── college/             # University level content
├── docs/
│   ├── teacher-guide.md     # Instructor documentation
│   ├── student-guide.md     # Student instructions
│   └── curriculum-map.md    # Standards alignment
├── screenshots/             # Model previews
├── package.json
└── README.md
```

## Standards Alignment

### Next Generation Science Standards (NGSS)
- **K-2-ETS1-1**: Engineering design process
- **3-5-ETS1-2**: Solutions to design problems  
- **MS-PS4-1**: Wave properties and interactions
- **HS-PS4-1**: Mathematical wave models

### Common Core Mathematics
- **Geometry**: Spatial reasoning and 3D visualization
- **Algebra**: Function relationships and transformations
- **Statistics**: Data analysis and interpretation

### International Baccalaureate (IB)
- **Mathematics**: Mathematical modeling and applications
- **Physics**: Experimental physics and data analysis
- **Chemistry**: Molecular modeling and structure

## Next Steps

After exploring these educational models:

1. **Customize Content**: Adapt models for specific curriculum needs
2. **Create Assessments**: Develop custom quizzes and activities
3. **Expand Collection**: Add models for additional topics
4. **Student Projects**: Have students create their own models
5. **Share Resources**: Contribute new educational content back to community

## Support and Resources

- **Teacher Training**: Professional development workshops available
- **Curriculum Consultants**: Help with standards alignment
- **Technical Support**: Assistance with implementation
- **Community Forums**: Connect with other educators
- **Regular Updates**: New educational content released monthly