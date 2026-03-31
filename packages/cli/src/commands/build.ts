import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectConfig, validateProjectConfig } from '../utils/config.js';
import { Logger, LogLevel } from '../utils/logger.js';
import { ModelCompiler } from '../compiler/model-compiler.js';

/**
 * Options for the build command.
 */
export interface BuildOptions {
  readonly output?: string;
  readonly format?: 'json' | 'bundle';
  readonly minify?: boolean;
  readonly projectId?: string;
}

/**
 * Build model files for production deployment.
 * 
 * @param options - Build options
 */
export async function buildCommand(options: BuildOptions): Promise<void> {
  const logger = new Logger(LogLevel.Info);
  
  try {
    // Load project configuration
    const config = await loadProjectConfig();
    validateProjectConfig(config);
    
    const projectId = options.projectId || config.projectId;
    const outputPath = options.output || config.outputDir;
    const format = options.format || 'json';
    
    logger.info('🏗️  Building OpenTSCAD project...');
    logger.info(`📂 Project: ${config.name} (${projectId})`);
    logger.info(`📤 Output: ${outputPath} (${format})`);
    
    // Find all model files
    const modelFiles = await findModelFiles(config.watchPatterns);
    
    if (modelFiles.length === 0) {
      logger.warn('⚠️  No model files found');
      return;
    }
    
    logger.info(`🔍 Found ${modelFiles.length} model file(s)`);
    
    // Initialize compiler
    const compiler = new ModelCompiler();
    await compiler.initialize();
    
    // Compile all models
    const compiledModels = [];
    let totalCompilationTime = 0;
    
    for (const filePath of modelFiles) {
      try {
        logger.info(`📝 Compiling: ${filePath}`);
        
        const source = await fs.readFile(filePath, 'utf8');
        const modelId = path.basename(filePath, path.extname(filePath));
        
        const result = await compiler.compile(source, projectId, modelId);
        compiledModels.push(result.compiledModel);
        totalCompilationTime += result.compilationTimeMs;
        
        logger.success(`✅ Compiled ${modelId} (${result.compilationTimeMs}ms)`);
        
      } catch (error) {
        logger.error(`❌ Failed to compile ${filePath}:`, error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    }
    
    // Clean up compiler
    await compiler.dispose();
    
    // Create output directory
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate output based on format
    if (format === 'json') {
      await generateJSONOutput(compiledModels, outputPath, options.minify);
    } else if (format === 'bundle') {
      await generateBundleOutput(compiledModels, outputPath, options.minify);
    }
    
    logger.success('✅ Build completed successfully!');
    logger.info(`⏱️  Total compilation time: ${totalCompilationTime}ms`);
    logger.info(`📦 Output written to: ${outputPath}`);
    
  } catch (error) {
    logger.error('❌ Build failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

/**
 * Finds all model files matching the watch patterns.
 */
async function findModelFiles(patterns: string[]): Promise<string[]> {
  const allFiles: string[] = [];
  
  for (const pattern of patterns) {
    // Simple implementation - just look for .model.ts files in models directory
    if (pattern.includes('*.model.ts')) {
      try {
        const modelsDir = 'models';
        const files = await fs.readdir(modelsDir);
        const modelFiles = files
          .filter(file => file.endsWith('.model.ts'))
          .map(file => path.join(modelsDir, file));
        allFiles.push(...modelFiles);
      } catch (error) {
        // models directory doesn't exist or can't be read
        console.warn(`Warning: Could not read models directory for pattern ${pattern}`);
      }
    }
  }
  
  // Remove duplicates and sort
  return [...new Set(allFiles)].sort();
}

/**
 * Generates JSON output format.
 */
async function generateJSONOutput(
  compiledModels: import('../compiler/model-compiler.js').CompiledModel[],
  outputPath: string,
  minify?: boolean
): Promise<void> {
  const buildOutput = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    models: compiledModels.reduce((acc, model) => {
      acc[model.metadata.id] = {
        metadata: model.metadata,
        operations: model.serializedOperations
      };
      return acc;
    }, {} as Record<string, unknown>)
  };
  
  const jsonContent = JSON.stringify(buildOutput, null, minify ? 0 : 2);
  await fs.writeFile(outputPath, jsonContent, 'utf8');
}

/**
 * Generates bundle output format (for future use).
 */
async function generateBundleOutput(
  compiledModels: import('../compiler/model-compiler.js').CompiledModel[],
  outputPath: string,
  minify?: boolean
): Promise<void> {
  // For now, just create a simple JS module export
  const moduleContent = `// OpenTSCAD Model Bundle
// Generated at: ${new Date().toISOString()}

export const models = ${JSON.stringify(
    compiledModels.reduce((acc, model) => {
      acc[model.metadata.id] = model.serializedOperations;
      return acc;
    }, {} as Record<string, unknown>),
    null,
    minify ? 0 : 2
  )};

export default models;
`;
  
  // Ensure .js extension for bundle output
  const bundleOutputPath = outputPath.endsWith('.js') ? outputPath : `${outputPath}.js`;
  await fs.writeFile(bundleOutputPath, moduleContent, 'utf8');
}

/**
 * Loads project configuration from opentscad.config.json.
 */
async function loadProjectConfig(): Promise<ProjectConfig> {
  const configPath = path.join(process.cwd(), 'opentscad.config.json');
  
  try {
    const configContent = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configContent) as ProjectConfig;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error('No opentscad.config.json found. Run "opentscad init" first.');
    }
    throw new Error(`Failed to load project configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}