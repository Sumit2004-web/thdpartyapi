import { Process, Processor } from "@nestjs/bull";
import {
  EVENT_STATE_QUEUE,
  SYNC_INPLAY_JOB,
  SYNC_OUTPLAY_JOB,
} from "./constants/event-state.constants";
import { EventStateService } from "./event-state.service";

@Processor(EVENT_STATE_QUEUE)
export class EventStateProcessor {
  constructor(private readonly service: EventStateService) {}

  @Process(SYNC_INPLAY_JOB)
  async handleInplay() {
    await this.service.syncInplayEvents();
  }

  @Process(SYNC_OUTPLAY_JOB)
  async handleOutplay() {
    await this.service.syncOutplayEvents();
  }
}
