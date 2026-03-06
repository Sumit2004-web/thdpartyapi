import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma';
import { ThirdPartyMarketResponse } from './interfaces/market.interface';

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
      where: {
        active: true,
      },
    });

    this.logger.log(`Syncing markets for ${events.length} active events`);

    for (const event of events) {
      try {
        const url = `${baseUrl}/markets/getMarketlist?eventId=${event.providerId}&sportId=${sportId}`;
        this.logger.debug(
          `Fetching markets for event ${event.name} (${event.providerId})`,
        );

        const response = await this.httpService.axiosRef.get<ThirdPartyMarketResponse>(url);
        const markets = response.data.sports;

        if (!markets || markets.length === 0) {
          this.logger.warn(`No markets found for event ${event.name}`);
          continue;
        }

        for (const apiMarket of markets) {
          const marketData = {
            providerId: apiMarket.marketId,
            name: apiMarket.marketName,
            startTime: new Date(apiMarket.marketStartTime),
            totalMatched: apiMarket.totalMatched,
            eventId: event.id,
          };

          const market = await this.prismaService.market.upsert({
            where: { providerId: apiMarket.marketId },
            update: marketData,
            create: marketData,
          });

          this.logger.debug(
            `Upserted market ${market.name} (${market.providerId})`,
          );

          // Batch upsert runners for better performance
          for (const runner of apiMarket.runners) {
            await this.prismaService.runner.upsert({
              where: {
                providerId_marketId: {
                  providerId: runner.selectionId,
                  marketId: market.id,
                },
              },
              update: {
                name: runner.runnerName,
                handicap: runner.handicap,
                sortPriority: Number(runner.sortPriority),
              },
              create: {
                providerId: runner.selectionId,
                name: runner.runnerName,
                handicap: runner.handicap,
                sortPriority: Number(runner.sortPriority),
                marketId: market.id,
              },
            });
          }
        }

        this.logger.log(
          `Successfully synced ${markets.length} markets for event ${event.name}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync markets for event ${event.name}: ${error.message}`,
          error.stack,
        );
        // Continue with next event instead of failing completely
      }
    }

    this.logger.log('Market sync completed');
  }
}
