import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Event_Queue, REMOVE_CLOSED_EVENTS_JOB, SYNC_EVENT_JOB } from './constants/event.constants';


@Injectable()
export class EventScheduler {

  constructor(
    @InjectQueue(Event_Queue)
    private readonly eventQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  async syncEvents() {
    console.log("Adding Event repeat job...");
    await this.eventQueue.add(SYNC_EVENT_JOB, {}, { removeOnComplete: true });

    const interval = this.configService.getOrThrow<number>('EVENT_SYNC_INTERVAL') || 43200000;

    const repeatableJobs = await this.eventQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await this.eventQueue.removeRepeatableByKey(job.key);
    }

    await this.eventQueue.add(
      SYNC_EVENT_JOB,
      {},
      { repeat: { every: interval } },
    );

    console.log("Event sync job added.");
  }

  /**
   * Schedules the closed-event cleanup job.
   * Interval is read from CLOSED_EVENT_SYNC_INTERVAL env var (defaults to 5 minutes).
   */
  async syncClosedEvents() {
    console.log("Adding closed-event repeat job...");

    // Fire once immediately so the first run doesn't wait a full interval
    await this.eventQueue.add(REMOVE_CLOSED_EVENTS_JOB, {}, { removeOnComplete: true });

    const interval =
      this.configService.get<number>('CLOSED_EVENT_SYNC_INTERVAL') || 300000; // 5 min default

    // Remove any existing repeatable jobs for this key before re-registering
    const repeatableJobs = await this.eventQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      if (job.name === REMOVE_CLOSED_EVENTS_JOB) {
        await this.eventQueue.removeRepeatableByKey(job.key);
      }
    }

    await this.eventQueue.add(
      REMOVE_CLOSED_EVENTS_JOB,
      {},
      { repeat: { every: interval } },
    );

    console.log("Closed-event sync job added.");
  }
}