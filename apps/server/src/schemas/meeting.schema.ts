import z from "zod";

/** Row shape from PostgreSQL (`meetings` table, snake_case columns). */
export const dbMeetingToMeetingDTO = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    owner_id: z.string(),
    owner_name: z.string(),
    owner_email: z.email(),
    owner_picture: z.url(),
    start_time: z.iso.datetime(),
    end_time: z.iso.datetime(),
  })
  .transform((record) => ({
    id: record.id,
    name: record.name,
    description: record.description,
    start: record.start_time,
    end: record.end_time,
    owner: {
      id: record.owner_id,
      name: record.owner_name,
      email: record.owner_email,
      picture: record.owner_picture,
    },
  }));
