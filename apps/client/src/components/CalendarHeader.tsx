import { cn } from "../lib/cn";
import { HOURS } from "../config";
import { HalfHourTimeSeparator } from "./TimeSeparators/HalfHourTimeSeparator";
import {
  FirstQuarterHourTimeSeparator,
  SecondQuarterHourTimeSeparator,
} from "./TimeSeparators/QuarterHourTimeSeparator";
import { isNonWorkingHour } from "../lib/date-utils";

export function CalendarHeader() {
  return (
    <thead className="sticky top-0 left-0 z-20 border-b border-secondary-200/60 bg-linear-to-r from-secondary-50 to-white dark:border-zinc-700/70 dark:from-zinc-900 dark:to-zinc-900/95">
      <tr className="flex h-11 items-stretch">
        <th className="sticky left-0 w-[132px] min-w-[132px] rounded-tl-2xl bg-linear-to-r from-secondary-50 to-white dark:from-zinc-900 dark:to-zinc-900/95" />
        <th className="flex">
          {HOURS.map((h) => (
            <div
              key={h}
              className={cn(
                "relative w-[120px] flex-1 border-l border-l-transparent py-2 text-xs font-medium",
                isNonWorkingHour(h)
                  ? "bg-secondary-100/40 text-secondary-400 dark:bg-zinc-800/50 dark:text-zinc-500"
                  : "text-secondary-500 dark:text-zinc-400",
              )}
            >
              <span className="absolute left-0 z-21 -translate-x-1/2 text-[10px] font-semibold tracking-wide uppercase tabular-nums">
                {h}:00
              </span>
              <span className="absolute bottom-0 -left-px z-10 h-2.5 w-px bg-secondary-300 dark:bg-zinc-600" />
              <HalfHourTimeSeparator className="h-1.5 bg-secondary-300 dark:bg-zinc-600" />
              <FirstQuarterHourTimeSeparator className="h-1 bg-secondary-200 dark:bg-zinc-700" />
              <SecondQuarterHourTimeSeparator className="h-1 bg-secondary-200 dark:bg-zinc-700" />
            </div>
          ))}
        </th>
      </tr>
    </thead>
  );
}
