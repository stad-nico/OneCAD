import { mkdirSync, writeFileSync, chmodSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create bin directory
const binDir = join(__dirname, '../bin');
mkdirSync(binDir, { recursive: true });

// Binary content
const binContent = `#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import and run the CLI
const { cli } = await import(join(__dirname, '../dist/index.js'));

cli();
`;

// Write binary file
const binPath = join(binDir, 'opentscad.js');
writeFileSync(binPath, binContent);

// Make executable (Unix systems)
try {
  chmodSync(binPath, '755');
} catch (error) {
  // Ignore on Windows
}

console.log('✅ Binary prepared successfully');