#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import and run the CLI
const { cli } = await import(join(__dirname, '../dist/index.js'));

cli();