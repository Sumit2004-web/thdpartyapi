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

    const events = await this.prismaService.event.findMany({
      where: { active: true },
      include: { competition: { select: { sportId: true } } },
    });

    this.logger.log(`Syncing markets for ${events.length} active events`);

    for (const event of events) {
      try {
        const url = `${baseUrl}/markets/getMarketlist?eventId=${event.providerId}&sportId=${event.competition.sportId}`;
        this.logger.debug(`Fetching markets for event ${event.name} (${event.providerId})`);

        const response = await this.httpService.axiosRef.get<ThirdPartyMarketResponse>(url);
        const markets = response.data.sports;

        if (!markets || markets.length === 0) {
          this.logger.warn(`No markets found for event ${event.name}`);
          continue;
        }

        for (const raw of markets) {
          const { runners, ...marketData } = mapMarket(raw);

          const savedMarket = await this.prismaService.market.upsert({
            where:  { providerId: marketData.providerId },
            update:  { ...marketData, eventId: event.id },
            create:  { ...marketData, eventId: event.id },
          });

          this.logger.debug(`Upserted market ${savedMarket.name} (${savedMarket.providerId})`);

          for (const runner of runners) {
            await this.prismaService.runner.upsert({
              where:  { providerId_marketId: { providerId: runner.providerId, marketId: savedMarket.id } },
              update:  { ...runner, marketId: savedMarket.id },
              create:  { ...runner, marketId: savedMarket.id },
            });
          }
        }

        this.logger.log(`Successfully synced ${markets.length} markets for event ${event.name}`);
      } catch (error) {
        this.logger.error(`Failed to sync markets for event ${event.name}: ${error.message}`, error.stack);
      }
    }

    this.logger.log('Market sync completed');
  }
}
// import { HttpService } from '@nestjs/axios';
// import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PrismaService } from 'src/prisma';
// import { ThirdPartyMarketResponse } from './interfaces/market.interface';
// import { mapMarket } from './market.mapper';

// @Injectable()
// export class MarketService {
//   private readonly logger = new Logger(MarketService.name);

//   constructor(
//     private readonly prismaService: PrismaService,
//     private readonly httpService: HttpService,
//     private readonly configService: ConfigService,
//   ) {}

//   async syncMarkets() {
//     const baseUrl = this.configService.get<string>('THIRD_PARTY_BASE_URL');

//     const events = await this.prismaService.event.findMany({
//       where: { active: true },
//       include: { competition: { select: { sportId: true } } },
//     });

//     // Build a Map of providerId → DB id so we can resolve any eventId the API returns
//     const eventProviderMap = new Map(events.map(e => [e.providerId, e.id]));

//     this.logger.log(`Syncing markets for ${events.length} active events`);

//     for (const event of events) {
//       try {
//         const url = `${baseUrl}/markets/getMarketlist?eventId=${event.providerId}&sportId=${event.competition.sportId}`;
//         this.logger.debug(`Fetching markets for event ${event.name} (${event.providerId})`);

//         const response = await this.httpService.axiosRef.get<ThirdPartyMarketResponse>(url);

//         if (!response.data.sports?.length) {
//           this.logger.warn(`No markets found for event ${event.name}`);
//           continue;
//         }

//         let savedCount = 0;

//         for (const raw of response.data.sports) {
//           const { eventProviderId, runners, ...marketData } = mapMarket(raw);

//           // Use the eventId the API actually returned for this market,
//           // not the event we used to query — they can differ
//           const dbEventId = eventProviderMap.get(eventProviderId);

//           if (!dbEventId) {
//             this.logger.warn(
//               `Market "${marketData.name}" (${marketData.providerId}) skipped — ` +
//               `its eventProviderId ${eventProviderId} is not in our DB`
//             );
//             continue;
//           }

//           const savedMarket = await this.prismaService.market.upsert({
//             where:  { providerId: marketData.providerId },
//             update:  { ...marketData, eventId: dbEventId },
//             create:  { ...marketData, eventId: dbEventId },
//           });

