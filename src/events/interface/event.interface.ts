export interface EventApiResponse {
    data: Series[];
}

export interface Series {
  competition: Competition;
  match: Match[];
}

export interface Competition {
  id: number | string;
}

export interface Match {
  active: boolean;
  event: EventDetails;
}

export interface EventDetails {
  id: number | string;
  name: string;
  openDate: string;
}