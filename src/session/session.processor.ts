import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

import { SessionService } from './session.service';
import { SESSION_QUEUE, SESSION_SYNC_JOB } from './constants/session.constant';

@Processor(SESSION_QUEUE)
export class SessionProcessor {
  constructor(private readonly sessionService: SessionService) {}

  @Process(SESSION_SYNC_JOB)
  async handleSessionSync(job: Job) {
    await this.sessionService.syncInplaySessions();
  }
}
