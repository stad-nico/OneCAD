import { isModel, Logger, Model } from "@opentscad/types";
import { FSWatcher, watch } from "chokidar";
import { resolve } from "path";

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
  onModelChange: (model: Model) => void,
): FSWatcher {
  const resolved = patterns.map((p) => resolve(cwd, p));

  const watcher = watch(resolved, {
    usePolling: true,
    interval: 100,
    ignoreInitial: false,
    depth: 99,
  });

  watcher.on("add", (filePath) => handleFileChange(filePath, onModelChange));
  watcher.on("change", (filePath) => handleFileChange(filePath, onModelChange));

  watcher.on("ready", () => {
    const watched = watcher.getWatched();
    Logger.log(`[watcher] ready. Paths: ${JSON.stringify(watched, null, 2)}`);
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
async function handleFileChange(
  filePath: string,
  callback: (model: Model) => void,
): Promise<void> {
  if (!filePath.endsWith(".ts")) {
    return;
  }

  const fileUrl = `file://${resolve(filePath)}`;

  const module = await import(fileUrl);
  const defaultExport = module.default?.default || module.default;

  if (!defaultExport || typeof defaultExport !== "function") {
    Logger.error(
      `[watcher] file did not export a valid default model: ${filePath}`,
    );
    return;
  }

  const maybeModel = await defaultExport();

  if (!isModel(maybeModel)) {
    Logger.log(maybeModel);
    Logger.error(`[watcher] file did not export a valid model: ${filePath}`);
    return;
  }

  callback(maybeModel);
}
