import type { CreateMeetingDTO, UpdateMeetingDTO } from "@meeting-calendar/shared";
import db from "../../db";
import { NotFoundError } from "../../lib/customErrors";
import { dbMeetingToMeetingDTO } from "../../schemas/meeting.schema";

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
    const entries = Object.entries(data);
    if (entries.length === 0) return this.getById(id);

    this.getById(id);

    const updates: string[] = [];
    const values: (number | string)[] = [];

    for (const [key, value] of entries) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id);

    db.prepare(`UPDATE meetings SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values,
    );

    return this.getById(id);
  },

  deleteById(id: string) {
    this.getById(id);
    db.prepare("DELETE FROM meetings WHERE id = ?").run(id);
  },
};
