import z from "zod";
import { authUserSchema } from "./authUser";

export const meetingSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(""),
  owner: authUserSchema,
  start: z.iso.datetime(),
  end: z.iso.datetime(),
});

export const createMeetingDTOSchema = meetingSchema.omit({ id: true });

export const updateMeetingDTOSchema = meetingSchema
  .omit({ id: true, owner: true })
  .partial();
