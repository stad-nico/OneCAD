# {{projectName}}

A multi-file OpenTSCAD project demonstrating how to organize larger projects with multiple components and assemblies.

## Features

- Multiple separate model files
- Component-based design
- Clean assembly structure
- Easy to modify and extend

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. The main assembly will be shown, combining all components

## Project Structure

```
{{projectName}}/
├── models/
│   ├── assembly.ts       # Main assembly combining all parts
│   ├── base.ts          # Base component
│   ├── top.ts           # Top component
│   └── connector.ts     # Connector piece
├── package.json         # Project configuration
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
```

## Model Files

### assembly.ts
Main file that combines all components into the final design.

### base.ts
Creates the base component - the foundation of the assembly.

### top.ts
Creates the top component that connects to the base.

### connector.ts
Creates connector pieces that join components together.

## Customization

Each component can be customized independently:

1. **Base Component**: Modify dimensions, add features
2. **Top Component**: Change height, add mounting points
3. **Connectors**: Adjust fit, add different connection types

## Development Workflow

1. Work on individual components in separate files
2. Test each component independently
3. Combine in `assembly.ts` to see the full design
4. Iterate on individual parts as needed

## Learning Resources

- [OpenTSCAD Documentation](../../README.md)
- [TypeScript Style Guide](../../TYPESCRIPT_STYLE_GUIDE.md)
- [Architecture Overview](../../ARCHITECTURE.md)