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
            "border-secondary-400 relative flex w-full border-l",
            isNonWorkingHour(h) && "bg-secondary-100/60",
            isWorkBoundaryHour(h) && "border-dashed", // dashed line at work boundary
          )}
        >
          <FirstQuarterHourTimeSeparator className="bg-secondary-400 h-full opacity-60" />
          <HalfHourTimeSeparator className="bg-secondary-400 h-full opacity-60" />
          <SecondQuarterHourTimeSeparator className="bg-secondary-400 h-full opacity-60" />
        </div>
      ))}
    </div>
  );
}
