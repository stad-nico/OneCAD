import * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import * as path from 'path';
import { pathToFileURL } from 'url';
import * as crypto from 'crypto';

import { Shape } from '../shape';
import { Logger } from '../shared/logger';
import { Maybe } from '../../shared/maybe';
import { CompilerConfig, validateCompilerConfig } from './config';

// Re-export for convenience
export type { CompilerConfig } from './config';
import { 
  CompiledModel, 
  ModelId, 
  ProjectId, 
  ModelMetadata 
} from '../protocol/payloads';
import { serializeOperation } from '../protocol/serialization';

/**
 * Result of a successful compilation operation.
 */
export interface CompilationResult {
  readonly compiledModel: CompiledModel;
  readonly compilationTimeMs: number;
  readonly fromCache: boolean;
}

/**
 * Compilation cache entry.
 */
interface CompilationCacheEntry {
  readonly compiledModel: CompiledModel;
  readonly timestamp: number;
  readonly sourceHash: string;
}

/**
 * OpenTSCAD Model Compiler
 * 
 * Compiles TypeScript model source code into executable operations
 * that can be processed by the OpenCascade worker. Supports caching
 * and various compilation options for optimal performance.
 */
export class ModelCompiler {
  private readonly config: CompilerConfig;
  private readonly compilationCache = new Map<string, CompilationCacheEntry>();
  private isCompiling = false;
  private compilationCount = 0;
  
  constructor(config: CompilerConfig) {
    validateCompilerConfig(config);
    this.config = { ...config }; // Defensive copy
  }
  
