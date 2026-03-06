// competition.module.ts

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';

import { CompetitionService } from './competition.service';
import { COMPETITION_QUEUE } from './constants/competition.constants';
import { CompetitionProcessor } from './processor/competition.processor';
import { CompetitionScheduler } from './schedular/competition.schedular';
import { PrismaModule } from 'src/prisma';


@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: COMPETITION_QUEUE,
    }),
    PrismaModule
  ],
  providers: [
    CompetitionService,
    CompetitionProcessor,
    CompetitionScheduler,
  ],
  exports:[CompetitionScheduler]
})
export class CompetitionModule {}
