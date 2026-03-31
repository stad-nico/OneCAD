# OpenTSCAD - TypeScript-based 3D CAD Modeling

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-18+-red.svg)](https://angular.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

OpenTSCAD is a modern, TypeScript-based 3D CAD modeling system that enables developers to create complex 3D models using familiar programming paradigms. With our new **multi-repository architecture**, teams can work on distributed model projects while sharing a centralized visualization server.

## 🚀 Quick Start

### For New Projects

```bash
# Install the CLI globally
npm install -g @opentscad/cli

# Create a new project
mkdir my-cad-project
cd my-cad-project
npx @opentscad/cli init

# Start developing
npm run dev
```

### For Existing OpenTSCAD Users

Your existing projects continue to work without any changes! The new architecture maintains full backward compatibility.

## ✨ Features

### 🏗️ Multi-Repository Architecture
- **Distributed Development**: Work on separate model repositories
- **Centralized Visualization**: Shared 3D rendering server
- **Project Isolation**: Clean separation between different CAD projects
- **Team Collaboration**: Multiple developers can connect simultaneously

### 💻 Developer Experience
- **TypeScript Native**: Full IntelliSense and type safety for 3D modeling
- **Hot Module Replacement**: Live updates without recompilation delays
- **CLI Tools**: Simple commands for project management and development
- **Modern Frontend**: Angular-based interface with responsive design

### ⚡ Performance
- **Intelligent Caching**: Project-scoped compilation cache
- **Incremental Updates**: Only recompile changed models
- **Worker-Based Rendering**: Non-blocking 3D operations
- **Memory Management**: Automatic cleanup and resource optimization

### 🔧 Technical Capabilities
- **OpenCascade Integration**: Professional-grade 3D geometry kernel
- **Web-Based Visualization**: Three.js powered 3D rendering
- **Real-Time Collaboration**: WebSocket-based communication
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 📁 Project Structure

```
your-project/
├── models/                     # Your TypeScript model files
│   ├── components/
│   │   ├── bolt.model.ts      # Individual components
│   │   └── bracket.model.ts
│   └── assemblies/
│       └── main.model.ts      # Complex assemblies
├── opentscad.config.json      # Project configuration
├── package.json
└── README.md
```

## 🛠️ Development Workflow

### 1. Initialize Project
```bash
npx @opentscad/cli init
# Creates project structure and configuration
```

### 2. Develop Models
```typescript
// models/bracket.model.ts
import { box, cylinder, difference } from '@opentscad/core';

export default function bracket() {
  const base = box(50, 30, 10);
  const hole = cylinder(5, 15).translate([25, 15, 0]);
  
  return difference(base, hole);
}
```

### 3. Live Development
```bash
npm run dev
# Starts development server with hot reloading
# Opens http://localhost:5173 for 3D visualization
```

### 4. Build for Production
```bash
npm run build
# Compiles all models and generates optimized output
```

## 🌐 Multi-Project Setup

### Server Setup (One Time)
```bash
# Clone and setup the main OpenTSCAD server
git clone https://github.com/your-org/OpenTSCAD.git
cd OpenTSCAD
npm install
npm run dev
# Server runs on http://localhost:5173
```

### Connect Multiple Projects
```bash
# Project A
cd project-a
npx @opentscad/cli dev

# Project B (in another terminal)
cd project-b  
npx @opentscad/cli dev

# Both projects appear in the server's project manager UI
```

## 📖 Documentation

### Architecture & Design
- [**Architecture Overview**](ARCHITECTURE.md) - System design and component interaction
- [**TypeScript Style Guide**](TYPESCRIPT_STYLE_GUIDE.md) - Coding standards and best practices

### Component Documentation
- [**Core System**](core/README.md) - Server components and shared utilities
- [**CLI Package**](packages/cli/README.md) - Command-line interface and client tools
- [**Frontend Interface**](angular/README.md) - Web interface and visualization

### Development Guides
- [**Getting Started**](docs/getting-started.md) - Detailed setup and first model
- [**Model Development**](docs/model-development.md) - Advanced modeling techniques
- [**Project Configuration**](docs/configuration.md) - Customizing project settings
- [**Deployment**](docs/deployment.md) - Production deployment strategies

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

- [OpenCascade Technology](https://www.opencascade.com/) for the geometry kernel
- [Three.js](https://threejs.org/) for 3D rendering capabilities
- [Angular Team](https://angular.io/) for the frontend framework
- [Vite](https://vitejs.dev/) for the lightning-fast development experience

---

**Ready to start creating amazing 3D models with TypeScript?** 

[Get Started →](docs/getting-started.md) | [View Examples →](examples/) | [Join Community →](https://github.com/your-org/OpenTSCAD/discussions)

This structured logging makes it easy to trace a single model update from file change, through the server, into the worker, and out to the browser.

