# Mechanical Parts Example

This example demonstrates creating functional mechanical components with proper engineering tolerances, fits, and assemblies. Perfect for 3D printing and mechanical prototyping.

## Featured Models

### 1. Bearing Housing Assembly
- **File**: `models/bearing-housing.ts`
- **Features**: Standard bearing fits, mounting holes, tolerance management
- **Learning**: Mechanical tolerances, assembly design, standard parts integration

### 2. Parametric Gear System  
- **File**: `models/gear-system.ts`
- **Features**: Involute gear profiles, gear ratios, parametric design
- **Learning**: Mathematical modeling, parametric design, mechanical transmission

### 3. Linear Actuator
- **File**: `models/linear-actuator.ts`
- **Features**: Moving assemblies, clearances, mechanical constraints
- **Learning**: Kinematic design, moving parts, assembly animation

### 4. Threaded Fasteners
- **File**: `models/fasteners.ts`
- **Features**: ISO metric threads, hex heads, standard dimensions
- **Learning**: Thread modeling, standards compliance, fastener design

## Engineering Concepts Demonstrated

### Tolerances and Fits
```typescript
// Example: Bearing fit with proper tolerance
const bearingOD = 22.0;
const housingID = bearingOD + 0.025; // H7 fit
const housing = cylinder({ radius: housingID / 2, height: 10 });
```

### Parametric Design
```typescript
// Configurable gear parameters
interface GearParams {
  readonly module: number;        // Gear module (mm)
  readonly teeth: number;         // Number of teeth
  readonly pressureAngle: number; // Pressure angle (degrees)
  readonly addendum: number;      // Addendum coefficient
  readonly dedendum: number;      // Dedendum coefficient
}
```

### Standard Components
```typescript
// Standard bearing dimensions from ISO 492
const bearingSpecs = {
  608: { inner: 8, outer: 22, width: 7 },
  6001: { inner: 12, outer: 28, width: 8 },
  6200: { inner: 10, outer: 30, width: 9 }
} as const;
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Key Learning Objectives

1. **Engineering Tolerances**: Understanding fit types (clearance, transition, interference)
2. **Parametric Modeling**: Creating configurable designs that scale properly  
3. **Standard Parts**: Using industry-standard dimensions and specifications
4. **Assembly Design**: Creating parts that fit together correctly
5. **Manufacturing Constraints**: Designing for 3D printing and machining

## Advanced Features

### Custom Tolerance System
The project includes a comprehensive tolerance management system:

```typescript
// Tolerance grades for different fit types
enum ToleranceGrade {
  H6 = 'H6',  // Precision fit
  H7 = 'H7',  // Close fit  
  H8 = 'H8',  // Medium fit
  H9 = 'H9',  // Loose fit
}

function applyTolerance(nominal: number, grade: ToleranceGrade): number {
  const toleranceValues = {
    H6: 0.009,
    H7: 0.015, 
    H8: 0.022,
    H9: 0.036
  };
  
  return nominal + toleranceValues[grade];
}
```

### Gear Profile Mathematics
Accurate involute gear tooth profiles using mathematical principles:

```typescript
function generateInvoluteProfile(
  module: number,
  teeth: number, 
  pressureAngle: number
): Point[] {
  const baseRadius = (module * teeth * Math.cos(pressureAngle)) / 2;
  const addendumRadius = (module * teeth) / 2 + module;
  
  const points: Point[] = [];
  
  for (let t = 0; t <= maxInvoluteAngle; t += stepSize) {
    const x = baseRadius * (Math.cos(t) + t * Math.sin(t));
    const y = baseRadius * (Math.sin(t) - t * Math.cos(t));
    points.push({ x, y });
  }
  
  return points;
}
```

## Manufacturing Guidelines

### 3D Printing Considerations
- **Minimum wall thickness**: 0.8mm
- **Overhangs**: Avoid angles > 45° without support
- **Tolerances**: Add 0.1-0.2mm clearance for moving parts
- **Threads**: Use insert threads for strength

### Machining Considerations  
- **Tool access**: Ensure cutting tool clearance
- **Fixture points**: Include clamping surfaces
- **Material removal**: Minimize waste and machining time
- **Surface finish**: Specify required surface roughness

## Files Structure

```
mechanical-parts/
├── models/
│   ├── bearing-housing.ts    # Bearing housing with standard fits
│   ├── gear-system.ts        # Parametric gear train
│   ├── linear-actuator.ts    # Moving assembly example
│   ├── fasteners.ts          # Standard bolts and screws
│   └── assembly.ts           # Complete assembly
├── src/
│   ├── utils/
│   │   ├── tolerances.ts     # Tolerance management system
│   │   ├── standards.ts      # Industry standard dimensions
│   │   └── math.ts           # Mathematical utilities
│   └── types/
│       └── mechanical.ts     # Type definitions
├── docs/
│   ├── tolerances.md         # Tolerance guide
│   ├── standards.md          # Standards reference
│   └── assembly-guide.md     # Assembly instructions
├── screenshots/              # Model images
├── package.json
├── tsconfig.json
└── README.md
```

## Next Steps

After completing this example, try:

1. **Modify Parameters**: Change gear ratios, bearing sizes, tolerances
2. **Add Features**: Include keyways, set screws, or locking mechanisms
3. **Create Variations**: Design different housing styles or mounting options
4. **Analyze Motion**: Study gear engagement and assembly kinematics
5. **Optimize for Manufacturing**: Adapt for specific manufacturing processes

## Resources

- [ISO Tolerance Standards](https://www.iso.org/standard/3631.html)
- [Machinery's Handbook](https://www.industrialpress.com/machinery-s-handbook)
- [Gear Design Fundamentals](https://www.gearseds.org/files/fundamentals_of_gear_design.pdf)
- [3D Printing Design Guidelines](https://formlabs.com/blog/3d-printing-design-guide/)