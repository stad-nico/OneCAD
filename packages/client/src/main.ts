import { ClientEvent, ClientEventPayload } from "@opentscad/types";
import * as path from "path";
import { loadConfigOrThrow } from "./config";
import { createModelWatcher } from "./watcher";
import { createClient } from "./ws-client";

const configPath = process.argv[2] ?? "opentscad.json";
const resolvedConfigPath = path.resolve(configPath);
const configDir = path.dirname(resolvedConfigPath);

const config = await loadConfigOrThrow(resolvedConfigPath);

console.log(`[client] server listening: ${config.serverUrl}`);
console.log(`[client] watching: ${config.watch.join(", ")}`);

const socket = createClient(config.serverUrl);

createModelWatcher(config.watch, configDir, (model) => {
  const { id, name, steps } = model;

  console.log(`[client] ${id} changed`);

  socket.emit(ClientEvent.ModelUpdate, {
    model: { id, name, steps },
  } satisfies ClientEventPayload<ClientEvent.ModelUpdate>);
});
