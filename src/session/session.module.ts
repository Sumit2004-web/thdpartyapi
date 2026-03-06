

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { SessionService } from './session.service';

import { PrismaModule } from 'src/prisma';
import { RedisModule } from 'src/redis';
import { SESSION_QUEUE } from './constants/session.constant';
import { SessionProcessor } from './session.processor';
import { SessionScheduler } from './session.schedular';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    HttpModule,
    BullModule.registerQueue({
      name: SESSION_QUEUE,
    }),
  ],
  providers: [
    SessionService,
    SessionProcessor,
    SessionScheduler,
  ],
  exports:[SessionScheduler]
})
export class SessionModule {}
