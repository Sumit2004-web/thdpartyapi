import { ThirdPartySession } from "./interface/session.interface";



export interface MappedSession {
  providerId: string;
  marketId: string;
  name: string;
  backPrice: number;
  layPrice: number;
  backSize: number;
  laySize: number;
  mname: string;
  gtype: string;
  sortPriority: number;
  providerTs: bigint;
}


export function mapSession(raw: ThirdPartySession): MappedSession {
  return {
    providerId: raw.SelectionId,
    marketId: raw.marketId,
    name: raw.RunnerName,
    backPrice: Number(raw.BackPrice1),
    layPrice: Number(raw.LayPrice1),
    backSize: Number(raw.BackSize1),
    laySize: Number(raw.LaySize1),
    mname: raw.mname,
    gtype: raw.gtype,
    sortPriority: Number(raw.sortPriority),
    providerTs: BigInt(raw.timestamp),
  };
}


export function mapSessions(raw: ThirdPartySession[]): MappedSession[] {
  return raw.map(mapSession);
}