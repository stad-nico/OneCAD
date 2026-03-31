# @opentscad/cli

Command line interface for OpenTSCAD - TypeScript-based 3D CAD modeling with multi-repository support.

[![npm version](https://badge.fury.io/js/@opentscad%2Fcli.svg)](https://www.npmjs.com/package/@opentscad/cli)
[![Node.js Version](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Overview

The OpenTSCAD CLI enables external projects to connect to the OpenTSCAD visualization server, providing a seamless development experience for distributed 3D modeling teams.

## Installation

### Global Installation (Recommended)

```bash
npm install -g @opentscad/cli
```

### Project-Specific Installation

```bash
npm install --save-dev @opentscad/cli
```

## Quick Start

### 1. Create a New Project

```bash
# Create a new directory for your CAD project
mkdir my-cad-project
cd my-cad-project

# Initialize the project with OpenTSCAD
npx @opentscad/cli init

# Install dependencies
npm install
```

### 2. Start Development

```bash
# Start the development server with hot reloading
npm run dev

# Or use the CLI directly
opentscad dev
```

### 3. Create Your First Model

```typescript
// models/my-first-model.model.ts
import { box } from '@opentscad/core';

export default function myFirstModel() {
  return box(20, 10, 5).translate(0, 0, 2.5);
}
```

Save the file and watch it appear in the OpenTSCAD visualization server!

## Commands

### `init` - Initialize Project

Creates a new OpenTSCAD project with default structure and configuration.

```bash
opentscad init [options]

Options:
  --name <name>           Project name (default: current directory name)
  --description <desc>    Project description
  --template <template>   Template to use (default: "default")
  --force                 Overwrite existing files
  -h, --help             Display help for command

Examples:
  opentscad init                                    # Initialize with defaults
  opentscad init --name "My Project" --force       # Force overwrite existing
  opentscad init --template advanced               # Use advanced template
```

#### Generated Structure

```
my-project/
├── models/                          # Your model files
│   ├── components/                  # Reusable components
│   │   └── bracket.model.ts        # Example parametric component
│   ├── assemblies/                 # Complex multi-part models
│   │   └── simple-assembly.model.ts
│   └── example.model.ts            # Simple example
├── opentscad.config.json           # Project configuration
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                      # Project documentation
```

### `dev` - Development Server

Starts development mode with file watching and hot reloading.

```bash
opentscad dev [options]

Options:
  --host <host>          Server host (default: "localhost")
  --port <port>          Server port (default: 5174)
  --watch <pattern>      File watch pattern (default: "models/**/*.model.ts")
  --no-watch            Disable file watching
  --debug               Enable debug logging
  --config <path>       Path to config file (default: "./opentscad.config.json")
  -h, --help           Display help for command

Examples:
  opentscad dev                                    # Start with defaults
  opentscad dev --debug                           # Enable debug logging
  opentscad dev --host 192.168.1.100 --port 8080 # Custom server
  opentscad dev --watch "src/**/*.ts"             # Custom watch pattern
```

#### Development Features

- **File Watching**: Automatically detects changes in TypeScript model files
- **Hot Reloading**: Updates 3D visualization without page refresh
- **Error Reporting**: Clear compilation and runtime error messages
- **Live Connection**: Real-time WebSocket connection to visualization server
- **Multi-Project Support**: Multiple CLI instances can connect simultaneously

### `build` - Build Models

Compiles all models in the project for production deployment.

```bash
opentscad build [options]

Options:
  --output <dir>         Output directory (default: "dist")
  --clean               Clean output directory before build
  --watch <pattern>     File pattern to build (default: "models/**/*.model.ts")
  --format <format>     Output format: "json" | "binary" (default: "json")
  --minify              Minify output files
  --config <path>       Path to config file (default: "./opentscad.config.json")
  -h, --help           Display help for command

Examples:
  opentscad build                          # Build with defaults
  opentscad build --clean --minify         # Clean build with minification
  opentscad build --output ./build         # Custom output directory
  opentscad build --format binary          # Binary output format
```

#### Build Outputs

The build process generates:

```
dist/
├── models/                    # Compiled model files
│   ├── example.json          # Model metadata and operations
│   └── components/
│       └── bracket.json
├── assets/                   # Static assets
│   └── preview-images/       # Generated preview images
├── manifest.json            # Build manifest
└── package.json            # Deployable package info
```

### `config` - Configuration Management

Manage project configuration settings.

```bash
opentscad config <action> [key] [value] [options]

Actions:
  get <key>              Get configuration value
  set <key> <value>      Set configuration value
  list                   List all configuration
  reset                  Reset to defaults
  validate              Validate current configuration

Options:
  --config <path>       Path to config file (default: "./opentscad.config.json")
  --global             Use global configuration
  -h, --help          Display help for command

Examples:
  opentscad config list                        # List all settings
  opentscad config get server.host             # Get specific setting
  opentscad config set server.port 8080       # Set server port
  opentscad config reset                       # Reset to defaults
```

## Configuration

### Project Configuration (`opentscad.config.json`)

```json
{
  "name": "My CAD Project",
  "description": "Custom mechanical components",
  "version": "1.0.0",
  "server": {
    "host": "localhost",
    "port": 5174,
    "protocol": "ws",
    "reconnectAttempts": 5,
    "reconnectDelay": 2000
  },
  "compiler": {
    "debugMode": false,
    "enableCache": true,
    "targetFormat": "esnext",
    "strictMode": true,
    "externals": ["three", "opencascade"]
  },
  "models": {
    "include": ["models/**/*.model.ts"],
    "exclude": ["**/test/**", "**/node_modules/**", "**/*.spec.ts"],
    "extensions": [".model.ts", ".component.ts"]
  },
  "build": {
    "outputDir": "dist",
    "format": "json",
    "minify": false,
    "generatePreviews": true,
    "sourceMaps": true
  },
  "development": {
    "watchOptions": {
      "ignored": ["node_modules/**", "dist/**"],
      "polling": false,
      "interval": 100
    },
    "hotReload": true,
    "clearConsole": false
  }
}
```

### Configuration Schema

#### Server Settings
- **host**: Server hostname or IP address
- **port**: WebSocket port for communication
- **protocol**: Communication protocol ("ws" or "wss")
- **reconnectAttempts**: Number of reconnection attempts
- **reconnectDelay**: Delay between reconnection attempts (ms)

#### Compiler Settings  
- **debugMode**: Enable verbose compilation logging
- **enableCache**: Enable compilation result caching
- **targetFormat**: JavaScript target format
- **strictMode**: Enable TypeScript strict mode
- **externals**: External dependencies to exclude from bundling

#### Model Settings
- **include**: Glob patterns for model files to include
- **exclude**: Glob patterns for files to exclude
- **extensions**: File extensions to recognize as models

#### Build Settings
- **outputDir**: Directory for build output
- **format**: Output format for compiled models
- **minify**: Minify compiled output
- **generatePreviews**: Generate preview images
- **sourceMaps**: Include source maps in output

## Project Templates

### Default Template

Basic project structure with example models:

```bash
opentscad init --template default
```

Includes:
- Simple box example
- Parametric bracket component
- Assembly example
- Comprehensive README
- TypeScript configuration

### Advanced Template

Extended project with advanced features:

```bash
opentscad init --template advanced
```

Includes:
- Multiple parametric components
- Complex assemblies
- Custom operations
- Testing setup
- CI/CD configuration
- Documentation templates

### Minimal Template

Lightweight setup for experienced users:

```bash
opentscad init --template minimal
```

Includes:
- Basic configuration
- Single example model
- Minimal dependencies

## Development Workflow

### Typical Development Session

```bash
# 1. Create and initialize project
mkdir my-project && cd my-project
opentscad init

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Create models in models/ directory
# 5. Watch real-time updates in browser
# 6. Build for production when ready
npm run build
```

### File Organization Best Practices

```
models/
├── components/              # Reusable parametric components
│   ├── fasteners/          # Bolts, screws, nuts
│   ├── brackets/           # Mounting brackets
│   └── housings/           # Enclosures
├── assemblies/             # Multi-component assemblies
│   ├── mechanical/         # Mechanical assemblies
│   └── electrical/         # Electronic enclosures
├── templates/              # Base templates for new models
└── examples/              # Tutorial and example models
```

### Model Development Patterns

#### Simple Model
```typescript
import { box } from '@opentscad/core';

export default function simpleBox() {
  return box(10, 10, 10);
}
```

#### Parametric Component
```typescript
interface BracketParams {
  width: number;
  height: number;
  thickness: number;
  holeSize?: number;
}

export default function bracket(params: BracketParams) {
  const { width, height, thickness, holeSize = 6 } = params;
  // Implementation...
}
```

#### Assembly
```typescript
import bracket from '../components/bracket.model';
import bolt from '../components/bolt.model';

export default function assembly() {
  const mainBracket = bracket({ width: 50, height: 30, thickness: 8 });
  const mountingBolt = bolt({ diameter: 6, length: 20 });
  // Combine components...
}
```

## Troubleshooting

### Common Issues

#### Connection Failed
```bash
Error: Unable to connect to OpenTSCAD server at localhost:5174
```

**Solutions:**
1. Ensure the OpenTSCAD server is running
2. Check the host/port configuration
3. Verify firewall settings
4. Try `opentscad dev --debug` for detailed logging

#### Compilation Errors
```bash
Error: TypeScript compilation failed
```

**Solutions:**
1. Check TypeScript syntax in your model files
2. Verify imports from `@opentscad/core`
3. Review `tsconfig.json` configuration
4. Use `opentscad build --debug` for detailed error info

#### File Watching Issues
```bash
Warning: File watcher not detecting changes
```

**Solutions:**
1. Check file permissions
2. Try `opentscad dev --watch "models/**/*.ts"`
3. On some systems, enable polling: set `watchOptions.polling: true`
4. Restart the development server

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
opentscad dev --debug
opentscad build --debug
```

Debug mode provides:
- Detailed WebSocket communication logs
- Compilation step-by-step output
- File watching events
- Error stack traces
- Performance timing information

### Log Levels

The CLI uses structured logging with different levels:

- **ERROR**: Critical failures that stop execution
- **WARN**: Issues that don't prevent operation
- **INFO**: High-level status information
- **DEBUG**: Detailed operational information (debug mode only)

## Integration

### CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Build OpenTSCAD Models

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build models
      run: npx @opentscad/cli build --clean
    
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: compiled-models
        path: dist/
```

### Docker Integration

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy project files
COPY models/ ./models/
COPY opentscad.config.json ./

# Install CLI globally
RUN npm install -g @opentscad/cli

# Build models
RUN opentscad build --clean

# Serve built models
EXPOSE 3000
CMD ["npx", "serve", "dist", "-p", "3000"]
```

### IDE Integration

#### VS Code Extensions

Recommended extensions for development:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json"
  ]
}
```

#### Settings

Optimized VS Code settings:

```json
{
  "typescript.suggest.autoImports": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.model.ts": "typescript"
  },
  "emmet.includeLanguages": {
    "typescript": "html"
  }
}
```

## API Reference

### CLI Class

```typescript
import { CLI } from '@opentscad/cli';

const cli = new CLI({
  configPath: './custom-config.json',
  verboseLogging: true
});

await cli.run(['dev', '--debug']);
```

### Configuration API

```typescript
import { Config } from '@opentscad/cli/config';

const config = await Config.load('./opentscad.config.json');
config.set('server.port', 8080);
await config.save();
```

### File Watcher API

```typescript
import { ModelWatcher } from '@opentscad/cli/watcher';

const watcher = new ModelWatcher({
  patterns: ['models/**/*.model.ts'],
  ignoreInitial: true
});

watcher.on('change', (filePath) => {
  console.log('Model changed:', filePath);
});

await watcher.start();
```

## Contributing

We welcome contributions! See our [Contributing Guide](../../CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/opentscad.git
cd opentscad/packages/cli

# Install dependencies
npm install

# Build the package
npm run build

# Test locally
npm link
opentscad --version
```

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Ready to revolutionize your 3D modeling workflow?**

[Install Now →](#installation) | [View Examples →](../../examples/) | [Get Support →](https://github.com/your-org/opentscad/issues)