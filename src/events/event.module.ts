import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { Event_Queue } from "./constants/event.constants";
import { PrismaModule } from "src/prisma";
import { HttpModule } from "@nestjs/axios";
import { EventProcessor } from "./event.processor";
import { EventScheduler } from "./event.schedular";
import { EventService } from "./event.service";


@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({ name: Event_Queue }),
    PrismaModule,
  ],
  providers: [
    EventProcessor,
    EventScheduler,
    EventService,
  ],
  exports: [
    EventScheduler,
    EventService,                    // ← export service
  ],
})
export class EventModule {}