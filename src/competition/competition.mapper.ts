import { ThirdPartyCompetition } from "./interface/competition.interface";



export interface MappedCompetition {
  providerId: number;
  name: string;
  sportId: number;
}


export function mapCompetition(raw: ThirdPartyCompetition): MappedCompetition {
  return {
    providerId: Number(raw.competitionId),
    name: raw.competitionName,
    sportId: Number(raw.sportId),
  };
}


export function mapCompetitions(raw: ThirdPartyCompetition[]): MappedCompetition[] {
  return raw.map(mapCompetition);
}