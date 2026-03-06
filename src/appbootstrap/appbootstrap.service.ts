import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { CompetitionScheduler } from "src/competition/schedular/competition.schedular";
import { DatabaseResetService } from "src/database-reset/database-reset.service";
import { EventStateScheduler } from "src/event-state/event-state.schedular";
import { EventScheduler } from "src/events/event.schedular";
import { MarketScheduler } from "src/market/market.scheduler";
import { SessionScheduler } from "src/session/session.schedular";

@Injectable()
export class AppBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AppBootstrapService.name);

  constructor(
    private readonly competitionScheduler: CompetitionScheduler,
    private readonly eventSchedular: EventScheduler,
    private readonly marketSchedular: MarketScheduler,
    private readonly sessionSchedular: SessionScheduler,
    private readonly eventStateSchedular: EventStateScheduler,
    private readonly databaseResetService: DatabaseResetService
  ) {}

  async onModuleInit() {
    this.logger.log(' Starting bootstrap sequence...');
    
    try {
    // Clear database FIRST
      this.logger.log('  Resetting database...');
      await this.databaseResetService.resetDatabase();
      
     // Sync competitions and WAIT
      this.logger.log('  Syncing competitions...');
      await this.competitionScheduler.syncCompetitions();
      
      // Wait a bit for competitions to be saved
      await this.delay(2000);
      
      // Sync events and WAIT
      this.logger.log('  Syncing events...');
      await this.eventSchedular.syncEvents();
      
      // Wait a bit for events to be saved
      await this.delay(2000);

      // Sync event states
      this.logger.log('  Syncing event states...');
      await this.eventStateSchedular.syncEventStates();
      
      // Wait a bit for event states to sync
      await this.delay(1000);
      
      //  Sync markets
      this.logger.log('  Syncing markets...');
      await this.marketSchedular.syncMarkets();
      
      // Wait a bit for markets to be saved
      await this.delay(2000);
      
      // Sync sessions
      this.logger.log(' Syncing sessions...');
      await this.sessionSchedular.syncSessions();
      
      this.logger.log('Bootstrap completed successfully.');
      
    } catch (error) {
      this.logger.error(`Bootstrap failed: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve,ms));
  }
}