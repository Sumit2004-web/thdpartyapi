import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import {
  EVENT_STATE_QUEUE,
  SYNC_INPLAY_JOB,
  SYNC_OUTPLAY_JOB,
} from "./constants/event-state.constants";

@Injectable()
export class EventStateScheduler {
  constructor(@InjectQueue(EVENT_STATE_QUEUE) private queue: Queue) {}

  async syncEventStates() {
    // INPLAY → every 2 seconds
    await this.queue.add(
      SYNC_INPLAY_JOB,
      {},
      {
        repeat: { every: 2000 },
        removeOnComplete: true,
      },
    );

    // OUTPLAY → every 10 seconds
    await this.queue.add(
      SYNC_OUTPLAY_JOB,
      {},
      {
        repeat: { every: 10000 },
        removeOnComplete: true,
      },
    );
  }
}
