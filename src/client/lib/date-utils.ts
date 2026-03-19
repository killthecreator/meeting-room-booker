/** Workday: 8:00–19:00 (minutes from midnight and length in minutes) */
export const WORKDAY_START_MIN = 8 * 60; // 480
export const WORKDAY_END_MIN = 19 * 60; // 1140
export const WORKDAY_MINUTES = WORKDAY_END_MIN - WORKDAY_START_MIN; // 660

/** Timeline scale for positioning: 8:00–19:00, matches 11 column boundaries */
export const TIMELINE_END_MIN = 19 * 60; // 1140
export const TIMELINE_MINUTES = TIMELINE_END_MIN - WORKDAY_START_MIN; // 660
export const TIMELINE_HOURS = TIMELINE_MINUTES / 60;

/** Day key for grouping: YYYY-MM-DD */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Date format for input type="date" (YYYY-MM-DD) */
export function formatDateForInput(d: Date): string {
  return dayKey(d);
}

/** Monday of the week containing date d (getDay: 0=Sun, 1=Mon, …) */
export function getMondayOfWeek(d: Date): Date {
  const out = new Date(d);
  const day = out.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  out.setDate(out.getDate() + diff);
  out.setHours(0, 0, 0, 0);
  return out;
}

/** Mon–Fri of the week containing date d */
export function getCurrentWeekDays(d: Date): Date[] {
  const monday = getMondayOfWeek(d);
  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

/** Mon–Sun for the given number of weeks starting from the week containing d */
export function getCalendarDays(d: Date, weekCount: number = 2): Date[] {
  const monday = getMondayOfWeek(d);
  const totalDays = weekCount * 7;
  return Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

/** Returns true if the date is Saturday (6) or Sunday (0) */
export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** Next weekday (Monday) from d. If d is weekday, returns d. */
export function getNextWeekday(d: Date): Date {
  const out = new Date(d);
  const day = out.getDay();
  if (day === 0)
    out.setDate(out.getDate() + 1); // Sun -> Mon
  else if (day === 6) out.setDate(out.getDate() + 2); // Sat -> Mon
  return out;
}

/** Previous weekday (Friday) from d. If d is weekday, returns d. */
export function getPreviousWeekday(d: Date): Date {
  const out = new Date(d);
  const day = out.getDay();
  if (day === 0)
    out.setDate(out.getDate() - 2); // Sun -> Fri
  else if (day === 6) out.setDate(out.getDate() - 1); // Sat -> Fri
  return out;
}

/** Parse YYYY-MM-DD string to Date (midnight in local time) */
export function parseDateInput(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Minutes from midnight for positioning in the day row */
export function minutesFromMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/** Returns a new date on the same day with the given minutes from midnight */
export function setMinutesFromMidnight(date: Date, minutes: number): Date {
  const out = new Date(date);
  out.setHours(0, 0, 0, 0);
  out.setTime(out.getTime() + minutes * 60 * 1000);
  return out;
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Format minutes from midnight as "HH:mm" for input type="time" (15-min step compatible) */
export function formatMinutesAsTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatWeekday(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "short" });
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
