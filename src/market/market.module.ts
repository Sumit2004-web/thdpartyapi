import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MARKET_QUEUE } from "./constants/market.constant";
import { MarketService } from "./market.service";
import { PrismaModule } from "src/prisma";
import { MarketProcessor } from "./market.processor";
import { MarketScheduler } from "./market.scheduler";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({ name: MARKET_QUEUE }),
    PrismaModule,
  ],
  providers: [
    MarketService,
    MarketProcessor,
    MarketScheduler,
  ],
  exports: [
    MarketScheduler,
    MarketService,                   // ← export service
  ],
})
export class MarketModule {}