import type { Response } from "express";
import type { MeetingSyncMessage } from "@meeting-calendar/shared";
import { eventEmitter } from "./eventEmitter";

export const MEETING_SYNC_EVENT = "meeting:sync";

const clients = new Set<Response>();

eventEmitter.on(MEETING_SYNC_EVENT, (payload: MeetingSyncMessage) => {
  const line = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of [...clients]) {
    if (res.writableEnded) {
      clients.delete(res);
      continue;
    }
    try {
      res.write(line);
    } catch {
      clients.delete(res);
    }
  }
});

export function subscribeMeetingsSse(res: Response): () => void {
  clients.add(res);
  return () => {
    clients.delete(res);
  };
}

export function emitMeetingSync(payload: MeetingSyncMessage) {
  eventEmitter.emit(MEETING_SYNC_EVENT, payload);
}
