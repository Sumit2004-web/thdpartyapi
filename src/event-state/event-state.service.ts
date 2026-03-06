import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma";
import { RedisService } from "src/redis";

@Injectable()
export class EventStateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async syncInplayEvents() {
    const redis = this.redisService.client;

    // Get events that are currently LIVE (active = true)
    const events = await this.prisma.event.findMany({
      where: {
        active: true, // Changed: Only get active/live events
      },
    });

    await redis.del("inplay:events");

    for (const event of events) {
      await redis.sadd("inplay:events", event.providerId.toString());
    }

    console.log(`INPLAY synced: ${events.length} live events`);
  }

  async syncOutplayEvents() {
    const redis = this.redisService.client;
    const now = new Date();

    // Get events that are NOT live but scheduled for future
    const events = await this.prisma.event.findMany({
      where: {
        active: false, // Changed: Only get inactive events
        openDate: { gt: now }, // AND scheduled for future
      },
    });

    await redis.del("offplay:events");

    for (const event of events) {
      await redis.sadd("offplay:events", event.providerId.toString());
    }

    console.log(`OUTPLAY synced: ${events.length} upcoming events`);
  }
}