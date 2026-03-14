import { cn } from "../lib/cn";
import { HOURS, isNonWorkingHour, isWorkBoundaryHour } from "../lib/constants";
import { HalfHourTimeSeparator } from "./TimeSeparators/HalfHourTimeSeparator";
import {
  FirstQuarterHourTimeSeparator,
  SecondQuarterHourTimeSeparator,
} from "./TimeSeparators/QuarterHourTimeSeparator";
import { WorkBoundaryLine } from "./TimeSeparators/WorkBoundaryLine";

export function CalendarHeader() {
  return (
    <thead className="sticky top-0 z-1 bg-secondary-100 border-b border-secondary-200 shadow-sm">
      <tr className="flex items-stretch h-11">
        <th className="min-w-[132px] w-[132px] z-20  sticky left-0 rounded-tl-xl" />
        {HOURS.map((h) => (
          <th
            key={h}
            className={cn(
              "flex-1 py-2 relative w-[120px] text-xs font-medium",
              isNonWorkingHour(h)
                ? "bg-secondary-200/50 text-secondary-500"
                : "text-secondary-600",
            )}
          >
            {isWorkBoundaryHour(h) && <WorkBoundaryLine />}
            <span className="absolute left-0 z-10 -translate-x-1/2 text-[11px] tabular-nums">
              {h}:00
            </span>
            <span className="absolute bottom-0 -left-px w-px h-2 bg-secondary-400 z-10" />
            <HalfHourTimeSeparator className="h-1.5 bg-secondary-400" />
            <FirstQuarterHourTimeSeparator className="h-1 bg-secondary-400" />
            <SecondQuarterHourTimeSeparator className="h-1 bg-secondary-400" />
          </th>
        ))}
      </tr>
    </thead>
  );
}
