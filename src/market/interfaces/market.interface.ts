export interface ThirdPartyRunner {
  selectionId: string;
  runnerName: string;
  handicap: number;
  sortPriority: number | string;
}

export interface ThirdPartyMarket {
  marketId: string;
  marketName: string;
  marketStartTime: string;
  totalMatched: number;
  runners: ThirdPartyRunner[];
}

export interface ThirdPartyMarketResponse {
  sports: ThirdPartyMarket[];
}