  /**
   * Initializes the compiler service.
   * Must be called before compiling models.
   * 
   * @throws Error when initialization fails
   */
  async initialize(): Promise<void> {
    try {
      // Modern ESBuild uses direct build API, no service initialization needed
      if (this.config.debugMode) {
        Logger.info('[ModelCompiler] Compiler initialized');
      }
    } catch (error) {
      throw new Error(`Failed to initialize compiler: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Compiles TypeScript model source code into a compiled model.
   * 
   * @param source - TypeScript source code
   * @param projectId - Project identifier
   * @param modelId - Model identifier  
   * @param modelName - Human-readable model name
   * @returns Promise resolving to compilation result
   * @throws Error when compilation fails or times out
   */
  async compile(
    source: string, 
    projectId: ProjectId, 
    modelId: ModelId,
    modelName?: string
  ): Promise<CompilationResult> {
    if (this.isCompiling) {
      throw new Error('Compilation already in progress');
    }
    
    this.validateCompilationInputs(source, projectId, modelId);
    
    const startTime = Date.now();
    const sourceHash = this.calculateSourceHash(source);
    const cacheKey = this.generateCacheKey(projectId, modelId, sourceHash);
    
    // Check cache first if enabled
    if (this.config.enableCache) {
      const cached = this.compilationCache.get(cacheKey);
      if (cached && !this.isCacheExpired(cached)) {
        if (this.config.debugMode) {
          Logger.info('[ModelCompiler] Returning cached result', { modelId, projectId });
        }
        
        return {
          compiledModel: cached.compiledModel,
          compilationTimeMs: Date.now() - startTime,
          fromCache: true
        };
      }
    }
    
    this.isCompiling = true;
    this.compilationCount++;
    
    try {
      const compiledModel = await this.performCompilation(
        source, 
        projectId, 
        modelId, 
        modelName || modelId,
        sourceHash
      );
      
      const compilationTimeMs = Date.now() - startTime;
      
      // Cache the result if caching is enabled
      if (this.config.enableCache) {
        this.compilationCache.set(cacheKey, {
          compiledModel,
          timestamp: Date.now(),
          sourceHash
        });
        
        this.evictOldCacheEntriesIfNeeded();
      }
      
      if (this.config.debugMode) {
        Logger.info('[ModelCompiler] Compilation completed', {
          modelId,
          projectId,
          operationCount: compiledModel.operations.length,
          compilationTimeMs
        });
      }
      
      return {
        compiledModel,
        compilationTimeMs,
        fromCache: false
      };
    } finally {
      this.isCompiling = false;
    }
  }
  
  /**
   * Clears the compilation cache.
   */
  clearCache(): void {
    this.compilationCache.clear();
    
    if (this.config.debugMode) {
      Logger.info('[ModelCompiler] Compilation cache cleared');
    }
  }
  
  /**
   * Gets compilation statistics.
   * 
   * @returns Current compiler statistics
   */
  getCompilationStats(): CompilationStats {
    return {
      totalCompilations: this.compilationCount,
      cacheSize: this.compilationCache.size,
      isCurrentlyCompiling: this.isCompiling,
      cacheHitRate: this.calculateCacheHitRate()
    };
  }
  
  /**
   * Disposes the compiler and cleans up resources.
   */
  async dispose(): Promise<void> {
    this.clearCache();
    this.isCompiling = false;
    
    if (this.config.debugMode) {
      Logger.info('[ModelCompiler] Compiler disposed');
    }
  }
  
  /**
   * Performs the actual compilation process.
   */
  private async performCompilation(
    source: string,
    projectId: ProjectId,
    modelId: ModelId,
    modelName: string,
    sourceHash: string
  ): Promise<CompiledModel> {
    // Step 1: Transpile TypeScript to JavaScript
    const jsCode = await this.transpileTypeScript(source, modelId);
    
    // Step 2: Execute the transpiled module to get Shape
    const shape = await this.executeModelModule(jsCode, modelId);
    
    if (!shape) {
      throw new Error('Model module did not return a Shape instance');
    }
    
    // Step 3: Create model metadata
    const now = new Date();
    const metadata: ModelMetadata = {
      id: modelId,
      projectId,
      name: modelName,
      tags: [],
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    
    // Step 4: Serialize operations
    const serializedOperations = shape.operations.map(op => serializeOperation(op));
    
    return {
      metadata,
      operations: shape.operations,
      serializedOperations,
      sourceHash
    };
  }
  
  /**
   * Transpiles TypeScript source code to JavaScript using ESBuild.
   */
  private async transpileTypeScript(source: string, modelId: ModelId): Promise<string> {
    try {
      const result = await esbuild.build({
        stdin: {
          contents: source,
          sourcefile: `${modelId}.model.ts`
        },
        bundle: true,
        write: false,
        format: 'esm',
        target: this.config.targetFormat,
        platform: this.config.platform,
        external: this.config.externals,
        loader: { '.ts': 'ts' },
        minify: false, // Keep readable for debugging
        sourcemap: this.config.debugMode ? 'inline' : false
      });
      
      if (result.errors.length > 0) {
        const errorMessages = result.errors.map(err => err.text).join(', ');
        throw new Error(`TypeScript compilation errors: ${errorMessages}`);
      }
      
      return result.outputFiles[0].text;
    } catch (error) {
      throw new Error(`TypeScript transpilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Executes the transpiled JavaScript module to extract the Shape.
   */
  private async executeModelModule(jsCode: string, modelId: ModelId): Promise<Maybe<Shape>> {
    const tempFileName = `${modelId}.${Date.now()}.mjs`;
    const tempFilePath = path.join(process.cwd(), 'temp', tempFileName);
    
    try {
      // Ensure temp directory exists
      await fs.mkdir(path.dirname(tempFilePath), { recursive: true });
      
      // Write transpiled code to temporary file
      await fs.writeFile(tempFilePath, jsCode, 'utf8');
      
      // Import and execute the module
      const moduleUrl = pathToFileURL(tempFilePath).href + `?t=${Date.now()}`;
      const module = await import(moduleUrl);
      
      if (typeof module.default !== 'function') {
        throw new Error('Model module must export a default function that returns a Shape');
      }
      
      const result = await module.default();
      
      // Handle Shape instance
      if (result instanceof Shape) {
        return result;
      }
      
      // Handle shape-like objects (for compatibility)
      if (result && typeof result === 'object' && Array.isArray((result as any).operations)) {
        if (this.config.debugMode) {
          Logger.info('[ModelCompiler] Coercing shape-like object to Shape instance');
        }
        return new Shape((result as any).operations);
      }
      
      throw new Error('Model module must return a Shape instance');
      
    } catch (error) {
      throw new Error(`Model execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Clean up temporary file
      try {
        await fs.unlink(tempFilePath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
  
  /**
   * Validates compilation inputs.
   */
  private validateCompilationInputs(source: string, projectId: ProjectId, modelId: ModelId): void {
    if (!source || source.trim() === '') {
      throw new Error('Source code cannot be empty');
    }
    
    if (!projectId || projectId.trim() === '') {
      throw new Error('Project ID cannot be empty');
    }
    
    if (!modelId || modelId.trim() === '') {
      throw new Error('Model ID cannot be empty');
    }
  }
  
  /**
   * Calculates SHA-256 hash of source code for cache key generation.
   */
  private calculateSourceHash(source: string): string {
    return crypto.createHash('sha256').update(source, 'utf8').digest('hex');
  }
  
  /**
   * Generates cache key for compilation results.
   */
  private generateCacheKey(projectId: ProjectId, modelId: ModelId, sourceHash: string): string {
    return `${projectId}:${modelId}:${sourceHash}`;
  }
  
  /**
   * Checks if a cache entry is expired.
   */
  private isCacheExpired(entry: CompilationCacheEntry): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return Date.now() - entry.timestamp > maxAge;
  }
  
  /**
   * Evicts old cache entries if cache is getting too large.
   */
  private evictOldCacheEntriesIfNeeded(): void {
    const maxCacheSize = 100; // Maximum number of cached entries
    
    if (this.compilationCache.size <= maxCacheSize) {
      return;
    }
    
    // Sort entries by timestamp (oldest first)
    const entries = Array.from(this.compilationCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    // Remove oldest entries until we're under the limit
    const toRemove = entries.slice(0, this.compilationCache.size - maxCacheSize);
    
    for (const [key] of toRemove) {
      this.compilationCache.delete(key);
    }
    
    if (this.config.debugMode) {
      Logger.info('[ModelCompiler] Evicted old cache entries', { 
        removed: toRemove.length,
        remaining: this.compilationCache.size 
      });
    }
  }
  
  /**
   * Calculates cache hit rate for statistics.
   */
  private calculateCacheHitRate(): number {
    if (this.compilationCount === 0) {
      return 0;
    }
    
    // This is a simplified calculation - in a real implementation,
    // we'd track cache hits vs misses more precisely
    return Math.min(this.compilationCache.size / this.compilationCount, 1);
  }
}

/**
 * Compilation statistics interface.
 */
export interface CompilationStats {
  readonly totalCompilations: number;
  readonly cacheSize: number;
  readonly isCurrentlyCompiling: boolean;
  readonly cacheHitRate: number;
}