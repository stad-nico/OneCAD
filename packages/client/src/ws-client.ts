import { io, Socket } from "socket.io-client";

/**
 * Creates a new socket io client
 *
 * @param url the server url
 * @returns the socket instance
 */
export function createClient(url: string): Socket {
  const socket = io(`${url}/client`, { transports: ["websocket"] });

  socket.on("connect", () => console.log(`[ws] connected: ${socket.id}`));

  socket.on("disconnect", (reason) =>
    console.log(`[ws] disconnected: ${reason}`),
  );

  socket.on("connect_error", (err) =>
    console.error(`[ws] connection error: ${err.message}`),
  );

  return socket;
}
