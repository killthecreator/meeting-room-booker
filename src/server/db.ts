import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("db.sqlite");

db.exec(
  "CREATE TABLE IF NOT EXISTS meetings (id TEXT PRIMARY KEY, name TEXT, description TEXT, owner TEXT, ownerId TEXT, ownerEmail TEXT, ownerPicture TEXT, start TEXT, end TEXT)",
);

export default db;
