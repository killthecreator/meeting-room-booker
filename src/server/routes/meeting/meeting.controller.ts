import type { Request, RequestHandler } from "express";
import { meetingsService } from "./meeting.service";

export const meetingsController = {
  getAll(_req, res) {
    const meetings = meetingsService.getAll();
    res.status(200).json(meetings);
  },
  createMeeting(req, res) {
    const newMeeting = meetingsService.create(req.body);
    res.status(201).json(newMeeting);
  },
  updateMeeting(req: Request<{ id: string }>, res) {
    const { id } = req.params;
    const updatedMeeting = meetingsService.update(id, req.body);
    res.status(200).json(updatedMeeting);
  },
  deleteMeeting(req: Request<{ id: string }>, res) {
    const { id } = req.params;
    meetingsService.deleteById(id);
    res.status(204).send();
  },
} satisfies Record<string, RequestHandler<never>>;
