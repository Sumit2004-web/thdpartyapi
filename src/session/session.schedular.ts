import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SESSION_QUEUE, SESSION_SYNC_JOB } from './constants/session.constant';

@Injectable()
export class SessionScheduler {
  constructor(
    @InjectQueue(SESSION_QUEUE)
    private readonly sessionQueue: Queue,
  ) {}

  async syncSessions() {
  await this.sessionQueue.add(SESSION_SYNC_JOB, {}, { removeOnComplete: true });
    await this.sessionQueue.add(
      SESSION_SYNC_JOB,
      {},
      {
        repeat: {
          every: 5000, 
        },
        removeOnComplete: true,
      },
    );
  }
}
