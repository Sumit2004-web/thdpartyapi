import { Module } from "@nestjs/common";
import { EVENT_STATE_QUEUE } from "./constants/event-state.constants";
import { EventStateService } from "./event-state.service";
import { EventStateProcessor } from "./event-state.processor";
import { EventStateScheduler } from "./event-state.schedular";
import { BullModule } from "@nestjs/bull";
import { PrismaModule } from "src/prisma";
import { RedisModule } from "src/redis";

@Module({
  imports: [
    BullModule.registerQueue({
      name: EVENT_STATE_QUEUE,
    }),
    PrismaModule,
    RedisModule
  ],
  providers: [
    EventStateService,
    EventStateProcessor,
    EventStateScheduler,
  ],
  exports:[EventStateScheduler]
})
export class EventStateModule {}
