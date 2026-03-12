import { ThirdPartyMarket, ThirdPartyRunner } from './interfaces/market.interface';

export interface MappedRunner {
  providerId: string;
  name: string;
  handicap: number;
  sortPriority: number;
}

export interface MappedMarket {
  providerId: string;
  name: string;
  startTime: Date;
  totalMatched: number;
  runners: MappedRunner[];
}

export function mapRunner(raw: ThirdPartyRunner): MappedRunner {
  return {
    providerId: String(raw.selectionId),
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

export function mapMarkets(raw: ThirdPartyMarket[]): MappedMarket[] {
  return raw.map(mapMarket);
}
// import { ThirdPartyMarket, ThirdPartyRunner } from "./interfaces/market.interface";

// export interface MappedRunner {
//   providerId: string;
//   name: string;
//   handicap: number;
//   sortPriority: number;
// }

// export interface MappedMarket {
//   providerId: string;
//   name: string;
//   startTime: Date;
//   totalMatched: number;
//   runners: MappedRunner[];
// }

// export function mapRunner(raw: ThirdPartyRunner): MappedRunner {
//   return {
//     providerId: String(raw.selectionId), // API sends number, DB expects String — cast here
//     name: raw.runnerName,
//     handicap: raw.handicap,
//     sortPriority: Number(raw.sortPriority),
//   };
// }

// export function mapMarket(raw: ThirdPartyMarket): MappedMarket {
//   return {
//     providerId: raw.marketId,
//     name: raw.marketName,
//     startTime: new Date(raw.marketStartTime),
//     totalMatched: raw.totalMatched,
//     runners: raw.runners.map(mapRunner),
//   };
// }

// export function mapMarkets(raw: ThirdPartyMarket[]): MappedMarket[] {
//   return raw.map(mapMarket);
// }