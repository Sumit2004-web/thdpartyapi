import { HttpService } from "@nestjs/axios";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma";
import { RedisService } from "src/redis";

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
     private readonly redis: RedisService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async syncInplaySessions() {
    const baseUrl = this.config.get<string>('THIRD_PARTY_BASE_URL');

    const inplayEvents = await this.redis.client.smembers('inplay:events');

    for (const providerEventId of inplayEvents) {
      const event = await this.prisma.event.findUnique({
        where: { providerId: Number(providerEventId) },
      });

      if (!event) continue;

      const url = `${baseUrl}/fancy/get-by-event-id?eventId=${providerEventId}`;

      try {
        const response = await this.http.axiosRef.get(url);
        const sessions = response.data;

        if (!Array.isArray(sessions)) continue;

        for (const item of sessions) {

          await this.prisma.session.upsert({
            where: {
              providerId_eventId: {
                providerId: item.SelectionId,
                eventId: event.id,
              },
            },
            update: {
              name: item.RunnerName,
              marketId: item.marketId,
              backPrice: Number(item.BackPrice1),
              layPrice: Number(item.LayPrice1),
              backSize: Number(item.BackSize1),
              laySize: Number(item.LaySize1),
              mname: item.mname,
              gtype: item.gtype,
              sortPriority: Number(item.sortPriority),
              providerTs: BigInt(item.timestamp),
            },
            create: {
              providerId: item.SelectionId,
              marketId: item.marketId,
              name: item.RunnerName,
              backPrice: Number(item.BackPrice1),
              layPrice: Number(item.LayPrice1),
              backSize: Number(item.BackSize1),
              laySize: Number(item.LaySize1),
              mname: item.mname,
              gtype: item.gtype,
              sortPriority: Number(item.sortPriority),
              providerTs: BigInt(item.timestamp),
              eventId: event.id,
            },
          });

        }

        console.log(`Sessions synced for event ${providerEventId}`);

      } catch (err) {
        console.error(`Session sync error:${providerEventId}`, err.message);
      }
    }
  }
}
