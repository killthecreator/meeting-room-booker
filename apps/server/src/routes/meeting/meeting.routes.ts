import { Router } from "express";
import { meetingsController } from "./meeting.controller";
import { validateBodyMiddleware } from "../../middlewares/validateBody";
import {
  createMeetingDTOSchema,
  updateMeetingDTOSchema,
} from "@meeting-calendar/shared";

const router = Router();

router
  .route("/")
  .get(meetingsController.getAll)
  .post(
    validateBodyMiddleware(createMeetingDTOSchema),
    meetingsController.createMeeting,
  );

router
  .route("/:id")
  .patch(
    validateBodyMiddleware(updateMeetingDTOSchema),
    meetingsController.updateMeeting,
  )
  .delete(meetingsController.deleteMeeting);

router.get("/events", meetingsController.meetingsEventsStream);

export default router;
