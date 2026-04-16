import { ClientEvent, ClientEventPayload, Logger } from '@opentscad/types';
import { FSWatcher, watch } from 'chokidar';
import { readFile, unlink, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import { isModelFile } from './model-file';

/**
 * Creates a file watcher for the specified patterns and calls the provided callback on model file changes.
 *
 * @param patterns an array of glob patterns to watch
 * @param cwd the current working directory to resolve the patterns against
 * @param onModelChange a callback function that is called when a model change is detected
 * @returns the watcher
 */
export function createModelWatcher(
  patterns: Array<string>,
  cwd: string,
  onModelChange: (model: ClientEventPayload<ClientEvent.ModelUpdate>) => void
): FSWatcher {
  const resolved = patterns.map((p) => resolve(cwd, p));

  const watcher = watch(resolved, {
    usePolling: true,
    interval: 100,
    ignoreInitial: false,
    depth: 99,
  });

  watcher.on('add', (filePath) => handleFileChange(filePath, onModelChange));
  watcher.on('change', (filePath) => handleFileChange(filePath, onModelChange));

  watcher.on('ready', () => {
    const watched = watcher.getWatched();
    Logger.debug(`[watcher] ready. Paths: ${JSON.stringify(watched, null, 2)}`);
  });

  return watcher;
}

/**
 * Handles a model file change by dynamically importing the file,
 * checking whether it exports a valid model, and calling the callback with the model if valid.
 *
 * @param filePath the path of the changed file
 * @param callback the callback to call with the model if the file exports a valid model
 */
async function handleFileChange(filePath: string, callback: (model: ClientEventPayload<ClientEvent.ModelUpdate>) => void): Promise<void> {
  if (!filePath.endsWith('.ts')) {
    return;
  }

  const absolutePath = resolve(filePath);

  // Copy the file to a temporary location before importing it to bypass module caching
  const fileContent = await readFile(absolutePath);
  const tempPath = absolutePath.replace(/\.ts$/, `_${Date.now()}.ts`);
  await writeFile(tempPath, fileContent);

  try {
    const module = await import(pathToFileURL(tempPath).href);

    if (!isModelFile(module)) {
      Logger.warn(`[watcher] File ${filePath} does not export a valid model. Skipping.`);
      return;
    }

    const { default: getModel, metadata } = module.default;

    callback({ treeRoot: getModel().node, metadata });
  } finally {
    try {
      await unlink(tempPath);
    } catch (e) {}
  }
}
