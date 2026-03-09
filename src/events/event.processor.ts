import { Event_Queue, REMOVE_CLOSED_EVENTS_JOB, SYNC_EVENT_JOB } from "./constants/event.constants";
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

  @Process(REMOVE_CLOSED_EVENTS_JOB)
  async handleRemoveClosedEvents() {
    console.log("Closed-event Processor triggered!");
    await this.eventService.removeClosedEvents();
  }
}