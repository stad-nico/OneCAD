import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server } from "socket.io";

export class ExposingIoAdapter extends IoAdapter {
  private static server: Server | undefined;

  createIOServer(port: number | any, options?: any) {
    const server = super.createIOServer(port, options) as Server;
    ExposingIoAdapter.server = server;
    return server;
  }

  static getServer(): Server | undefined {
    return ExposingIoAdapter.server;
  }
}
