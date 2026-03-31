import { Module } from "@nestjs/common";
import { ClientGateway } from "./client.gateway";
import { FrontendGateway } from "./frontend.gateway";

@Module({
  providers: [ClientGateway, FrontendGateway],
})
export class EventsModule {}
