import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ExposingIoAdapter } from "./events/exposing-io.adapter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new ExposingIoAdapter(app));

  await app.listen(3000);

  const logger = new Logger("Bootstrap");

  logger.log("OpenTSCAD backend running on http://localhost:3000");
}

bootstrap();
