import { Database } from "bun:sqlite";
import cron from "node-cron";

const db = new Database("sqlite.db");

db.run(
  `CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY, name TEXT, description TEXT, 
    ownerId TEXT, ownerName TEXT, ownerEmail TEXT, ownerPicture TEXT, 
    start TEXT, end TEXT
  )`,
);

/** Monday 00:00:00.000 UTC → next Monday 00:00:00.000 UTC (exclusive), ISO week. */
function getUtcIsoWeekRange(now: Date): {
  weekStartIso: string;
  weekEndExclusiveIso: string;
} {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const day = now.getUTCDay(); // 0 Sun .. 6 Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const mondayMs = Date.UTC(y, m, d + diffToMonday, 0, 0, 0, 0);
  const nextMondayMs = mondayMs + 7 * 24 * 60 * 60 * 1000;
  return {
    weekStartIso: new Date(mondayMs).toISOString(),
    weekEndExclusiveIso: new Date(nextMondayMs).toISOString(),
  };
}

// weekly "cleanup" at 23:59 on sunday — only meetings whose start falls in the current ISO week (UTC)
cron.schedule("59 23 * * SUN", async () => {
  console.log("🧹 Weekly cleanup (in-memory, current week only)");

  const { weekStartIso, weekEndExclusiveIso } = getUtcIsoWeekRange(new Date());
  const result = db.run(`DELETE FROM meetings WHERE start >= ? AND start < ?`, [
    weekStartIso,
    weekEndExclusiveIso,
  ]);

  console.log(
    `Deleted ${result.changes} meeting(s) for week ${weekStartIso} .. ${weekEndExclusiveIso} (VACUUM skipped, in-memory)`,
  );
});

export default db;
