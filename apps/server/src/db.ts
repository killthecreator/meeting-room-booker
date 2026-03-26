import { Pool } from "pg";
import cron from "node-cron";
import { ENV } from "./env";

export const pool = new Pool({
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_DATABASE,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error", err);
});

/** Monday 00:00:00.000 UTC → next Monday 00:00:00.000 UTC (exclusive), ISO week. */
function getUtcIsoWeekRange(now: Date): {
  weekStartIso: string;
  weekEndExclusiveIso: string;
} {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const day = now.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const mondayMs = Date.UTC(y, m, d + diffToMonday, 0, 0, 0, 0);
  const nextMondayMs = mondayMs + 7 * 24 * 60 * 60 * 1000;
  return {
    weekStartIso: new Date(mondayMs).toISOString(),
    weekEndExclusiveIso: new Date(nextMondayMs).toISOString(),
  };
}

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      owner_id TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      owner_picture TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL
    )
  `);

  cron.schedule("59 23 * * SUN", async () => {
    console.log("🧹 Weekly cleanup (PostgreSQL, current ISO week UTC)");

    const { weekStartIso, weekEndExclusiveIso } = getUtcIsoWeekRange(
      new Date(),
    );
    const result = await pool.query(
      `DELETE FROM meetings WHERE start_time >= $1 AND start_time < $2`,
      [weekStartIso, weekEndExclusiveIso],
    );

    console.log(
      `Deleted ${result.rowCount ?? 0} meeting(s) for week ${weekStartIso} .. ${weekEndExclusiveIso}`,
    );
  });
}

export async function closePool(): Promise<void> {
  await pool.end();
}
