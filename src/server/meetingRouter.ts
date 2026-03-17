import { Router } from "express";
import db from "./db";

const router = Router();

router.get("/", (_req, res) => {
  const meetings = db.prepare("SELECT * FROM meetings").all();
  res.json(meetings);
});

router.post("/", (req, res) => {
  const { id } = req.body;

  db.prepare(
    "INSERT INTO meetings (id, name, description, owner, ownerId, ownerEmail, ownerPicture, start, end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).run(...Object.values(req.body));
  const row = db.prepare("SELECT * FROM meetings WHERE id = ?").get(id);
  res.json(row);
});

router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, start, end } = req.body;

  const existing = db.prepare("SELECT * FROM meetings WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ error: "Meeting not found" });
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (name !== undefined) {
    updates.push("name = ?");
    values.push(name);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }
  if (start !== undefined) {
    updates.push("start = ?");
    values.push(start);
  }
  if (end !== undefined) {
    updates.push("end = ?");
    values.push(end);
  }

  if (updates.length === 0) {
    return res.json(existing);
  }

  values.push(id);
  db.prepare(`UPDATE meetings SET ${updates.join(", ")} WHERE id = ?`).run(
    ...values,
  );

  const row = db.prepare("SELECT * FROM meetings WHERE id = ?").get(id);
  res.json(row);
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM meetings WHERE id = ?").run(id);
  res.json({ message: "Meeting deleted" });
});

export default router;
