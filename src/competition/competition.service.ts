import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ThirdPartyCompetition } from './interface/competition.interface';
import { mapCompetition } from './competition.mapper';

@Injectable()
export class CompetitionService {
  private readonly logger = new Logger(CompetitionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async fetchAndStoreCompetitions() {
    try {
      const baseUrl = this.configService.get<string>('THIRD_PARTY_BASE_URL');
      const sportIds = this.configService.get<string>('SPORT_IDS')?.split(',').map(id => Number(id.trim())) || [];

      for (const sportId of sportIds) {
        const url = `${baseUrl}/competition/${sportId}`;
        const response = await this.httpService.axiosRef.get<ThirdPartyCompetition[]>(url);

        this.logger.log(`Found ${response.data.length} competitions for sportId ${sportId}`);

        for (const raw of response.data) {
          const comp = mapCompetition(raw);

          await this.prisma.competition.upsert({
            where:  { providerId: comp.providerId },
            update:  comp,
            create:  comp,
          });

          this.logger.log(`Saved competition: ${comp.name}`);
        }
      }
    } catch (error) {
      this.logger.error('Competition sync error:', error);
    }
  }
}