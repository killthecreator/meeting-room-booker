import { useEffect, useState } from "react";
import {
  minutesFromMidnight,
  WORKDAY_START_MIN,
  WORKDAY_END_MIN,
  TIMELINE_MINUTES,
} from "../lib/date-utils";

export function CurrentTimeIndicator() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const mins = minutesFromMidnight(now);
  if (mins < WORKDAY_START_MIN || mins > WORKDAY_END_MIN) return null;

  const pct = ((mins - WORKDAY_START_MIN) / TIMELINE_MINUTES) * 100;

  return (
    <div
      className="pointer-events-none absolute top-0 bottom-0 z-10"
      style={{ left: `${pct}%` }}
    >
      <div className="relative h-full">
        <div className="bg-red-500 absolute -top-px left-1/2 h-2 w-2 -translate-x-1/2 rounded-full shadow-sm" />
        <div className="bg-red-500/80 absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2" />
      </div>
    </div>
  );
}
