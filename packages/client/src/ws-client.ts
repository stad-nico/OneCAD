import { Logger } from "@opentscad/types";
import { io, Socket } from "socket.io-client";

/**
 * Creates a new socket io client
 *
 * @param url the server url
 * @returns the socket instance
 */
export function createClient(url: string, onConnection: () => void): Socket {
  // Convert generic URL formatting if it lacks protocol (like localhost:3000)
  const fullUrl = url.startsWith("http") ? url : `http://${url}`;
  const socket = io(`${fullUrl}/client`, { transports: ["websocket"] });

  socket.on("connect", () => {
    Logger.log(`[ws] connected: ${socket.id}`);
    onConnection();
  });

  socket.on("disconnect", (reason) =>
    Logger.log(`[ws] disconnected: ${reason}`),
  );

  socket.on("connect_error", (err) =>
    Logger.error(`[ws] connection error: ${err.message}`),
  );

  return socket;
}
