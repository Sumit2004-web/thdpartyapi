// competition.scheduler.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Event_Queue, SYNC_EVENT_JOB } from './constants/event.constants';


@Injectable()
export class EventScheduler{

  constructor(
    @InjectQueue(Event_Queue)
    private readonly eventQueue:Queue,
    private readonly configService: ConfigService,
  ) {}

  async syncEvents() {
        
        console.log("Adding Event repeat job...");
        await this.eventQueue.add(SYNC_EVENT_JOB, {}, { removeOnComplete: true });
    const interval = this.configService.getOrThrow<number>(
  'EVENT_SYNC_INTERVAL'
  )|| 43200000;
  const repeatableJobs = await this.eventQueue.getRepeatableJobs();

  for (const job of repeatableJobs) {
    await this.eventQueue.removeRepeatableByKey(job.key);
  }
  
  await this.eventQueue.add(
    SYNC_EVENT_JOB,
    {},
    {
      repeat: { every: interval },
    },
  );

  console.log("Event job added.");
  }
}