//           this.logger.debug(`Upserted market ${savedMarket.name} (${savedMarket.providerId})`);

//           for (const runner of runners) {
//             await this.prismaService.runner.upsert({
//               where:  { providerId_marketId: { providerId: runner.providerId, marketId: savedMarket.id } },
//               update:  { ...runner, marketId: savedMarket.id },
//               create:  { ...runner, marketId: savedMarket.id },
//             });
//           }

//           savedCount++;
//         }

//         this.logger.log(`Successfully synced ${savedCount} markets for event ${event.name}`);
//       } catch (error) {
//         this.logger.error(`Failed to sync markets for event ${event.name}: ${error.message}`, error.stack);
//       }
//     }

//     this.logger.log('Market sync completed');
//   }
// }
// // import { HttpService } from '@nestjs/axios';
// // import { Injectable, Logger } from '@nestjs/common';
// // import { ConfigService } from '@nestjs/config';
// // import { PrismaService } from 'src/prisma';
// // import { ThirdPartyMarketResponse } from './interfaces/market.interface';
// // import { mapMarket } from './market.mapper';
// // @Injectable()
// // export class MarketService {
// //   private readonly logger = new Logger(MarketService.name);

// //   constructor(
// //     private readonly prismaService: PrismaService,
// //     private readonly httpService: HttpService,
// //     private readonly configService: ConfigService,
// //   ) {}

// //   async syncMarkets() {
// //     const baseUrl = this.configService.get<string>('THIRD_PARTY_BASE_URL');

// //     const events = await this.prismaService.event.findMany({
// //       where: { active: true },
// //       include: { competition: { select: { sportId: true } } },
// //     });

// //     // Build a Map of providerId → DB id so we can resolve any eventId the API returns
// //     const eventProviderMap = new Map(events.map(e => [e.providerId, e.id]));

// //     this.logger.log(`Syncing markets for ${events.length} active events`);

// //     for (const event of events) {
// //       try {
// //         const url = `${baseUrl}/markets/getMarketlist?eventId=${event.providerId}&sportId=${event.competition.sportId}`;
// //         this.logger.debug(`Fetching markets for event ${event.name} (${event.providerId})`);

// //         const response = await this.httpService.axiosRef.get<ThirdPartyMarketResponse>(url);

// //         if (!response.data.sports?.length) {
// //           this.logger.warn(`No markets found for event ${event.name}`);
// //           continue;
// //         }

// //         let savedCount = 0;

// //         for (const raw of response.data.sports) {
// //           const market = mapMarket(raw);

// //           // Use the eventId the API actually returned for this market,
// //           // not the event we used to query — they can differ
// //           const dbEventId = eventProviderMap.get(market.eventProviderId);

// //           if (!dbEventId) {
// //             this.logger.warn(
// //               `Market "${market.name}" (${market.providerId}) skipped — ` +
// //               `its eventProviderId ${market.eventProviderId} is not in our DB`
// //             );
// //             continue;
// //           }

// //           const savedMarket = await this.prismaService.market.upsert({
// //             where:  { providerId: market.providerId },
// //             update:  { ...market, runners: undefined, eventProviderId: undefined, eventId: dbEventId },
// //             create:  { ...market, runners: undefined, eventProviderId: undefined, eventId: dbEventId },
// //           });

// //           this.logger.debug(`Upserted market ${savedMarket.name} (${savedMarket.providerId})`);

// //           for (const runner of market.runners) {
// //             await this.prismaService.runner.upsert({
// //               where:  { providerId_marketId: { providerId: runner.providerId, marketId: savedMarket.id } },
// //               update:  { ...runner, marketId: savedMarket.id },
// //               create:  { ...runner, marketId: savedMarket.id },
// //             });
// //           }

// //           savedCount++;
// //         }

// //         this.logger.log(`Successfully synced ${savedCount} markets for event ${event.name}`);
// //       } catch (error) {
// //         this.logger.error(`Failed to sync markets for event ${event.name}: ${error.message}`, error.stack);
// //       }
// //     }

// //     this.logger.log('Market sync completed');
// //   }
// // }