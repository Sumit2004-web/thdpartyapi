import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { PrismaService } from "src/prisma";
import { ConfigService } from "@nestjs/config";
import { ClosedEventApiResponse, EventApiResponse } from "./interface/event.interface";
import { mapClosedEvent, mapEvent } from "./event.mapper";
@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) {}

  async fetchAndStoreEvents() {
    try {
      const baseUrl = this.configService.get<string>('THIRD_PARTY_BASE_URL');
      const sportIds = this.configService.get<string>('SPORT_IDS')?.split(',').map(id => Number(id.trim())) || [];

      // Fetch ALL competitions once and index by providerId — no per-series DB hit
      const allCompetitions = await this.prismaService.competition.findMany();
      const competitionMap = new Map(allCompetitions.map(c => [c.providerId, c]));

      for (const sportId of sportIds) {
        const url = `${baseUrl}/event/get-series-redis/${sportId}`;
        const response = await this.httpService.axiosRef.get<EventApiResponse>(url);

        for (const series of response.data.data) {
          const competitionProviderId = Number(series.competition.id);

          // O(1) lookup — no DB query inside the loop
          const competition = competitionMap.get(competitionProviderId);

          if (!competition) {
            this.logger.warn(`Competition not found for providerId: ${competitionProviderId}`);
            continue;
          }

          for (const raw of series.match) {
            const event = mapEvent(raw);

            await this.prismaService.event.upsert({
              where:  { providerId: event.providerId },
              update:  { ...event, competitionId: competition.id },
              create:  { ...event, competitionId: competition.id },
            });

            this.logger.log(`Saved event: ${event.name}`);
          }
        }
      }
    } catch (error) {
      this.logger.error("Event sync error:", error);
    }
  }

 
  async removeClosedEvents() {
    try {
      const baseUrl = this.configService.get<string>('THIRD_PARTY_BASE_URL');
      const sportNames = this.configService.get<string>('SPORT_NAMES')?.split(',').map(s => s.trim()) || [];

      if (sportNames.length === 0) {
        this.logger.warn('SPORT_NAMES env var is not set — skipping closed-event sync.');
        return;
      }

      for (const sport of sportNames) {
        this.logger.log(`Fetching closed events for sport: ${sport}`);

        const url = `${baseUrl}/event/closed-event?sport=${sport}`;
        const response = await this.httpService.axiosRef.get<ClosedEventApiResponse>(url);

        if (!Array.isArray(response.data) || response.data.length === 0) {
          this.logger.log(`No closed events for sport: ${sport}`);
          continue;
        }

        this.logger.log(`Found ${response.data.length} closed event(s) for sport: ${sport}`);

        for (const raw of response.data) {
          const closed = mapClosedEvent(raw);

          const updated = await this.prismaService.event.updateMany({
            where: { providerId: closed.providerId, active: true },
            data:  { active: false },
          });

          if (updated.count > 0) {
            this.logger.log(`Deactivated event "${closed.name}" (providerId: ${closed.providerId})`);
          } else {
            this.logger.debug(`Event "${closed.name}" (providerId: ${closed.providerId}) was already inactive or not found.`);
          }
        }

        this.logger.log(`Closed-event sync completed for sport: ${sport}`);
      }
    } catch (error) {
      this.logger.error('Closed-event sync error:', error);
    }
  }
}