/**
 * Configuration options for the OpenTSCAD model compiler.
 */
export interface CompilerConfig {
  /** Maximum compilation time in milliseconds before timeout */
  readonly timeoutMs: number;
  
  /** Enable compilation result caching to improve performance */
  readonly enableCache: boolean;
  
  /** Enable debug output during compilation process */
  readonly debugMode: boolean;
  
  /** Maximum memory usage in megabytes for compilation */
  readonly maxMemoryMB: number;
  
  /** Target format for compiled JavaScript output */
  readonly targetFormat: ESBuildTarget;
  
  /** Platform target for ESBuild compilation */
  readonly platform: ESBuildPlatform;
  
  /** External modules to exclude from bundling */
  readonly externals: string[];
}

/**
 * ESBuild target formats.
 */
export enum ESBuildTarget {
  ES2020 = 'es2020',
  ES2022 = 'es2022',
  ESNext = 'esnext'
}

/**
 * ESBuild platform targets.
 */
export enum ESBuildPlatform {
  Node = 'node',
  Browser = 'browser'
}

/**
 * Creates default compiler configuration.
 * 
 * @returns Default configuration suitable for most use cases
 */
export function createDefaultCompilerConfig(): CompilerConfig {
  return {
    timeoutMs: 30000,
    enableCache: true,
    debugMode: false,
    maxMemoryMB: 512,
    targetFormat: ESBuildTarget.ESNext,
    platform: ESBuildPlatform.Node,
    externals: ['three', 'opencascade']
  };
}

/**
 * Validates compiler configuration and throws if invalid.
 * 
 * @param config - Configuration to validate
 * @throws Error when configuration is invalid
 */
export function validateCompilerConfig(config: CompilerConfig): void {
  if (config.timeoutMs <= 0) {
    throw new Error('Compiler timeout must be positive');
  }
  
  if (config.maxMemoryMB <= 0) {
    throw new Error('Max memory must be positive');
  }
  
  if (config.maxMemoryMB < 128) {
    throw new Error('Max memory must be at least 128MB');
  }
  
  if (!Object.values(ESBuildTarget).includes(config.targetFormat)) {
    throw new Error(`Invalid target format: ${config.targetFormat}`);
  }
  
  if (!Object.values(ESBuildPlatform).includes(config.platform)) {
    throw new Error(`Invalid platform: ${config.platform}`);
  }
}