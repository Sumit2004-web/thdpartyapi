import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma";
import { RedisService } from "src/redis";
import { ThirdPartySession } from "./interface/session.interface";
import { mapSession } from "./session.mapper";

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

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
        const response = await this.http.axiosRef.get<ThirdPartySession[]>(url);

        if (!Array.isArray(response.data)) continue;

        for (const raw of response.data) {
          const session = mapSession(raw);

          await this.prisma.session.upsert({
            where:  { providerId_eventId: { providerId: session.providerId, eventId: event.id } },
            update:  { ...session, eventId: event.id },
            create:  { ...session, eventId: event.id },
          });
        }

        this.logger.log(`Sessions synced for event ${providerEventId}`);
      } catch (err) {
        this.logger.error(`Session sync error for event ${providerEventId}: ${err.message}`);
      }
    }
  }
}