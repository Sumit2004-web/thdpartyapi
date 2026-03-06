import { Queue } from "bull";
import { MARKET_QUEUE, SYNC_MARKET_JOB } from "./constants/market.constant";
import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma";

@Injectable()
export class MarketScheduler {
  constructor(
                 @InjectQueue(MARKET_QUEUE) 
                 private queue: Queue,
                 private readonly configService: ConfigService, 
                 private readonly prisma: PrismaService
              ) {}
  
  async syncMarkets() {
    
    //add the job to the queue
    console.log('Adding market sync job to the queue...');
    await this.queue.add(SYNC_MARKET_JOB, {}, { removeOnComplete: true });
    const interval=this.configService.getOrThrow<number>('MARKET_SYNC_INTERVAL')
    const repeatableJobs = await this.queue.getRepeatableJobs();
    
  for (const job of repeatableJobs) {
    await this.queue.removeRepeatableByKey(job.key);
  }
    await this.queue.add(
      SYNC_MARKET_JOB,
      {},
      {
        repeat: {
          every: interval
        },
        removeOnComplete: true
      }
    );
  }
}
