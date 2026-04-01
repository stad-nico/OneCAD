import { readFile } from "fs/promises";
import { resolve } from "path";

/**
 * Configuration for a client repository, aka where model files are located.
 * This specifies to which server to connect and which files to watch for changes.
 */
export interface ClientConfig {
  /**
   * The URL of the backend server to connect to, e.g. "http://localhost:3000".
   */
  serverUrl: string;

  /**
   * An array of file paths or glob patterns to watch for changes.
   * These paths are relative to the config file.
   */
  watch: string[];
}

/**
 * Loads the client configuration from the specified path.
 * Throws an error if the config is invalid or cannot be loaded.
 *
 * @param configPath the path of the config file to load
 * @returns the config
 */
export async function loadConfigOrThrow(
  configPath: string,
): Promise<ClientConfig> {
  const resolved = resolve(configPath);

  try {
    const raw = await readFile(resolved, "utf-8");
    const config = JSON.parse(raw) as ClientConfig;

    if (!config.serverUrl) {
      throw new Error('Config must include "serverUrl"');
    }

    if (!Array.isArray(config.watch) || config.watch.length === 0) {
      throw new Error('Config must include non-empty "watch" array');
    }

    return config;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(`Failed to load config from ${resolved}: ${message}`);
  }
}
