import { cn } from "../lib/cn";
import { HOURS, isNonWorkingHour } from "../config";
import { HalfHourTimeSeparator } from "./TimeSeparators/HalfHourTimeSeparator";
import {
  FirstQuarterHourTimeSeparator,
  SecondQuarterHourTimeSeparator,
} from "./TimeSeparators/QuarterHourTimeSeparator";

export function CalendarHeader() {
  return (
    <thead className="border-secondary-200/60 from-secondary-50 sticky top-0 left-0 z-20 border-b bg-linear-to-r to-white">
      <tr className="flex h-11 items-stretch">
        <th className="from-secondary-50 sticky left-0 w-[132px] min-w-[132px] rounded-tl-2xl bg-linear-to-r to-white" />
        <th className="flex">
          {HOURS.map((h) => (
            <div
              key={h}
              className={cn(
                "relative w-[120px] flex-1 border-l border-l-transparent py-2 text-xs font-medium",
                isNonWorkingHour(h)
                  ? "bg-secondary-100/40 text-secondary-400"
                  : "text-secondary-500",
              )}
            >
              <span className="absolute left-0 z-21 -translate-x-1/2 text-[10px] font-semibold tracking-wide uppercase tabular-nums">
                {h}:00
              </span>
              <span className="bg-secondary-300 absolute bottom-0 -left-px z-10 h-2.5 w-px" />
              <HalfHourTimeSeparator className="bg-secondary-300 h-1.5" />
              <FirstQuarterHourTimeSeparator className="bg-secondary-200 h-1" />
              <SecondQuarterHourTimeSeparator className="bg-secondary-200 h-1" />
            </div>
          ))}
        </th>
      </tr>
    </thead>
  );
}
