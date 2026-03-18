import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(":memory:");

db.exec(
  `CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY, name TEXT, description TEXT, 
    ownerId TEXT, ownerName TEXT, ownerEmail TEXT, ownerPicture TEXT, 
    start TEXT, end TEXT
  )`,
);

export default db;
