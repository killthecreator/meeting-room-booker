import type { Request, RequestHandler } from "express";
import { meetingsService } from "./meeting.service";
import { STATUS_CODES } from "http";
import { NotFoundError } from "../../lib/customErrors";

export const meetingsController = {
  getAll(_req, res) {
    const meetings = meetingsService.getAll();
    if (!meetings) throw new NotFoundError("Meetings not found");
    res.status(200).json(meetings);
  },
  createMeeting(req, res) {
    const newMeeting = meetingsService.create(req.body);
    res.status(201).json(newMeeting);
  },
  updateMeeting(req: Request<{ id: string }>, res) {
    const { id } = req.params;
    const meeting = meetingsService.getById(id);
    if (!meeting) res.status(404).send(STATUS_CODES[404]);
    const updatedMeeting = meetingsService.update(id, req.body);
    res.status(200).json(updatedMeeting);
  },
  deleteMeeting(req: Request<{ id: string }>, res) {
    const { id } = req.params;
    meetingsService.deleteById(id);
    res.status(204);
  },
} satisfies Record<string, RequestHandler<never>>;
