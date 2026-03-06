// src/competition/competition.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ThirdPartyCompetition } from './interface/competition.interface';



@Injectable()
export class CompetitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

 async fetchAndStoreCompetitions() {
  try {
    const baseUrl = this.configService.get<string>('THIRD_PARTY_BASE_URL');
    const sportIds = this.configService.get<string>('SPORT_IDS')?.split(',').map(id=>Number(id.trim()))||[];
    
    for(const sportId of sportIds){

    const url = `${baseUrl}/competition/${sportId}`;

    const response = await this.httpService.axiosRef.get<ThirdPartyCompetition[]>(url);
    const competitions = response.data;
   console.log(`Found ${competitions.length} competitions`);

    for (const comp of competitions) {
      await this.prisma.competition.upsert({
        where: {
          providerId: Number(comp.competitionId),
        },
        update: {
          name: comp.competitionName,
          sportId: Number(comp.sportId),
        },
        create: {
          providerId: Number(comp.competitionId),
          name: comp.competitionName,
          sportId: Number(comp.sportId),
        },
      });

      console.log("Saved:", comp.competitionName);
    }
   }
  } catch (error) {
    console.error("Competition Sync Error:", error);
  }

}
}