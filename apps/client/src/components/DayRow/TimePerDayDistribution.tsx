import { cn } from "../../lib/cn";
import { HOURS } from "../../config";
import { FirstQuarterHourTimeSeparator } from "../TimeSeparators/QuarterHourTimeSeparator";
import { HalfHourTimeSeparator } from "../TimeSeparators/HalfHourTimeSeparator";
import { SecondQuarterHourTimeSeparator } from "../TimeSeparators/QuarterHourTimeSeparator";
import { isNonWorkingHour, isWorkBoundaryHour } from "../../lib/date-utils";

export function TimePerDayDistribution() {
  return (
    <div className="relative flex h-full w-full">
      {HOURS.map((h) => (
        <div
          key={h}
          className={cn(
            "relative flex w-full border-l border-secondary-200/70 dark:border-zinc-700/50",
            isNonWorkingHour(h) && "bg-secondary-100/30 dark:bg-zinc-800/25",
            isWorkBoundaryHour(h) &&
              "border-dashed border-primary-300/50 dark:border-primary-600/40",
          )}
        >
          <FirstQuarterHourTimeSeparator className="h-full bg-secondary-200/40 dark:bg-zinc-600/35" />
          <HalfHourTimeSeparator className="h-full bg-secondary-200/60 dark:bg-zinc-600/45" />
          <SecondQuarterHourTimeSeparator className="h-full bg-secondary-200/40 dark:bg-zinc-600/35" />
        </div>
      ))}
    </div>
  );
}
