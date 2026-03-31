/**
 * OpenTSCAD project configuration.
 */
export interface ProjectConfig {
  readonly projectId: string;
  readonly name: string;
  readonly description: string;
  readonly serverUrl: string;
  readonly watchPatterns: string[];
  readonly outputDir: string;
  readonly version: string;
}

/**
 * Creates default project configuration.
 * 
 * @returns Default configuration values
 */
export function createDefaultProjectConfig(): ProjectConfig {
  return {
    projectId: '',
    name: '',
    description: '',
    serverUrl: 'ws://localhost:5174',
    watchPatterns: ['**/*.model.ts'],
    outputDir: './dist',
    version: '1.0.0'
  };
}

/**
 * Validates project configuration.
 * 
 * @param config - Configuration to validate
 * @throws Error when configuration is invalid
 */
export function validateProjectConfig(config: ProjectConfig): void {
  if (!config.projectId || config.projectId.trim() === '') {
    throw new Error('Project ID cannot be empty');
  }
  
  if (!config.projectId.match(/^[a-z0-9-]+$/)) {
    throw new Error('Project ID must contain only lowercase letters, numbers, and hyphens');
  }
  
  if (!config.name || config.name.trim() === '') {
    throw new Error('Project name cannot be empty');
  }
  
  if (!config.serverUrl || config.serverUrl.trim() === '') {
    throw new Error('Server URL cannot be empty');
  }
  
  if (!config.serverUrl.match(/^wss?:\/\/.+/)) {
    throw new Error('Server URL must be a valid WebSocket URL (ws:// or wss://)');
  }
  
  if (!Array.isArray(config.watchPatterns) || config.watchPatterns.length === 0) {
    throw new Error('Watch patterns must be a non-empty array');
  }
}