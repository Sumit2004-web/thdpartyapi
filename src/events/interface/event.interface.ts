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

/**
 * Raw shape returned by the third-party closed-event API.
 * Field names exactly match what the API sends.
 * Only change this if the API response shape changes.
 */
export interface ClosedEventApiItem {
  eventId: number | string;
  name: string;
}

export type ClosedEventApiResponse = ClosedEventApiItem[];