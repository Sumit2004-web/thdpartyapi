/**
 * Raw shape returned by the third-party fancy/session API.
 * Field names exactly match what the API sends.
 * Only change this file if the API response shape changes.
 */
export interface ThirdPartySession {
  SelectionId: string;
  RunnerName: string;
  marketId: string;
  BackPrice1: string | number;
  LayPrice1: string | number;
  BackSize1: string | number;
  LaySize1: string | number;
  mname: string;
  gtype: string;
  sortPriority: string | number;
  timestamp: string | number;
}