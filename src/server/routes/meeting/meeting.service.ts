import z from "zod";
import type {
  CreateMeetingDTO,
  UpdateMeetingDTO,
} from "../../../types/Meeting.type";
import db from "../../db";
import { NotFoundError } from "../../lib/customErrors";

// MOVE
const dbMeetingToMeetingDTO = z
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

export const meetingsService = {
  getAll() {
    const records = db.prepare("SELECT * FROM meetings").all();
    return dbMeetingToMeetingDTO.array().parse(records);
  },
  getById(id: string) {
    const record = db.prepare("SELECT * FROM meetings WHERE id = ?").get(id);

    if (!record) throw new NotFoundError("Meeting not found");

    return dbMeetingToMeetingDTO.parse(record);
  },

  create(data: CreateMeetingDTO) {
    const id = crypto.randomUUID();

    const queryParams = [
      id,
      data.name,
      data.description,
      data.owner.id,
      data.owner.name,
      data.owner.email,
      data.owner.picture,
      data.start,
      data.end,
    ];

    db.prepare(
      "INSERT INTO meetings (id, name, description, ownerId, ownerName, ownerEmail, ownerPicture, start, end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(...queryParams);

    return this.getById(id);
  },

  update(id: string, data: UpdateMeetingDTO) {
    const updates: string[] = [];
    const values: (number | string)[] = [];

    Object.entries(data).forEach(([key, value]) => {
      updates.push(`${key} = ?`);
      values.push(value);
    });

    values.push(id);

    db.prepare(`UPDATE meetings SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values,
    );

    return this.getById(id);
  },

  deleteById(id: string) {
    db.prepare("DELETE FROM meetings WHERE id = ?").run(id);
  },
};
