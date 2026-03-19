import { cn } from "../../lib/cn";
import { HOURS, isNonWorkingHour, isWorkBoundaryHour } from "../../config";
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
            "border-secondary-200/70 relative flex w-full border-l",
            isNonWorkingHour(h) && "bg-secondary-100/30",
            isWorkBoundaryHour(h) && "border-primary-300/50 border-dashed",
          )}
        >
          <FirstQuarterHourTimeSeparator className="bg-secondary-200/40 h-full" />
          <HalfHourTimeSeparator className="bg-secondary-200/60 h-full" />
          <SecondQuarterHourTimeSeparator className="bg-secondary-200/40 h-full" />
        </div>
      ))}
    </div>
  );
}
