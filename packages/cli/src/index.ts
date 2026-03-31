#!/usr/bin/env node

// Temporarily disable commander until dependencies are installed
console.log('OpenTSCAD CLI v0.1.0');

if (process.argv.length < 3) {
  console.log(`
Usage: opentscad <command> [options]

Commands:
  init      Initialize a new OpenTSCAD project
  dev       Start development mode with file watching
  build     Build model files for production

Options:
  -h, --help     Show help
  -v, --version  Show version

Examples:
  opentscad init
  opentscad dev --server ws://localhost:5174
  opentscad build --output dist/models.json
`);
  process.exit(0);
}

const command = process.argv[2];

switch (command) {
  case 'init':
    console.log('Init command - will be implemented once dependencies are installed');
    break;
  case 'dev':
    console.log('Dev command - will be implemented once dependencies are installed'); 
    break;
  case 'build':
    console.log('Build command - will be implemented once dependencies are installed');
    break;
  case '--version':
  case '-v':
    console.log('0.1.0');
    break;
  case '--help':
  case '-h':
    console.log('Help output');
    break;
  default:
    console.log(`Unknown command: ${command}`);
    process.exit(1);
}