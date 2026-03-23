import { useEffect, useState } from "react";
import { minutesFromMidnight } from "../lib/date-utils";
import {
  isCurrentTimeOnTimeline,
  minutesToTimelinePercent,
} from "../lib/timeline";

export function CurrentTimeIndicator() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const mins = minutesFromMidnight(now);
  if (!isCurrentTimeOnTimeline(mins)) return null;

  const pct = minutesToTimelinePercent(mins);

  return (
    <div
      className="pointer-events-none absolute top-0 bottom-0 z-10"
      style={{ left: `${pct}%` }}
    >
      <div className="relative h-full">
        <div className="absolute -top-px left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-red-500 shadow-sm" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-red-500/80" />
      </div>
    </div>
  );
}
