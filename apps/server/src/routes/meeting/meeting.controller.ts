import type { Request, RequestHandler } from "express";
import {
  emitMeetingSync,
  subscribeMeetingsSse,
} from "../../lib/meetingsSseHub";
import { meetingsService } from "./meeting.service";

export const meetingsController = {
  getAll(_req, res) {
    const meetings = meetingsService.getAll();
    res.status(200).json(meetings);
  },
  createMeeting(req, res) {
    const newMeeting = meetingsService.create(req.body);
    emitMeetingSync({ action: "add", meeting: newMeeting });
    res.status(201).json(newMeeting);
  },
  updateMeeting(req: Request<{ id: string }>, res) {
    const { id } = req.params;

    const updatedMeeting = meetingsService.update(
      id,
      req.body,
      res.locals.userId,
    );
    emitMeetingSync({ action: "update", meeting: updatedMeeting });
    res.status(200).json(updatedMeeting);
  },
  deleteMeeting(req: Request<{ id: string }>, res) {
    const { id } = req.params;

    const meeting = meetingsService.deleteById(id, res.locals.userId);
    emitMeetingSync({ action: "delete", meeting });
    res.status(204).send();
  },
  meetingsEventsStream(req, res) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // nginx: disable proxy buffering so SSE chunks flush to the client immediately
    res.setHeader("X-Accel-Buffering", "no");

    // send status + headers now so the client (and proxies) see a streaming response early
    res.flushHeaders?.();

    const unsubscribe = subscribeMeetingsSse(res);

    req.on("close", () => {
      unsubscribe();
      res.end();
    });
  },
} satisfies Record<string, RequestHandler<never>>;
