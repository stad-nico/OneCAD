# 🚀 Getting Started with OpenTSCAD

Now that OpenTSCAD is properly modernized, here's how you can start using it:

## 📋 Prerequisites

Make sure you have:
- **Node.js 18+** installed
- **TypeScript** knowledge for 3D modeling

## 🎯 Quick Start Options

### Option 1: Use the Angular Development Server (Recommended)

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Build the core package
cd packages/core
npm run build
cd ../..

# 3. Start the development server
npm run dev
```

This will start:
- **Vite dev server** with Angular frontend
- **Hot module reloading** for instant updates
- **3D visualization** interface at http://localhost:4200

### Option 2: Create 3D Models Programmatically

Create a new TypeScript file in the `models/` directory:

```typescript
// models/my-first-model.ts
import { cube, sphere, cylinder, union } from '@opentscad/core';

export function createMyModel() {
  // Create basic shapes using the new parameter-per-value API
  const base = cube(10, 10, 2);           // width, height, depth
  const post = cylinder(1, 8);            // radius, height
  const top = sphere(2);                  // radius
  
  // Combine shapes with positioning
  const assembly = union([
    base,
    post.translate(0, 0, 2),              // x, y, z
    top.translate(0, 0, 10)
  ]);
  
  return assembly;
}

// Export as default for auto-loading
export default createMyModel;
```

### Option 3: Use CLI Tools (Future)

```bash
# Install CLI globally (when published)
npm install -g @opentscad/cli

# Create new project
mkdir my-cad-project
cd my-cad-project
npx @opentscad/cli init

# Start developing
npm run dev
```

## 🎨 Available API Functions

The modernized API uses **parameter-per-value** approach:

### Basic Shapes
```typescript
import { cube, sphere, cylinder } from '@opentscad/core';

// Cube: uniform size or individual dimensions
const uniformCube = cube(5);                    // 5×5×5
const customCube = cube(10, 20, 5);            // width × height × depth

// Sphere: radius
const ball = sphere(3);

// Cylinder: radius, height
const tube = cylinder(2, 10);
```

### Transformations
```typescript
// Positioning (translate)
const moved = cube(5).translate(10, 0, 5);     // x, y, z offset

// Combining shapes
import { union } from '@opentscad/core';
const combined = union([shape1, shape2, shape3]);
```

## 🏗️ Project Structure

Your OpenTSCAD workspace now follows this clean structure:

```
OpenTSCAD/
├── packages/
│   ├── core/                 # Core 3D modeling engine
│   │   ├── src/             # TypeScript source files
│   │   ├── dist/            # Compiled output
│   │   └── package.json
│   └── cli/                 # Command line tools
├── angular/                 # Angular frontend UI
├── models/                  # Your 3D model files
├── examples/               # Example projects
└── package.json           # Main project config
```

## 🔧 Development Workflow

1. **Write Models**: Create `.ts` files in `models/` using the OpenTSCAD API
2. **Live Preview**: Run `npm run dev` to see changes instantly
3. **Iterate Fast**: TypeScript gives you IntelliSense and type safety
4. **Export**: Models automatically compile to 3D representations

## 📚 Next Steps

- **Explore Examples**: Check `examples/` directory for inspiration
- **Read Documentation**: Browse the style guides (`ANGULAR_STYLE_GUIDE.md`, `TYPESCRIPT_STYLE_GUIDE.md`)
- **Build Something**: Start with simple shapes and combine them creatively!

## 🆘 Troubleshooting

- **Build Issues**: Run `cd packages/core && npm run build`
- **Import Errors**: Make sure core package is built first
- **Type Errors**: Check that you're using the new API syntax (parameter-per-value)

Happy modeling! 🎉