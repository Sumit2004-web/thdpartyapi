// competition.scheduler.ts

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { COMPETITION_QUEUE, SYNC_COMPETITION_JOB} from '../constants/competition.constants';
import { PrismaService } from 'src/prisma';

@Injectable()
export class CompetitionScheduler {

  constructor(
    @InjectQueue(COMPETITION_QUEUE)
    private readonly competitionQueue: Queue,
    private readonly configService: ConfigService,
    private readonly prisma :PrismaService,
  ) {}

  async syncCompetitions() {
   console.log("Adding competition repeat job...");
  await this.competitionQueue.add(SYNC_COMPETITION_JOB, {}, { removeOnComplete: true });
    const interval = this.configService.getOrThrow<number>(
  'COMPETITION_SYNC_INTERVAL'
  );

  const repeatableJobs = await this.competitionQueue.getRepeatableJobs();

  for (const job of repeatableJobs) {
    await this.competitionQueue.removeRepeatableByKey(job.key);
  }
  
  await this.competitionQueue.add(
    SYNC_COMPETITION_JOB,
    {},
    {
      repeat: { every: interval },
    },
  );

  console.log("Competition job added.");
  }
}
