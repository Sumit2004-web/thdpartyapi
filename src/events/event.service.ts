import { Injectable } from "@nestjs/common";

import { HttpService } from "@nestjs/axios";
import { PrismaService } from "src/prisma";
import { ConfigService } from "@nestjs/config";
import { EventApiResponse } from "./interface/event.interface";


@Injectable()

export class EventService{

  constructor(
    private readonly configService:ConfigService,
    private readonly httpService:HttpService,
    private readonly prismaService:PrismaService
  ) { }

  async fetchAndStoreEvents(){
    try {
      const baseUrl=this.configService.get<string>('THIRD_PARTY_BASE_URL')
    const sportIds=this.configService.get<String>('SPORT_IDS')?.split(',').map(id=>Number(id.trim()))||[];
    for(const sportId of sportIds){
    const url=`${baseUrl}/event/get-series-redis/${sportId}`

    const response=await this.httpService.axiosRef.get<EventApiResponse>(url)

    const seriesData=response.data.data

    for(const series of seriesData){
      const competitionProviderId=Number(series.competition.id)

      //FIND COMPETITION IN DB
      const competition=await this.prismaService.competition.findUnique({
        where:{
          providerId:competitionProviderId
        }
      })
      if(!competition){
        console.log("Competition Not Found")
        continue;
      }
      for (const match of series.match) {

        await this.prismaService.event.upsert({
          where: {
            providerId: Number(match.event.id),
          },
          update: {
            name: match.event.name.trim(),
            openDate: new Date(match.event.openDate),
            active: Boolean(match.active),
            competitionId: competition.id,
          },
          create: {
            providerId: Number(match.event.id),
            name: match.event.name.trim(),
            openDate: new Date(match.event.openDate),
            active: Boolean(match.active),
            competitionId: competition.id,
          },
        });

        console.log("Saved event:", match.event.name);
      }
    }
    
   }

    } catch (error) {
          console.error("Event sync error:", error);
    }
  }

}