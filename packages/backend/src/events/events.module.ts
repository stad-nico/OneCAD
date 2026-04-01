import { Module } from "@nestjs/common";
import { ClientGateway } from "./client.gateway.js";
import { FrontendGateway } from "./frontend.gateway.js";

@Module({
  providers: [ClientGateway, FrontendGateway],
})
export class EventsModule {}
