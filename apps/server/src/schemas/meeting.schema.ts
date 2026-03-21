import z from "zod";

export const dbMeetingToMeetingDTO = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    ownerId: z.string(),
    ownerName: z.string(),
    ownerEmail: z.email(),
    ownerPicture: z.url(),
    start: z.iso.datetime(),
    end: z.iso.datetime(),
  })
  .transform((record) => ({
    id: record.id,
    name: record.name,
    description: record.description,
    start: record.start,
    end: record.end,
    owner: {
      id: record.ownerId,
      name: record.ownerName,
      email: record.ownerEmail,
      picture: record.ownerPicture,
    },
  }));
