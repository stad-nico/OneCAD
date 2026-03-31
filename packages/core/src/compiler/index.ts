/**
 * OpenTSCAD Model Compiler
 * 
 * This module provides TypeScript model compilation capabilities for the
 * multi-repository OpenTSCAD architecture. It extracts and standardizes
 * the compilation logic previously embedded in the Vite plugin.
 */

export * from './config';
export * from './model-compiler';
export * from './factory';

// Common exports for convenience
export type { CompilerConfig, CompilationResult, CompilationStats } from './model-compiler';
export { 
  createModelCompiler, 
  createCLICompiler, 
  createServerCompiler, 
  createDevelopmentCompiler 
} from './factory';
export { 
  createDefaultCompilerConfig,
  validateCompilerConfig,
  ESBuildTarget,
  ESBuildPlatform 
} from './config';