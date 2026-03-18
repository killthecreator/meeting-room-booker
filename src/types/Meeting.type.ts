import type z from "zod";
import type {
  meetingSchema,
  createMeetingDTOSchema,
  updateMeetingDTOSchema,
} from "../schemas/meeting";

export type MeetingDTO = z.infer<typeof meetingSchema>;
export type CreateMeetingDTO = z.infer<typeof createMeetingDTOSchema>;
export type UpdateMeetingDTO = z.infer<typeof updateMeetingDTOSchema>;
