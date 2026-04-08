import {
  ClientEvent,
  ClientEventPayload,
  Logger,
  Model,
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
Logger.log(`[client] watching: ${config.watch.join(", ")}`);

const socket = createClient(config.serverUrl, () => {
  Logger.log(
    `[client] broadcasting ${WATCHED_MODELS.size} cached models to new connection`,
  );
  for (const model of WATCHED_MODELS.values()) {
    const { id, name, steps } = model;
    socket.emit(ClientEvent.ModelUpdate, {
      model: { id, name, steps },
    } satisfies ClientEventPayload<ClientEvent.ModelUpdate>);
  }
});

const WATCHED_MODELS = new Map<string, Model>();

createModelWatcher(config.watch, configDir, (model) => {
  const { id, name, steps } = model;

  Logger.log(`[client] ${id} changed`);
  WATCHED_MODELS.set(id, model);

  socket.emit(ClientEvent.ModelUpdate, {
    model: { id, name, steps },
  } satisfies ClientEventPayload<ClientEvent.ModelUpdate>);
});
