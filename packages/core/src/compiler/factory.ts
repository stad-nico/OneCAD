import { ModelCompiler } from './model-compiler';
import { CompilerConfig, createDefaultCompilerConfig, ESBuildTarget, ESBuildPlatform } from './config';

/**
 * Creates a new ModelCompiler instance with default configuration.
 * 
 * @param overrides - Optional configuration overrides
 * @returns Configured ModelCompiler instance
 */
export function createModelCompiler(overrides: Partial<CompilerConfig> = {}): ModelCompiler {
  const config: CompilerConfig = {
    ...createDefaultCompilerConfig(),
    ...overrides
  };
  
  return new ModelCompiler(config);
}

/**
 * Creates a ModelCompiler optimized for CLI usage.
 * 
 * @param debugMode - Enable debug output
 * @returns CLI-optimized ModelCompiler instance
 */
export function createCLICompiler(debugMode = false): ModelCompiler {
  const config = createDefaultCompilerConfig();
  
  return new ModelCompiler({
    ...config,
    debugMode,
    enableCache: true,
    timeoutMs: 60000, // Longer timeout for CLI usage
    platform: ESBuildPlatform.Node
  });
}

/**
 * Creates a ModelCompiler optimized for server usage.
 * 
 * @param options - Server-specific options
 * @returns Server-optimized ModelCompiler instance
 */
export function createServerCompiler(options: {
  enableCache?: boolean;
  debugMode?: boolean;
  maxMemoryMB?: number;
} = {}): ModelCompiler {
  const config = createDefaultCompilerConfig();
  
  return new ModelCompiler({
    ...config,
    enableCache: options.enableCache ?? true,
    debugMode: options.debugMode ?? false,
    maxMemoryMB: options.maxMemoryMB ?? 1024, // More memory for server
    timeoutMs: 30000,
    platform: ESBuildPlatform.Node
  });
}

/**
 * Creates a ModelCompiler for development mode with extended debugging.
 * 
 * @returns Development-optimized ModelCompiler instance
 */
export function createDevelopmentCompiler(): ModelCompiler {
  const config = createDefaultCompilerConfig();
  
  return new ModelCompiler({
    ...config,
    debugMode: true,
    enableCache: false, // Disable cache in development for fresh results
    timeoutMs: 120000, // Very long timeout for development
    targetFormat: ESBuildTarget.ES2022,
    platform: ESBuildPlatform.Node
  });
}

// Re-export for convenience
export * from './model-compiler';
export * from './config';