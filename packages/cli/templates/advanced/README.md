# {{projectName}}

An advanced OpenTSCAD project demonstrating complex modeling techniques, utilities, and project organization.

## Features

- Multiple model files with shared utilities
- Parameterized designs
- Complex assemblies
- Reusable components
- Organized project structure

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
{{projectName}}/
├── src/
│   ├── models/
│   │   ├── main.ts           # Main assembly model
│   │   ├── housing.ts        # Housing component
│   │   └── mechanical.ts     # Mechanical parts
│   ├── utils/
│   │   ├── parameters.ts     # Design parameters
│   │   ├── helpers.ts        # Utility functions
│   │   └── constants.ts      # Project constants
│   └── index.ts             # Main entry point
├── package.json             # Project configuration
├── tsconfig.json           # TypeScript configuration
└── README.md              # This file
```

## Key Concepts Demonstrated

### Parameterized Design
Models use configurable parameters for easy customization:
```typescript
export const params = {
  width: 50,
  height: 30,
  thickness: 2
};
```

### Modular Components
Reusable components that can be combined:
```typescript
export function createHousing(params: HousingParams) {
  // Component implementation
}
```

### Complex Assemblies
Main model combines multiple components:
```typescript
export function main() {
  const housing = createHousing(housingParams);
  const mechanism = createMechanism(mechanicalParams);
  return housing.union(mechanism);
}
```

## Development Workflow

1. **Design Phase**: Define parameters in `src/utils/parameters.ts`
2. **Component Development**: Create reusable components in `src/models/`
3. **Assembly**: Combine components in `src/models/main.ts`
4. **Testing**: Use `npm run dev` for live preview
5. **Building**: Use `npm run build` for final output

## Advanced Features Used

- Path-based imports with TypeScript path mapping
- Interface-driven design parameters
- Utility functions for common operations
- Separation of concerns between components
- Documentation-driven development

## Learning Resources

- [OpenTSCAD Documentation](../../README.md)
- [TypeScript Style Guide](../../TYPESCRIPT_STYLE_GUIDE.md)
- [Architecture Overview](../../ARCHITECTURE.md)

## Next Steps

- Experiment with different parameter values
- Add new components to the assembly
- Create variations of the main design
- Add material properties and metadata