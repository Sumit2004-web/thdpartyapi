import { ClosedEventApiItem, Match } from "./interface/event.interface";

export interface MappedEvent {
  providerId: number;
  name: string;
  openDate: Date;
  active: boolean;
}


export interface MappedClosedEvent {
  providerId: number;
  name: string;
}


export function mapEvent(raw: Match): MappedEvent {
  return {
    providerId: Number(raw.event.id),
    name: raw.event.name.trim(),
    openDate: new Date(raw.event.openDate),
    active: Boolean(raw.active),
  };
}


export function mapEvents(raw: Match[]): MappedEvent[] {
  return raw.map(mapEvent);
}


export function mapClosedEvent(raw: ClosedEventApiItem): MappedClosedEvent {
  return {
    providerId: Number(raw.eventId),
    name: raw.name,
  };
}


export function mapClosedEvents(raw: ClosedEventApiItem[]): MappedClosedEvent[] {
  return raw.map(mapClosedEvent);
}