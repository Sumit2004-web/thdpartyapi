// appbootstrap/appbootstrap.module.ts
import { Module } from '@nestjs/common';
import { AppBootstrapService } from './appbootstrap.service';
import { CompetitionModule } from 'src/competition/competition.module';
import { EventModule } from 'src/events/event.module';
import { MarketModule } from 'src/market/market.module';
import { SessionModule } from 'src/session/session.module';
import { DatabaseResetModule } from 'src/database-reset/database-reset.module';
import { EventStateModule } from 'src/event-state/event-state.module';

@Module({
  imports: [
    DatabaseResetModule,
    CompetitionModule,
    EventModule,
    MarketModule,
    SessionModule,
    EventStateModule
  ],
  providers: [AppBootstrapService],
})
export class AppBootstrapModule {}