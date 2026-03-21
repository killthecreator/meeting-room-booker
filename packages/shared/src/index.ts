import { z } from "zod";

export {
  googleAuthSchema,
  authUserSchema,
} from "./schemas/authUser.js";
export {
  meetingSchema,
  createMeetingDTOSchema,
  updateMeetingDTOSchema,
} from "./schemas/meeting.js";

import { authUserSchema } from "./schemas/authUser.js";
import {
  meetingSchema,
  createMeetingDTOSchema,
  updateMeetingDTOSchema,
} from "./schemas/meeting.js";

export type AuthUser = z.infer<typeof authUserSchema>;
export type MeetingDTO = z.infer<typeof meetingSchema>;
export type CreateMeetingDTO = z.infer<typeof createMeetingDTOSchema>;
export type UpdateMeetingDTO = z.infer<typeof updateMeetingDTOSchema>;
