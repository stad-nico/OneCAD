# Development Setup Guide

This guide covers everything you need to set up a complete OpenTSCAD development environment, from basic installation to advanced development workflows.

## Table of Contents

- [Quick Start](#quick-start)
- [System Requirements](#system-requirements)
- [Installation Methods](#installation-methods)
- [Development Environment](#development-environment)
- [IDE Setup](#ide-setup)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Quick Start

For the impatient developer who wants to get started immediately:

```bash
# Install OpenTSCAD CLI globally
npm install -g @opentscad/cli

# Create a new project
mkdir my-3d-project
cd my-3d-project
opentscad init --template basic

# Install dependencies and start developing
npm install
npm run dev
```

Your browser will open to `http://localhost:3000` showing your 3D model.

## System Requirements

### Minimum Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn/pnpm equivalent)
- **TypeScript**: 5.0.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 1GB free space for node_modules and build outputs

### Supported Operating Systems
- **Windows**: 10/11 (64-bit)
- **macOS**: 12 Monterey or higher
- **Linux**: Ubuntu 20.04+, Fedora 35+, or equivalent

### Browser Requirements
- **Chrome/Chromium**: 100+
- **Firefox**: 100+
- **Safari**: 15+
- **Edge**: 100+

## Installation Methods

### Method 1: NPM Global Installation (Recommended)

```bash
# Install globally for system-wide access
npm install -g @opentscad/cli

# Verify installation
opentscad --version
opentscad --help
```

**Pros:**
- Simple single command
- Available from anywhere
- Automatic updates with `npm update -g`

**Cons:**
- Requires admin privileges on some systems
- Version conflicts possible with multiple projects

### Method 2: NPX (No Installation)

```bash
# Use without installing
npx @opentscad/cli init my-project
cd my-project
npx @opentscad/cli dev
```

**Pros:**
- No installation required
- Always uses latest version
- No permission issues

**Cons:**
- Slower startup time
- Requires internet connection
- No offline usage

### Method 3: Local Project Installation

```bash
# Install as dev dependency
npm install --save-dev @opentscad/cli

# Use via npm scripts or npx
npx opentscad dev
# OR add to package.json scripts
```

**Pros:**
- Project-specific versions
- No global pollution
- Version controlled

**Cons:**
- Must install in each project
- Longer commands

### Method 4: Development Installation

For contributors and advanced users:

```bash
# Clone the repository
git clone https://github.com/opentscad/opentscad.git
cd opentscad

# Install dependencies
npm install

# Build all packages
npm run build

# Link CLI for development
cd packages/cli
npm link

# Use development version
opentscad --version
```

## Development Environment

### Project Structure Setup

Create an optimal project structure:

```
my-3d-project/
├── models/                 # Your 3D models
│   ├── components/         # Reusable components
│   ├── assemblies/         # Complex assemblies
│   └── examples/          # Example models
├── src/                   # Additional TypeScript code
│   ├── utils/             # Utility functions
│   ├── constants/         # Project constants
│   └── types/             # Type definitions
├── tests/                 # Test files
├── docs/                  # Project documentation
├── .opentscad/           # Cache directory
├── dist/                  # Build output
├── package.json
├── tsconfig.json
├── opentscad.config.json
└── README.md
```

### Configuration Files

#### package.json
```json
{
  "name": "my-3d-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "opentscad dev --watch",
    "build": "opentscad build --optimize",
    "serve": "opentscad serve --port 3000",
    "clean": "rm -rf dist .opentscad",
    "lint": "tsc --noEmit",
    "test": "vitest",
    "docs": "typedoc src models"
  },
  "devDependencies": {
    "@opentscad/cli": "latest",
    "@opentscad/types": "latest",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "typedoc": "^0.25.0"
  }
}
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"],
      "@models/*": ["./models/*"],
      "@utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src/**/*", "models/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist", ".opentscad"]
}
```

#### opentscad.config.json
```json
{
  "projectId": "my-3d-project",
  "name": "My 3D Project",
  "description": "Advanced 3D modeling project",
  "version": "1.0.0",
  "modelPaths": ["models/**/*.ts", "src/**/*.model.ts"],
  "outputDir": "dist",
  "server": {
    "host": "localhost",
    "port": 8080,
    "autoConnect": true
  },
  "build": {
    "optimize": true,
    "sourceMaps": true,
    "target": "ES2022"
  },
  "watch": {
    "enabled": true,
    "debounce": 300,
    "ignored": ["node_modules", "dist", ".opentscad"]
  }
}
```

### Development Workflow

#### Daily Development
```bash
# Start development session
npm run dev

# In another terminal - run tests
npm run test -- --watch

# Build for production
npm run build

# Clean build artifacts
npm run clean
```

#### Advanced Development
```bash
# Development with custom server
opentscad dev --host 0.0.0.0 --port 3001

# Build with optimization
opentscad build --optimize --sourcemaps

# Serve built files
opentscad serve --static dist

# Debug mode with verbose logging
DEBUG=opentscad:* opentscad dev
```

## IDE Setup

### Visual Studio Code (Recommended)

#### Required Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.debugger-for-chrome"
  ]
}
```

#### Workspace Settings (.vscode/settings.json)
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.opentscad": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.opentscad": true
  }
}
```

#### Debug Configuration (.vscode/launch.json)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug OpenTSCAD Dev",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@opentscad/cli/bin/opentscad.js",
      "args": ["dev"],
      "console": "integratedTerminal",
      "env": {
        "DEBUG": "opentscad:*"
      }
    }
  ]
}
```

#### Tasks (.vscode/tasks.json)
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "shell",
      "command": "npm",
      "args": ["run", "dev"],
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "isBackground": true
    },
    {
      "label": "build",
      "type": "shell",
      "command": "npm",
      "args": ["run", "build"],
      "group": "build"
    }
  ]
}
```

