import { DatabaseSync } from "node:sqlite";
import cron from "node-cron";

const db = new DatabaseSync(":memory:");

db.exec(
  `CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY, name TEXT, description TEXT, 
    ownerId TEXT, ownerName TEXT, ownerEmail TEXT, ownerPicture TEXT, 
    start TEXT, end TEXT
  )`,
);

// weekly "cleanup" at 23:59 on sunday
cron.schedule("59 23 * * SUN", async () => {
  console.log("🧹 Weekly cleanup (in-memory)");

  db.exec(`DELETE FROM meetings;`);

  console.log("All records deleted (VACUUM skipped, in-memory)");
});

export default db;
