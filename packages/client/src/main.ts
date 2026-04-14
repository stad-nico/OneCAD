import {
  AstAssemblyNode,
  ClientEvent,
  ClientEventPayload,
  Logger,
} from "@opentscad/types";
import * as path from "path";
import { loadConfigOrThrow } from "./config";
import { createModelWatcher } from "./watcher";
import { createClient } from "./ws-client";

const configPath = process.argv[2] ?? "opentscad.json";
const resolvedConfigPath = path.resolve(configPath);
const configDir = path.dirname(resolvedConfigPath);

const config = await loadConfigOrThrow(resolvedConfigPath);

Logger.log(`[client] server listening: ${config.serverUrl}`);
Logger.debug(`[client] watching: ${config.watch.join(", ")}`);

const socket = createClient(config.serverUrl, () => {
  Logger.debug(
    `[client] broadcasting ${WATCHED_MODELS.size} cached models to new connection`,
  );
  for (const model of WATCHED_MODELS.values()) {
    socket.emit(ClientEvent.AssemblyUpdate, {
      assembly: model,
    } satisfies ClientEventPayload<ClientEvent.AssemblyUpdate>);
  }
});

const WATCHED_MODELS = new Map<string, AstAssemblyNode>();

createModelWatcher(config.watch, configDir, (model) => {
  Logger.log(`[client] ${model.id} changed`);

  WATCHED_MODELS.set(model.id, model);

  socket.emit(ClientEvent.AssemblyUpdate, {
    assembly: model,
  } satisfies ClientEventPayload<ClientEvent.AssemblyUpdate>);
});