### WebStorm/IntelliJ

#### Configuration
1. Enable TypeScript service: `File > Settings > Languages & Frameworks > TypeScript`
2. Configure Node.js interpreter: `File > Settings > Languages & Frameworks > Node.js`
3. Set up run configurations for dev/build commands

### Vim/Neovim

#### Plugin Setup
```lua
-- Using lazy.nvim
{
  "neovim/nvim-lspconfig",
  config = function()
    require'lspconfig'.tsserver.setup{}
  end
}
```

## Troubleshooting

### Common Issues

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Update Node.js with nvm
nvm install --lts
nvm use --lts

# Or with fnm
fnm install --lts
fnm use lts-latest
```

#### Permission Errors
```bash
# Windows - Run as administrator
# macOS/Linux - Fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Or use nvm to avoid permission issues
```

#### TypeScript Compilation Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall TypeScript
npm uninstall typescript
npm install typescript@latest

# Check tsconfig.json configuration
npx tsc --showConfig
```

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Use different port
opentscad dev --port 3001
```

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max_old_space_size=4096"

# Or in package.json
"scripts": {
  "dev": "NODE_OPTIONS='--max_old_space_size=4096' opentscad dev"
}
```

### Debug Mode

Enable detailed logging:

```bash
# Enable all debug output
DEBUG=opentscad:* opentscad dev

# Enable specific modules
DEBUG=opentscad:compiler,opentscad:server opentscad dev

# Save debug output to file
DEBUG=opentscad:* opentscad dev 2>&1 | tee debug.log
```

### Performance Issues

#### Large Projects
```bash
# Use incremental compilation
opentscad dev --incremental

# Exclude files from watching
opentscad dev --ignore "**/*.large.ts"

# Use production build for final output
opentscad build --optimize
```

#### Memory Optimization
```json
{
  "build": {
    "optimize": true,
    "treeshake": true,
    "minify": true
  },
  "watch": {
    "debounce": 500,
    "ignored": ["**/*.test.ts", "docs/**"]
  }
}
```

## Advanced Configuration

### Custom Server Configuration

#### Multi-Project Setup
```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 8080,
    "allowedOrigins": ["http://localhost:3000", "http://192.168.1.100:3000"],
    "maxConnections": 10,
    "rateLimit": {
      "enabled": true,
      "max": 100,
      "windowMs": 60000
    }
  }
}
```

#### Production Deployment
```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 80,
    "ssl": {
      "enabled": true,
      "cert": "/path/to/cert.pem",
      "key": "/path/to/key.pem"
    },
    "compression": true,
    "cors": {
      "origin": ["https://yourdomain.com"],
      "credentials": true
    }
  }
}
```

### Custom Build Pipeline

#### Webpack Integration
```javascript
// webpack.config.js
module.exports = {
  entry: './models/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new OpenTSCADPlugin({
      configPath: './opentscad.config.json'
    })
  ]
};
```

#### Vite Integration
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { openTSCAD } from '@opentscad/vite-plugin';

export default defineConfig({
  plugins: [
    openTSCAD({
      modelPaths: ['models/**/*.ts'],
      server: {
        port: 8080
      }
    })
  ]
});
```

### Environment Variables

```bash
# .env file
OPENTSCAD_SERVER_HOST=localhost
OPENTSCAD_SERVER_PORT=8080
OPENTSCAD_BUILD_OPTIMIZE=true
OPENTSCAD_WATCH_DEBOUNCE=300
DEBUG=opentscad:*
```

### CI/CD Integration

#### GitHub Actions
```yaml
# .github/workflows/build.yml
name: Build and Test
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## Next Steps

Once you have your development environment set up:

1. **Explore Templates**: Try different project templates to understand various approaches
2. **Read Documentation**: Deep dive into the [Architecture Guide](../ARCHITECTURE.md)
3. **Join Community**: Connect with other developers using OpenTSCAD
4. **Contribute**: Help improve OpenTSCAD by contributing to the project

## Getting Help

- **Documentation**: [https://opencode.ai/docs](https://opencode.ai/docs)
- **GitHub Issues**: [Report bugs and request features](https://github.com/anomalyco/opencode)
- **Discord**: Join our community for real-time help
- **Stack Overflow**: Tag questions with `opentscad`