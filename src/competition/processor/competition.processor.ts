// competition.processor.ts

import { Processor, Process } from '@nestjs/bull';
import { COMPETITION_QUEUE, SYNC_COMPETITION_JOB} from '../constants/competition.constants';
import { CompetitionService } from '../competition.service';
@Processor(COMPETITION_QUEUE)
export class CompetitionProcessor {

  constructor(
    private readonly competitionService: CompetitionService,
  ) {}

  @Process(SYNC_COMPETITION_JOB)
  async handleCompetitionSync() {
      console.log("Processor triggered!");
    await this.competitionService.fetchAndStoreCompetitions();
  }
}
