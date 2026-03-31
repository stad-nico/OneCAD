import * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import * as path from 'path';
import { pathToFileURL } from 'url';
import * as crypto from 'crypto';

/**
 * Simplified model compiler for CLI usage.
 */
export class ModelCompiler {
  private isInitialized = false;
  
  /**
   * Initializes the compiler.
   */
  async initialize(): Promise<void> {
    this.isInitialized = true;
  }
  
  /**
   * Compiles a TypeScript model file.
   */
  async compile(source: string, projectId: string, modelId: string): Promise<CompilationResult> {
    if (!this.isInitialized) {
      throw new Error('Compiler not initialized');
    }
    
    const startTime = Date.now();
    
    // Transpile TypeScript to JavaScript
    const jsCode = await this.transpileTypeScript(source, modelId);
    
    // Execute the module to get operations
    const operations = await this.executeModel(jsCode, modelId);
    
    const compilationTimeMs = Date.now() - startTime;
    
    return {
      compiledModel: {
        metadata: {
          id: modelId,
          projectId,
          name: modelId,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        },
        operations,
        serializedOperations: operations.map(op => ({
          type: op.type,
          params: op.parameters
        })),
        sourceHash: this.calculateSourceHash(source)
      },
      compilationTimeMs,
      fromCache: false
    };
  }
  
  /**
   * Disposes the compiler.
   */
  async dispose(): Promise<void> {
    this.isInitialized = false;
  }
  
  /**
   * Transpiles TypeScript to JavaScript.
   */
  private async transpileTypeScript(source: string, modelId: string): Promise<string> {
    const result = await esbuild.build({
      stdin: {
        contents: source,
        sourcefile: `${modelId}.model.ts`
      },
      bundle: true,
      write: false,
      format: 'esm',
      target: 'esnext',
      platform: 'node',
      external: ['three', 'opencascade'],
      loader: { '.ts': 'ts' }
    });
    
    if (result.errors.length > 0) {
      const errorMessages = result.errors.map(err => err.text).join(', ');
      throw new Error(`TypeScript compilation errors: ${errorMessages}`);
    }
    
    if (!result.outputFiles || result.outputFiles.length === 0) {
      throw new Error('No output files generated from TypeScript compilation');
    }
    
    return result.outputFiles[0]!.text;
  }
  
  /**
   * Executes the transpiled model to extract operations.
   */
  private async executeModel(jsCode: string, modelId: string): Promise<Operation[]> {
    const tempFileName = `${modelId}.${Date.now()}.mjs`;
    const tempFilePath = path.join(process.cwd(), '.opentscad', tempFileName);
    
    try {
      // Ensure temp directory exists
      await fs.mkdir(path.dirname(tempFilePath), { recursive: true });
      
      // Write transpiled code to temporary file
      await fs.writeFile(tempFilePath, jsCode, 'utf8');
      
      // Import and execute the module
      const moduleUrl = pathToFileURL(tempFilePath).href + `?t=${Date.now()}`;
      const module = await import(moduleUrl);
      
      if (typeof module.default !== 'function') {
        throw new Error('Model module must export a default function');
      }
      
      const shape = await module.default();
      
      if (!shape || !Array.isArray(shape.operations)) {
        throw new Error('Model function must return an object with operations array');
      }
      
      return shape.operations;
      
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
   * Calculates SHA-256 hash of source code.
   */
  private calculateSourceHash(source: string): string {
    return crypto.createHash('sha256').update(source, 'utf8').digest('hex');
  }
}

/**
 * Simplified operation interface for CLI.
 */
export interface Operation {
  readonly type: string;
  readonly parameters: Record<string, unknown>;
}

/**
 * Simplified compiled model interface for CLI.
 */
export interface CompiledModel {
  readonly metadata: {
    readonly id: string;
    readonly projectId: string;
    readonly name: string;
    readonly tags: string[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly version: number;
  };
  readonly operations: Operation[];
  readonly serializedOperations: Array<{
    readonly type: string;
    readonly params: Record<string, unknown>;
  }>;
  readonly sourceHash: string;
}

/**
 * Compilation result interface.
 */
export interface CompilationResult {
  readonly compiledModel: CompiledModel;
  readonly compilationTimeMs: number;
  readonly fromCache: boolean;
}