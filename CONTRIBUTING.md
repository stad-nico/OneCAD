# Contributing to OpenTSCAD

Thank you for your interest in contributing to OpenTSCAD! This guide will help you understand how to contribute effectively to our multi-repository 3D modeling system.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Contributing Guidelines](#contributing-guidelines)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation Guidelines](#documentation-guidelines)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** 18+ and npm 9+
- **Git** with proper configuration
- **TypeScript** knowledge and experience
- **3D modeling** basic understanding
- **WebGL/Three.js** familiarity (for frontend contributions)

### Development Setup

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/opentscad.git
   cd opentscad
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build All Packages**
   ```bash
   npm run build
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   npm test
   ```

### Repository Structure

Understanding the codebase organization:

```
opentscad/
├── core/                    # Core modeling system
│   ├── src/
│   │   ├── compiler/        # TypeScript to operations compiler
│   │   ├── server/          # WebSocket server
│   │   ├── network/         # Network protocol implementation
│   │   ├── shape/           # 3D shape operations
│   │   └── shared/          # Shared utilities
│   └── tests/
├── angular/                 # Frontend visualization app
│   ├── src/app/
│   │   ├── components/      # UI components
│   │   ├── services/        # Angular services
│   │   ├── models/          # Data models
│   │   └── utils/           # Frontend utilities
│   └── tests/
├── packages/cli/            # Command-line interface
│   ├── src/
│   │   ├── commands/        # CLI commands
│   │   ├── utils/           # CLI utilities
│   │   └── templates/       # Project templates
│   └── tests/
├── examples/                # Example projects
├── docs/                    # Documentation
└── scripts/                 # Build and utility scripts
```

## Development Workflow

### Branch Strategy

We use a **feature branch workflow**:

```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Work on your changes
# ...

# Push and create pull request
git push origin feature/your-feature-name
```

### Commit Convention

We follow [Conventional Commits](https://conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```bash
feat(compiler): add support for curved surfaces
fix(server): resolve WebSocket connection timeout
docs(cli): update template documentation
test(core): add unit tests for shape operations
```

### Pull Request Process

1. **Before Creating PR:**
   ```bash
   # Ensure tests pass
   npm test
   
   # Ensure code builds
   npm run build
   
   # Lint code
   npm run lint
   
   # Format code
   npm run format
   ```

2. **PR Requirements:**
   - Clear, descriptive title following commit conventions
   - Detailed description explaining changes and motivation
   - Link to related issues
   - Screenshots/demos for UI changes
   - Updated documentation if needed
   - All tests passing
   - Code review approval from maintainers

3. **PR Template:**
   ```markdown
   ## Description
   Brief description of changes and motivation.
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Performance improvement
   - [ ] Other (specify)
   
   ## Testing
   - [ ] Existing tests pass
   - [ ] New tests added
   - [ ] Manual testing completed
   
   ## Documentation
   - [ ] Code comments added/updated
   - [ ] README updated
   - [ ] API documentation updated
   
   ## Screenshots (if applicable)
   Include screenshots or GIFs for visual changes.
   
   ## Related Issues
   Closes #123, Related to #456
   ```

## Contributing Guidelines

### Types of Contributions

#### 🐛 Bug Fixes
- **Priority**: High
- **Requirements**: Reproduction steps, test cases, fix verification
- **Focus Areas**: Compiler errors, server crashes, UI glitches

#### ✨ New Features
- **Priority**: Medium
- **Requirements**: Design discussion, documentation, comprehensive tests
- **Focus Areas**: New shape operations, CLI commands, UI improvements

#### 📚 Documentation
- **Priority**: High
- **Requirements**: Clear writing, accurate information, examples
- **Focus Areas**: API docs, tutorials, guides, code comments

#### 🧪 Tests
- **Priority**: High  
- **Requirements**: Good coverage, realistic scenarios, maintainable
- **Focus Areas**: Unit tests, integration tests, end-to-end tests

#### 🎨 Examples
- **Priority**: Medium
- **Requirements**: Educational value, complete projects, documentation
- **Focus Areas**: Learning materials, showcases, templates

### Contribution Areas

#### Core System (`core/`)
**Skills Needed:** TypeScript, Node.js, WebSockets, 3D math
**Areas:**
- Shape operation algorithms
- Compiler improvements
- Network protocol enhancements
- Performance optimizations

#### Frontend (`angular/`)
**Skills Needed:** Angular, TypeScript, Three.js, WebGL, RxJS
**Areas:**
- UI/UX improvements
- 3D visualization enhancements
- Performance optimization
- Accessibility improvements

#### CLI Package (`packages/cli/`)
**Skills Needed:** Node.js, CLI design, file system operations
**Areas:**
- New commands
- Template improvements
- Developer experience
- Cross-platform compatibility

#### Documentation (`docs/`, `examples/`)
**Skills Needed:** Technical writing, 3D modeling knowledge
**Areas:**
- API documentation
- Tutorials and guides
- Example projects
- Architecture documentation

## Code Standards

### TypeScript Guidelines

Follow the established [TypeScript Style Guide](TYPESCRIPT_STYLE_GUIDE.md):

#### Key Principles
```typescript
// ✅ Good: Use interfaces for object definitions
interface ModelConfig {
  readonly name: string;
  readonly version: string;
  readonly outputFormat: OutputFormat;
}

// ❌ Bad: Don't use type aliases for objects
type ModelConfig = {
  name: string;
  version: string;
  outputFormat: OutputFormat;
};

// ✅ Good: Use string enums for external communication
enum OutputFormat {
  STL = 'stl',
  OBJ = 'obj',
  PLY = 'ply'
}

// ✅ Good: Use Maybe<T> for nullable values
type Maybe<T> = T | undefined;

function findModel(id: string): Maybe<Model> {
  return models.find(model => model.id === id);
}

// ✅ Good: Always use async/await with try/catch
async function compileModel(source: string): Promise<CompiledModel> {
  try {
    const ast = await parseSource(source);
    return await compileAST(ast);
  } catch (error) {
    throw new CompilationError(`Failed to compile model: ${error.message}`);
  }
}
```

#### Naming Conventions
```typescript
// Constants: SCREAMING_SNAKE_CASE
const DEFAULT_TIMEOUT = 5000;
const MAX_RETRY_ATTEMPTS = 3;

// Classes: PascalCase
class ShapeCompiler {
  // Private members: prefix with underscore
  private readonly _cache = new Map<string, CompiledShape>();
  
  // Methods: camelCase
  public compileShape(source: string): CompiledShape {
    // Implementation
  }
}

// Functions: camelCase
function calculateBoundingBox(shape: Shape): BoundingBox {
  // Implementation
}

// Interfaces: PascalCase
interface NetworkMessage {
  readonly type: MessageType;
  readonly payload: unknown;
  readonly timestamp: number;
}

// Enums: PascalCase with meaningful values
enum MessageType {
  MODEL_UPDATE = 'model_update',
  CONNECTION_STATUS = 'connection_status',
  ERROR_REPORT = 'error_report'
}
```

#### Error Handling
```typescript
// ✅ Good: Use specific error types
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ✅ Good: Handle errors at appropriate level
async function validateAndCompile(source: string): Promise<CompiledModel> {
  try {
    const validationResult = await validateSource(source);
    if (!validationResult.isValid) {
      throw new ValidationError(
        validationResult.message,
        validationResult.field,
        validationResult.value
      );
    }
    
    return await compileModel(source);
  } catch (error) {
    if (error instanceof ValidationError) {
      logger.warn('Validation failed', { error });
      throw error;
    }
    
    logger.error('Compilation failed', { error });
    throw new CompilationError(`Failed to compile: ${error.message}`);
  }
}
```

### Code Quality

#### Linting Configuration
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### Formatting
Use Prettier for consistent formatting:
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Testing Requirements

### Test Structure

#### Unit Tests
```typescript
// Example: core/tests/shape/operations.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { cube, sphere, union } from '../../src/shape/primitives';

describe('Shape Operations', () => {
  describe('union', () => {
    it('should combine two shapes correctly', () => {
      // Arrange
      const box = cube({ size: [2, 2, 2] });
      const ball = sphere({ radius: 1 });
      
      // Act
      const result = union([box, ball]);
      
      // Assert
      expect(result.type).toBe('union');
      expect(result.children).toHaveLength(2);
      expect(result.children[0]).toBe(box);
      expect(result.children[1]).toBe(ball);
    });
    
    it('should handle empty input gracefully', () => {
      expect(() => union([])).not.toThrow();
      expect(union([]).children).toHaveLength(0);
    });
  });
});
```

#### Integration Tests
```typescript
// Example: core/tests/compiler/integration.test.ts
import { describe, it, expect } from 'vitest';
import { Compiler } from '../../src/compiler/Compiler';

describe('Compiler Integration', () => {
  it('should compile simple model end-to-end', async () => {
    // Arrange
    const source = `
      import { cube } from '@opentscad/core';
      
      export default function main() {
        return cube({ size: [10, 10, 10] });
      }
    `;
    
    const compiler = new Compiler();
    
    // Act
    const result = await compiler.compile(source);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.operations).toBeDefined();
    expect(result.operations.length).toBeGreaterThan(0);
  });
});
```

#### E2E Tests
```typescript
// Example: angular/e2e/app.e2e-spec.ts
import { test, expect } from '@playwright/test';

test('should load 3D model in viewer', async ({ page }) => {
  // Navigate to application
  await page.goto('/');
  
  // Wait for 3D scene to initialize
  await expect(page.locator('canvas')).toBeVisible();
  
  // Load example model
  await page.click('[data-testid="load-example"]');
  
  // Verify model is rendered
  await expect(page.locator('[data-testid="model-loaded"]')).toBeVisible();
  
  // Test 3D interaction
  const canvas = page.locator('canvas');
  await canvas.click({ position: { x: 100, y: 100 } });
  await canvas.drag({ x: 150, y: 150 }, { x: 200, y: 100 });
  
  // Verify camera moved
  const cameraPosition = await page.evaluate(() => 
    window.scene.camera.position.toArray()
  );
  expect(cameraPosition).not.toEqual([0, 0, 10]);
});
```

### Test Coverage

Maintain high test coverage:
- **Unit Tests**: 90%+ coverage for utility functions and algorithms
- **Integration Tests**: Cover major workflows and API interactions  
- **E2E Tests**: Cover critical user journeys

```bash
# Run tests with coverage
npm run test:coverage

# Coverage targets
# Statements: 85%
# Branches: 80%
# Functions: 90%
# Lines: 85%
```

## Documentation Guidelines

### Code Documentation

#### JSDoc Comments
```typescript
/**
 * Compiles TypeScript model source code into executable operations.
 * 
 * @param source - The TypeScript source code to compile
 * @param options - Compilation options
 * @returns Promise resolving to compiled operations
 * 
 * @throws {CompilationError} When source code contains syntax errors
 * @throws {ValidationError} When model doesn't export default function
 * 
 * @example
 * ```typescript
 * const source = `
 *   import { cube } from '@opentscad/core';
 *   export default () => cube({ size: [10, 10, 10] });
 * `;
 * 
 * const operations = await compiler.compile(source);
 * console.log('Compiled successfully:', operations.length);
 * ```
 */
async function compile(
  source: string,
  options: CompilationOptions = {}
): Promise<CompiledOperations> {
  // Implementation
}
```

#### README Structure
Each package should have comprehensive README:

```markdown
# Package Name

Brief description of package purpose and functionality.

## Installation

npm install @opentscad/package-name

## Quick Start

Basic usage example showing the most common use case.

## API Reference

### Classes

#### ClassName
Description of class purpose.

### Functions

#### functionName(params): ReturnType
Description of function and parameters.

## Examples

Real-world usage examples with complete code.

## Contributing

Link to main contributing guide with package-specific notes.
```

### Architecture Documentation

Keep architecture docs current with code changes:

```markdown
# Component Architecture

## Overview
High-level description of component's role in the system.

## Key Concepts
- **Concept 1**: Explanation with examples
- **Concept 2**: Explanation with examples

## Data Flow
Description of how data moves through the component.

## Integration Points
How this component interacts with others.

## Performance Considerations
Important performance characteristics and optimization notes.

## Future Considerations
Known limitations and planned improvements.
```

## Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please follow these guidelines:

#### Expected Behavior
- **Be Respectful**: Treat everyone with courtesy and professionalism
- **Be Inclusive**: Welcome newcomers and help them succeed
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Patient**: Understand that people have different experience levels

#### Unacceptable Behavior
- Harassment, discrimination, or offensive language
- Personal attacks or inflammatory comments
- Spam, trolling, or deliberately disruptive behavior
- Sharing private information without consent

#### Enforcement
Community guidelines are enforced by project maintainers. Violations may result in warnings, temporary suspension, or permanent bans at maintainer discretion.

### Communication Channels

#### GitHub Issues
**Use for:**
- Bug reports with reproduction steps
- Feature requests with clear use cases
- Documentation improvements
- Technical discussions

**Issue Templates:**
```markdown
**Bug Report**
- Description: Clear description of the bug
- Steps to Reproduce: Numbered steps
- Expected Behavior: What should happen
- Actual Behavior: What actually happens
- Environment: OS, Node version, package versions
- Additional Context: Screenshots, logs, related issues

**Feature Request**
- Description: Clear description of proposed feature
- Motivation: Why is this feature needed
- Use Cases: Specific scenarios where it would be useful
- Proposed Implementation: Ideas for how to implement
- Alternatives: Other solutions considered
```

#### Discord Community
**Use for:**
- Real-time help and support
- General discussions about OpenTSCAD
- Community announcements
- Collaboration on projects

#### GitHub Discussions
**Use for:**
- Design discussions and RFCs
- Best practices sharing
- Show and tell (your projects)
- Q&A that doesn't fit issues

### Recognition

We appreciate all contributions! Contributors are recognized in:

- **CONTRIBUTORS.md**: List of all contributors
- **Release Notes**: Major contributions highlighted
- **Community Showcase**: Featured projects and examples
- **GitHub Achievements**: Contributor badges and stats

### Getting Help

#### New Contributor Onboarding
1. **Read Documentation**: Start with README and ARCHITECTURE.md
2. **Setup Development Environment**: Follow DEVELOPMENT_SETUP.md
3. **Find Good First Issues**: Look for "good first issue" labels
4. **Ask Questions**: Use Discord or GitHub discussions
5. **Start Small**: Begin with documentation or test contributions

#### Mentorship Program
Experienced contributors can mentor newcomers:
- **Code Review**: Help with pull request feedback
- **Architecture Guidance**: Explain system design decisions
- **Best Practices**: Share coding and design patterns
- **Project Ideas**: Suggest contributions aligned with skills

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **Major (X.0.0)**: Breaking changes
- **Minor (x.Y.0)**: New features, backward compatible
- **Patch (x.y.Z)**: Bug fixes, backward compatible

### Release Checklist

**Pre-Release:**
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Migration guides written
- [ ] Performance impact assessed
- [ ] Security review completed

**Release:**
- [ ] Version bumped in package.json
- [ ] Changelog updated
- [ ] Git tag created
- [ ] Packages published to npm
- [ ] Release notes published
- [ ] Community notified

**Post-Release:**
- [ ] Monitor for issues
- [ ] Update dependent projects
- [ ] Gather community feedback
- [ ] Plan next release

---

Thank you for contributing to OpenTSCAD! Your efforts help make 3D modeling more accessible and powerful for everyone. If you have questions about contributing, please reach out through our community channels.

**Happy coding! 🚀**