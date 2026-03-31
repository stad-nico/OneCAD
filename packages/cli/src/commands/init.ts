import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectConfig, createDefaultProjectConfig } from '../utils/config.js';
import { Logger } from '../utils/logger.js';

/**
 * Available project templates.
 */
export enum ProjectTemplate {
  DEFAULT = 'default',
  BASIC = 'basic',
  ADVANCED = 'advanced',
  MULTI_FILE = 'multi-file'
}

/**
 * Options for the init command.
 */
export interface InitOptions {
  readonly template?: ProjectTemplate | string;
  readonly name?: string;
  readonly description?: string;
}

/**
 * Initialize a new OpenTSCAD project in the current directory.
 * 
 * @param options - Initialization options
 */
export async function initCommand(options: InitOptions): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('🚀 Initializing OpenTSCAD project...');
    
    // Check if project already exists
    const configPath = path.join(process.cwd(), 'opentscad.config.json');
    if (await fileExists(configPath)) {
      logger.error('❌ Project already initialized (opentscad.config.json exists)');
      process.exit(1);
    }
    
    // Get project details
    const projectName = options.name || path.basename(process.cwd());
    const projectId = generateProjectId(projectName);
    const template = options.template || ProjectTemplate.DEFAULT;
    
    // Validate template
    if (!isValidTemplate(template)) {
      logger.error(`❌ Invalid template: ${template}`);
      logger.info('Available templates: default, basic, advanced, multi-file');
      process.exit(1);
    }
    
    logger.info(`📋 Using template: ${template}`);
    
    // Create project configuration
    const config: ProjectConfig = {
      ...createDefaultProjectConfig(),
      projectId,
      name: projectName,
      description: options.description || `OpenTSCAD models for ${projectName}`
    };
    
    // Create project structure based on template
    await createProjectFromTemplate(config, template as ProjectTemplate);
    
    logger.success('✅ Project initialized successfully!');
    logger.info('');
    logger.info('Next steps:');
    logger.info('  1. Install dependencies: npm install');
    logger.info('  2. Start development: npm run dev');
    logger.info('  3. Connect to your OpenTSCAD server for live visualization');
    
  } catch (error) {
    logger.error('❌ Failed to initialize project:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

/**
 * Validates if a template name is supported.
 */
function isValidTemplate(template: string): template is ProjectTemplate {
  return Object.values(ProjectTemplate).includes(template as ProjectTemplate);
}

/**
 * Creates a project from the specified template.
 */
async function createProjectFromTemplate(config: ProjectConfig, template: ProjectTemplate): Promise<void> {
  const logger = new Logger();
  
  // Get template directory
  const templateDir = getTemplatePath(template);
  
  if (await dirExists(templateDir)) {
    // Copy from template directory
    await copyTemplate(templateDir, process.cwd(), config);
    logger.debug(`Copied template from: ${templateDir}`);
  } else {
    // Fallback to default structure
    logger.warn(`Template directory not found, using default structure: ${templateDir}`);
    await createProjectStructure(config);
  }
}

/**
 * Gets the path to a template directory.
 */
function getTemplatePath(template: ProjectTemplate): string {
  // In development, templates are relative to the CLI source
  // In production, they'll be relative to the installed package
  const cliDir = path.dirname(new URL(import.meta.url).pathname);
  return path.join(cliDir, '../../templates', template);
}

/**
 * Checks if a directory exists.
 */
async function dirExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Copies template files and processes placeholders.
 */
async function copyTemplate(templateDir: string, targetDir: string, config: ProjectConfig): Promise<void> {
  const logger = new Logger();
  const entries = await fs.readdir(templateDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(templateDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy directories
      await fs.mkdir(targetPath, { recursive: true });
      await copyTemplate(sourcePath, targetPath, config);
      logger.debug(`Created directory: ${entry.name}/`);
    } else {
      // Copy and process files
      await copyTemplateFile(sourcePath, targetPath, config);
      logger.debug(`Created: ${entry.name}`);
    }
  }
  
  // Create additional files that might not be in template
  await createAdditionalFiles(config);
}

/**
 * Copies a single template file and processes placeholders.
 */
async function copyTemplateFile(sourcePath: string, targetPath: string, config: ProjectConfig): Promise<void> {
  let content = await fs.readFile(sourcePath, 'utf-8');
  
  // Process placeholders
  content = content.replace(/\{\{projectName\}\}/g, config.name);
  content = content.replace(/\{\{projectId\}\}/g, config.projectId);
  content = content.replace(/\{\{description\}\}/g, config.description || '');
  
  await fs.writeFile(targetPath, content);
}

/**
 * Creates additional files not included in templates.
 */
async function createAdditionalFiles(config: ProjectConfig): Promise<void> {
  const logger = new Logger();
  
  // Create opentscad.config.json
  const configPath = 'opentscad.config.json';
  if (!await fileExists(configPath)) {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    logger.debug(`Created: ${configPath}`);
  }
  
  // Create .gitignore if it doesn't exist
  const gitignorePath = '.gitignore';
  if (!await fileExists(gitignorePath)) {
    const gitignoreContent = createGitignore();
    await fs.writeFile(gitignorePath, gitignoreContent);
    logger.debug(`Created: ${gitignorePath}`);
  }
}
async function createProjectStructure(config: ProjectConfig): Promise<void> {
  const logger = new Logger();
  
  // Create directories
  const directories = ['models', 'dist', '.opentscad'];
  
  for (const dir of directories) {
    await fs.mkdir(dir, { recursive: true });
    logger.debug(`Created directory: ${dir}/`);
  }
  
  // Write configuration file
  const configPath = 'opentscad.config.json';
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  logger.debug(`Created: ${configPath}`);
  
  // Write package.json if it doesn't exist
  const packageJsonPath = 'package.json';
  if (!await fileExists(packageJsonPath)) {
    const packageJson = createPackageJson(config);
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    logger.debug(`Created: ${packageJsonPath}`);
  }
  
  // Write tsconfig.json if it doesn't exist
  const tsconfigPath = 'tsconfig.json';
  if (!await fileExists(tsconfigPath)) {
    const tsconfig = createTsConfig();
    await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    logger.debug(`Created: ${tsconfigPath}`);
  }
  
  // Create example model file
  const exampleModelPath = 'models/example.model.ts';
  const exampleContent = createExampleModel();
  await fs.writeFile(exampleModelPath, exampleContent);
  logger.debug(`Created: ${exampleModelPath}`);
  
  // Create .gitignore if it doesn't exist
  const gitignorePath = '.gitignore';
  if (!await fileExists(gitignorePath)) {
    const gitignoreContent = createGitignore();
    await fs.writeFile(gitignorePath, gitignoreContent);
    logger.debug(`Created: ${gitignorePath}`);
  }
  
  // Create README.md
  const readmePath = 'README.md';
  const readmeContent = createReadme(config);
  await fs.writeFile(readmePath, readmeContent);
  logger.debug(`Created: ${readmePath}`);
}

/**
 * Generates a valid project ID from a name.
 */
function generateProjectId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Checks if a file exists.
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates package.json content.
 */
function createPackageJson(config: ProjectConfig): Record<string, unknown> {
  return {
    name: config.projectId,
    version: '1.0.0',
    description: config.description,
    type: 'module',
    scripts: {
      dev: 'opentscad dev',
      build: 'opentscad build'
    },
    devDependencies: {
      '@opentscad/core': '^0.1.0',
      typescript: '^5.4.0'
    }
  };
}

/**
 * Creates tsconfig.json content.
 */
function createTsConfig(): Record<string, unknown> {
  return {
    compilerOptions: {
      target: 'ES2022',
      lib: ['ES2022'],
      module: 'ESNext',
      moduleResolution: 'Node',
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      exactOptionalPropertyTypes: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true
    },
    include: ['models/**/*'],
    exclude: ['node_modules', 'dist']
  };
}

/**
 * Creates example model content.
 */
function createExampleModel(): string {
  return `import { box } from '@opentscad/core';

/**
 * Example OpenTSCAD model - a simple box.
 * 
 * This demonstrates the basic structure of an OpenTSCAD model file.
 * Models export a default function that returns a Shape.
 */
export default function createExampleBox() {
  // Create a 10x10x10 box and translate it up by 5 units
  return box(10, 10, 10).translate(0, 0, 5);
}
`;
}

/**
 * Creates .gitignore content.
 */
function createGitignore(): string {
  return `# Dependencies
node_modules/

# Build outputs
dist/
*.tsbuildinfo

# OpenTSCAD cache
.opentscad/

# Temporary files
*.tmp
*.temp

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;
}

/**
 * Creates README.md content.
 */
function createReadme(config: ProjectConfig): string {
  return `# ${config.name}

${config.description}

## Getting Started

This is an OpenTSCAD project for creating 3D models using TypeScript.

### Development

Start the development server:

\`\`\`bash
npm run dev
\`\`\`

This will:
- Watch for changes to your model files
- Compile TypeScript to executable operations
- Send updates to your OpenTSCAD visualization server

### Building

Build your models for production:

\`\`\`bash
npm run build
\`\`\`

### Project Structure

- \`models/\` - Your TypeScript model files (\`.model.ts\`)
- \`dist/\` - Compiled output
- \`opentscad.config.json\` - Project configuration

### Model Files

Model files should export a default function that returns a Shape:

\`\`\`typescript
import { box } from '@opentscad/core';

export default function myModel() {
  return box(10, 10, 10).translate(0, 0, 5);
}
\`\`\`

## Learn More

- [OpenTSCAD Documentation](https://opentscad.dev/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
`;
}