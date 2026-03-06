import { Process, Processor } from "@nestjs/bull";
import { MARKET_QUEUE, SYNC_MARKET_JOB } from "./constants/market.constant";
import { MarketService } from "./market.service";

@Processor(MARKET_QUEUE)
export class MarketProcessor {
  constructor(private readonly marketService: MarketService) {}

  @Process(SYNC_MARKET_JOB
  )
  async handleSync() {
    console.log('Market Processor triggered!');
    await this.marketService.syncMarkets();
  }
}
