import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma';
import { ThirdPartyMarketResponse } from './interfaces/market.interface';
import { mapMarket } from './market.mapper';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async syncMarkets() {
    const baseUrl = this.configService.get<string>('THIRD_PARTY_BASE_URL');
    const sportId = this.configService.get<number>('CRICKET_SPORT_ID');

    const events = await this.prismaService.event.findMany({
      where: { active: true },
    });

    this.logger.log(`Syncing markets for ${events.length} active events`);

    for (const event of events) {
      try {
        const url = `${baseUrl}/markets/getMarketlist?eventId=${event.providerId}&sportId=${sportId}`;
        this.logger.debug(`Fetching markets for event ${event.name} (${event.providerId})`);

        const response = await this.httpService.axiosRef.get<ThirdPartyMarketResponse>(url);

        if (!response.data.sports?.length) {
          this.logger.warn(`No markets found for event ${event.name}`);
          continue;
        }

        for (const raw of response.data.sports) {
          const market = mapMarket(raw);

          const savedMarket = await this.prismaService.market.upsert({
            where:  { providerId: market.providerId },
            update:  { ...market, runners: undefined, eventId: event.id },
            create:  { ...market, runners: undefined, eventId: event.id },
          });

          this.logger.debug(`Upserted market ${savedMarket.name} (${savedMarket.providerId})`);

          for (const runner of market.runners) {
            await this.prismaService.runner.upsert({
              where:  { providerId_marketId: { providerId: runner.providerId, marketId: savedMarket.id } },
              update:  { ...runner, marketId: savedMarket.id },
              create:  { ...runner, marketId: savedMarket.id },
            });
          }
        }

        this.logger.log(`Successfully synced ${response.data.sports.length} markets for event ${event.name}`);
      } catch (error) {
        this.logger.error(`Failed to sync markets for event ${event.name}: ${error.message}`, error.stack);
      }
    }

    this.logger.log('Market sync completed');
  }
}