import { cn } from "../lib/cn";
import { HOURS, isNonWorkingHour } from "../lib/constants";
import { HalfHourTimeSeparator } from "./TimeSeparators/HalfHourTimeSeparator";
import {
  FirstQuarterHourTimeSeparator,
  SecondQuarterHourTimeSeparator,
} from "./TimeSeparators/QuarterHourTimeSeparator";

export function CalendarHeader() {
  return (
    <thead className="bg-secondary-100 border-secondary-200 sticky top-0 left-0 z-20 border-b shadow-sm">
      <tr className="flex h-11 items-stretch">
        <th className="sticky left-0 w-[132px] min-w-[132px] rounded-tl-xl" />
        {HOURS.map((h) => (
          <th
            key={h}
            className={cn(
              "relative w-[120px] flex-1 border-l border-l-transparent py-2 text-xs font-medium",
              isNonWorkingHour(h)
                ? "bg-secondary-200/50 text-secondary-500"
                : "text-secondary-600",
            )}
          >
            <span className="absolute left-0 z-21 -translate-x-1/2 text-[11px] tabular-nums">
              {h}:00
            </span>
            <span className="bg-secondary-400 absolute bottom-0 -left-px z-10 h-2 w-px" />
            <HalfHourTimeSeparator className="bg-secondary-400 h-1.5" />
            <FirstQuarterHourTimeSeparator className="bg-secondary-400 h-1" />
            <SecondQuarterHourTimeSeparator className="bg-secondary-400 h-1" />
          </th>
        ))}
      </tr>
    </thead>
  );
}
