export interface ThirdPartyRunner {
  selectionId: number | string;
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
// export interface ThirdPartyRunner {
//   selectionId: number | string;  // API sends a number, typed loosely to match reality
//   runnerName: string;
//   handicap: number;
//   sortPriority: number | string;
// }

// export interface ThirdPartyMarket {
//   marketId: string;
//   marketName: string;
//   marketStartTime: string;
//   totalMatched: number;
//   runners: ThirdPartyRunner[];
// }

// export interface ThirdPartyMarketResponse {
//   sports: ThirdPartyMarket[];
// }