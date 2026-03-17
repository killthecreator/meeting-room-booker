import { cn } from "../../lib/cn";
import {
  HOURS,
  isNonWorkingHour,
  isWorkBoundaryHour,
} from "../../lib/constants";
import { FirstQuarterHourTimeSeparator } from "../TimeSeparators/QuarterHourTimeSeparator";
import { HalfHourTimeSeparator } from "../TimeSeparators/HalfHourTimeSeparator";
import { SecondQuarterHourTimeSeparator } from "../TimeSeparators/QuarterHourTimeSeparator";

export function TimePerDayDistribution() {
  return (
    <div className="relative flex h-full w-full">
      {HOURS.map((h) => (
        <div
          key={h}
          className={cn(
            "relative flex w-full border-l border-secondary-200/70",
            isNonWorkingHour(h) && "bg-secondary-100/30",
            isWorkBoundaryHour(h) && "border-dashed border-primary-300/50",
          )}
        >
          <FirstQuarterHourTimeSeparator className="h-full bg-secondary-200/40" />
          <HalfHourTimeSeparator className="h-full bg-secondary-200/60" />
          <SecondQuarterHourTimeSeparator className="h-full bg-secondary-200/40" />
        </div>
      ))}
    </div>
  );
}
