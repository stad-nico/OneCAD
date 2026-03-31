import * as fs from 'fs/promises';
import * as path from 'path';
import chokidar from 'chokidar';
import { ProjectConfig, validateProjectConfig } from '../utils/config.js';
import { Logger, LogLevel } from '../utils/logger.js';
import { WebSocketClient } from '../websocket/client.js';
import { ModelCompiler } from '../compiler/model-compiler.js';

/**
 * Options for the dev command.
 */
export interface DevOptions {
  readonly server?: string;
  readonly watch?: string;
  readonly projectId?: string;
  readonly verbose?: boolean;
}

/**
 * Start development mode with file watching and server connection.
 * 
 * @param options - Development options
 */
export async function devCommand(options: DevOptions): Promise<void> {
  const logger = new Logger(options.verbose ? LogLevel.Debug : LogLevel.Info);
  
  try {
    // Load project configuration
    const config = await loadProjectConfig();
    validateProjectConfig(config);
    
    const projectId = options.projectId || config.projectId;
    const serverUrl = options.server || config.serverUrl;
    const watchPattern = options.watch || config.watchPatterns[0] || '**/*.model.ts';
    
    logger.info('🚀 Starting OpenTSCAD development mode...');
    logger.info(`📂 Project: ${config.name} (${projectId})`);
    logger.info(`🌐 Server: ${serverUrl}`);
    logger.info(`👀 Watching: ${watchPattern}`);
    
    // Initialize model compiler
    const compiler = new ModelCompiler();
    await compiler.initialize();
    
    // Initialize WebSocket client
    const wsClient = new WebSocketClient(serverUrl, projectId);
    
    // Connect to server
    await wsClient.connect();
    logger.success('✅ Connected to OpenTSCAD server');
    
    // Set up file watcher
    const watcher = chokidar.watch(watchPattern, {
      ignoreInitial: false,
      persistent: true,
      cwd: process.cwd()
    });
    
    // Handle file changes
    watcher.on('add', (filePath) => handleFileChange(filePath, 'added', compiler, wsClient, logger));
    watcher.on('change', (filePath) => handleFileChange(filePath, 'changed', compiler, wsClient, logger));
    watcher.on('unlink', (filePath: string) => handleFileDelete(filePath, wsClient, logger));
    
    // Handle process termination
    const cleanup = async () => {
      logger.info('🛑 Shutting down development mode...');
      await watcher.close();
      await wsClient.disconnect();
      await compiler.dispose();
      logger.info('👋 Goodbye!');
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
    logger.info('✨ Development mode active. Press Ctrl+C to stop.');
    
  } catch (error) {
    logger.error('❌ Failed to start development mode:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

/**
 * Handles file change events.
 */
async function handleFileChange(
  filePath: string,
  changeType: 'added' | 'changed',
  compiler: ModelCompiler,
  wsClient: WebSocketClient,
  logger: Logger
): Promise<void> {
  try {
    logger.info(`📝 Model ${changeType}: ${filePath}`);
    
    // Read source code
    const fullPath = path.resolve(filePath);
    const source = await fs.readFile(fullPath, 'utf8');
    
    // Compile model
    const modelId = path.basename(filePath, path.extname(filePath));
    const result = await compiler.compile(source, wsClient.getProjectId(), modelId);
    
    // Send to server
    await wsClient.sendModelUpdate(result.compiledModel);
    
    const fromCache = result.fromCache ? ' (cached)' : '';
    logger.success(`✅ Compiled and sent ${modelId}${fromCache} (${result.compilationTimeMs}ms)`);
    
  } catch (error) {
    logger.error(`❌ Failed to process ${filePath}:`, error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Handles file deletion events.
 */
async function handleFileDelete(
  filePath: string,
  wsClient: WebSocketClient,
  logger: Logger
): Promise<void> {
  try {
    const modelId = path.basename(filePath, path.extname(filePath));
    logger.info(`🗑️  Model deleted: ${filePath}`);
    
    await wsClient.sendModelDelete(modelId);
    logger.success(`✅ Notified server of ${modelId} deletion`);
    
  } catch (error) {
    logger.error(`❌ Failed to handle deletion of ${filePath}:`, error instanceof Error ? error.message : 'Unknown error');
  }
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