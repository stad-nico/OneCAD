# My OpenTSCAD Project

This project contains 3D models built with OpenTSCAD, a TypeScript-based parametric CAD system.

## Getting Started

### Development Mode
Run the development server with hot reloading:

```bash
npm run dev
```

This will:
1. Connect to the OpenTSCAD server
2. Watch for changes in your model files
3. Automatically recompile and update the 3D visualization

### Building Models
Compile all models for production:

```bash
npm run build
```

## Project Structure

```
├── models/                    # Your 3D model files
│   ├── components/           # Reusable components
│   ├── assemblies/          # Complex multi-part models
│   └── example.model.ts     # Simple example model
├── opentscad.config.json    # Project configuration
├── package.json             # Project dependencies
└── README.md               # This file
```

## Model Development

### Creating a New Model

1. Create a new `.model.ts` file in the `models/` directory
2. Import the required functions from `@opentscad/core`
3. Export a default function that returns a Shape

```typescript
import { box, cylinder, difference } from '@opentscad/core';

export default function myComponent() {
  const base = box(50, 30, 10);
  const hole = cylinder(5, 15).translate([25, 15, 0]);
  
  return difference(base, hole);
}
```

### Parametric Models

Create reusable parametric components:

```typescript
interface BracketParams {
  width: number;
  height: number;
  thickness: number;
  holeSize: number;
}

export default function bracket(params: BracketParams) {
  const { width, height, thickness, holeSize } = params;
  
  const plate = box(width, height, thickness);
  const hole = cylinder(holeSize / 2, thickness + 1)
    .translate([width / 2, height / 2, -0.5]);
  
  return difference(plate, hole);
}
```

### Available Operations

OpenTSCAD provides a comprehensive set of 3D operations:

- **Primitives**: `box()`, `cylinder()`, `sphere()`, `cone()`
- **2D Shapes**: `circle()`, `rectangle()`, `polygon()`
- **Transformations**: `translate()`, `rotate()`, `scale()`, `mirror()`
- **Boolean Operations**: `union()`, `difference()`, `intersection()`
- **Advanced**: `extrude()`, `revolve()`, `sweep()`, `loft()`

## Configuration

Edit `opentscad.config.json` to customize your project:

```json
{
  "name": "My Project",
  "description": "Custom 3D models",
  "server": {
    "host": "localhost",
    "port": 5174
  },
  "models": {
    "include": ["models/**/*.model.ts"],
    "exclude": ["**/test/**"]
  }
}
```

## Documentation

- [OpenTSCAD Documentation](https://opentscad.dev/docs)
- [API Reference](https://opentscad.dev/api)
- [Examples](https://github.com/opentscad/examples)

## Support

- [GitHub Issues](https://github.com/your-org/opentscad/issues)
- [Community Forum](https://github.com/your-org/opentscad/discussions)
- [Documentation](https://opentscad.dev)

Happy modeling! 🎯