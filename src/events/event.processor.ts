import { Event_Queue, SYNC_EVENT_JOB } from "./constants/event.constants";
import { EventService } from "./event.service";
import { Process,Processor } from "@nestjs/bull";

@Processor(Event_Queue)
export class EventProcessor{

  constructor(private readonly eventService:EventService
  ){}

  @Process(SYNC_EVENT_JOB)
  async handleSync(){
    console.log("Event Processor triggered! ")
    await this.eventService.fetchAndStoreEvents()
  }
}