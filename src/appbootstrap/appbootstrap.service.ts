import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { CompetitionService } from "src/competition/competition.service";
import { CompetitionScheduler } from "src/competition/schedular/competition.schedular";
import { DatabaseResetService } from "src/database-reset/database-reset.service";
import { EventStateScheduler } from "src/event-state/event-state.schedular";
import { EventService } from "src/events/event.service";
import { EventScheduler } from "src/events/event.schedular";
import { MarketService } from "src/market/market.service";
import { MarketScheduler } from "src/market/market.scheduler";
import { SessionService } from "src/session/session.service";
import { SessionScheduler } from "src/session/session.schedular";

@Injectable()
export class AppBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AppBootstrapService.name);

  constructor(
    private readonly databaseResetService: DatabaseResetService,
    private readonly competitionService: CompetitionService,
    private readonly eventService: EventService,
    private readonly marketService: MarketService,
    private readonly sessionService: SessionService,
    private readonly competitionScheduler: CompetitionScheduler,
    private readonly eventScheduler: EventScheduler,
    private readonly marketScheduler: MarketScheduler,
    private readonly sessionScheduler: SessionScheduler,
    private readonly eventStateScheduler: EventStateScheduler,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting bootstrap sequence...');

    try {
      // 1. Clear database
      this.logger.log('Resetting database...');
      await this.databaseResetService.resetDatabase();

      // 2. Competitions fully saved before moving on
      this.logger.log('Syncing competitions...');
      await this.competitionService.fetchAndStoreCompetitions();
      this.logger.log('Competitions done.');

      // 3. Events fully saved before markets run
      this.logger.log('Syncing events...');
      await this.eventService.fetchAndStoreEvents();
      this.logger.log('Events done.');

      // 4. Markets fully saved — events are guaranteed in DB at this point
      this.logger.log('Syncing markets...');
      await this.marketService.syncMarkets();
      this.logger.log('Markets done.');

      // 5. Register event state repeating jobs (Redis inplay/outplay)
      this.logger.log('Starting event state sync...');
      await this.eventStateScheduler.syncEventStates();

      // 6. Sessions — Redis inplay set is now populated
      this.logger.log('Syncing sessions...');
      await this.sessionService.syncInplaySessions();
      this.logger.log('Sessions done.');

      // 7. Register repeating queue jobs — initial data already seeded above
      //    Stagger them so they don't all fire at the same millisecond on first repeat
      this.logger.log('Registering repeating sync jobs...');
      await this.competitionScheduler.syncCompetitions();
      await this.delay(500);
      await this.eventScheduler.syncEvents();
      await this.delay(500);
      await this.eventScheduler.syncClosedEvents();
      await this.delay(500);
      await this.marketScheduler.syncMarkets();
      await this.delay(500);
      await this.sessionScheduler.syncSessions();

      this.logger.log('Bootstrap completed successfully.');
    } catch (error) {
      this.logger.error(`Bootstrap failed: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}