import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseResetService {
  constructor(private readonly prisma: PrismaService) {}

  async resetDatabase() {
    console.log(' Clearing old database data...');

    await this.prisma.$transaction([
  this.prisma.session.deleteMany(),
  this.prisma.runner.deleteMany(),
  this.prisma.market.deleteMany(),
  this.prisma.event.deleteMany(),
  this.prisma.competition.deleteMany(),
  ]);

    console.log(' Old data removed successfully');
  }
}
