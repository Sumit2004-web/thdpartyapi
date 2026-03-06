import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { CommonModule, StorageService, UtilsService } from '@Common';
import { appConfigFactory } from '@Config';
import { AppController } from './app.controller';
import { AppCacheInterceptor } from './app-cache.interceptor';
import { MetricsInterceptor, MetricsModule, MetricsService } from './metrics';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { RedisModule } from './redis';
import { CompetitionModule } from './competition/competition.module';
import { EventModule } from './events/event.module';
import { MarketModule } from './market/market.module';
import { EventStateModule } from './event-state/event-state.module';
import { SessionModule } from './session/session.module';
import { DatabaseResetModule } from './database-reset/database-reset.module';
import { AppBootstrapService } from './appbootstrap/appbootstrap.service';
import { AppBootstrapModule } from './appbootstrap/appbootstrap.module';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: (storageService: StorageService) => ({
        ...storageService.defaultMulterOptions,
      }),
      inject: [StorageService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (appConfig: ConfigType<typeof appConfigFactory>) => ({
        ttl: appConfig.cacheTtl,
      }),
      inject: [appConfigFactory.KEY],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CommonModule,
    MetricsModule,
    PrismaModule,
    RedisModule,
    AuthModule,
    AppBootstrapModule,

   DatabaseResetModule,
    EventModule,
    MarketModule,
    EventStateModule,
    SessionModule,
    CompetitionModule,
  ],
  controllers: [AppController],
  providers: [
    {
      
      provide: APP_INTERCEPTOR,
      useFactory: (
        utilsService: UtilsService,
        metricsService: MetricsService,
      ) => {
        if (utilsService.isMetricsEnabled()) {
          return new MetricsInterceptor(metricsService);
        }
      },
      inject: [UtilsService, MetricsService],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AppCacheInterceptor,
    },
    
  ],
})
export class AppModule {}
