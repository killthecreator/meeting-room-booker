import type { Request, Response } from "express";
import { meetingsService } from "./meeting.service";
import { STATUS_CODES } from "http";

export const meetingsController = {
  getAll(_req: Request, res: Response) {
    const meetings = meetingsService.getAll();
    res.json(meetings);
  },
  createMeeting(req: Request, res: Response) {
    const newMeeting = meetingsService.create(req.body);
    res.json(newMeeting);
  },
  updateMeeting(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const meeting = meetingsService.getById(id);

    if (!meeting) {
      res.status(404).send(STATUS_CODES[404]);
    }

    const updatedMeeting = meetingsService.update(id, req.body);
    res.json(updatedMeeting);
  },

  deleteMeeting(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    meetingsService.deleteById(id);
    res.json({ message: "Meeting deleted" });
  },
};
