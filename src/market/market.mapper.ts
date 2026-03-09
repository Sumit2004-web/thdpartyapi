import { ThirdPartyMarket, ThirdPartyRunner } from "./interfaces/market.interface";



export interface MappedRunner {
  providerId: string;
  name: string;
  handicap: number;
  sortPriority: number;
}


/* * Mapped internal representation of a market,
 * decoupled from the third-party API shape.
 */
export interface MappedMarket {
  providerId: string;
  name: string;
  startTime: Date;
  totalMatched: number;
  runners: MappedRunner[];
}

/**
 * Maps a single raw third-party runner to the internal shape.
 * If the API renames selectionId → runnerId etc., only update here.
 */
export function mapRunner(raw: ThirdPartyRunner): MappedRunner {
  return {
    providerId: raw.selectionId,
    name: raw.runnerName,
    handicap: raw.handicap,
    sortPriority: Number(raw.sortPriority),
  };
}

export function mapMarket(raw: ThirdPartyMarket): MappedMarket {
  return {
    providerId: raw.marketId,
    name: raw.marketName,
    startTime: new Date(raw.marketStartTime),
    totalMatched: raw.totalMatched,
    runners: raw.runners.map(mapRunner),
  };
}

/**
 * Maps an array of raw markets.
 */
export function mapMarkets(raw: ThirdPartyMarket[]): MappedMarket[] {
  return raw.map(mapMarket);
}