import type {
  CreateMeetingDTO,
  UpdateMeetingDTO,
} from "@meeting-calendar/shared";
import { pool } from "../../db";
import { AuthenticationError, NotFoundError } from "../../lib/customErrors";
import { dbMeetingToMeetingDTO } from "../../schemas/meeting.schema";

export const meetingsService = {
  async getAll() {
    const { rows } = await pool.query(
      `SELECT id, name, description, owner_id, owner_name, owner_email, owner_picture, start_time, end_time
       FROM meetings`,
    );
    return dbMeetingToMeetingDTO.array().parse(rows);
  },

  async getById(id: string) {
    const { rows } = await pool.query(
      `SELECT id, name, description, owner_id, owner_name, owner_email, owner_picture, start_time, end_time
       FROM meetings WHERE id = $1`,
      [id],
    );
    const record = rows[0];

    if (!record) throw new NotFoundError("Meeting not found");

    return dbMeetingToMeetingDTO.parse(record);
  },

  async create(data: CreateMeetingDTO) {
    const id = crypto.randomUUID();

    await pool.query(
      `INSERT INTO meetings (
        id, name, description,
        owner_id, owner_name, owner_email, owner_picture,
        start_time, end_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        data.name,
        data.description,
        data.owner.id,
        data.owner.name,
        data.owner.email,
        data.owner.picture,
        data.start,
        data.end,
      ],
    );

    return this.getById(id);
  },

  async update(id: string, data: UpdateMeetingDTO, userId: string) {
    const meeting = await this.getById(id);

    if (meeting.owner.id !== userId) {
      throw new AuthenticationError("Not enough permissions");
    }
    const entries = Object.entries(data);
    if (entries.length === 0) return meeting;

    const name = data.name ?? meeting.name;
    const description = data.description ?? meeting.description;
    const start = data.start ?? meeting.start;
    const end = data.end ?? meeting.end;

    await pool.query(
      `UPDATE meetings
       SET name = $1, description = $2, start_time = $3, end_time = $4
       WHERE id = $5`,
      [name, description, start, end, id],
    );

    return this.getById(id);
  },

  async deleteById(id: string, userId: string) {
    const meeting = await this.getById(id);

    if (meeting.owner.id !== userId) {
      throw new AuthenticationError("Not enough permissions");
    }
    await pool.query(`DELETE FROM meetings WHERE id = $1`, [id]);
    return meeting;
  },
};
