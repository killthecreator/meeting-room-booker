import { cn } from "../../lib/cn";
import {
  HOURS,
  isNonWorkingHour,
  isWorkBoundaryHour,
} from "../../lib/constants";
import { WorkBoundaryLine } from "../TimeSeparators/WorkBoundaryLine";
import { FirstQuarterHourTimeSeparator } from "../TimeSeparators/QuarterHourTimeSeparator";
import { HalfHourTimeSeparator } from "../TimeSeparators/HalfHourTimeSeparator";
import { SecondQuarterHourTimeSeparator } from "../TimeSeparators/QuarterHourTimeSeparator";

export function TimePerDayDistribution() {
  return (
    <div className="relative w-full h-full flex">
      {HOURS.map((h) => (
        <div
          key={h}
          className={cn(
            "flex w-full h-full relative border-r border-secondary-100",
            isNonWorkingHour(h) && "bg-secondary-100/60",
          )}
        >
          {isWorkBoundaryHour(h) && <WorkBoundaryLine />}
          <FirstQuarterHourTimeSeparator className="h-full bg-secondary-400 opacity-60" />
          <HalfHourTimeSeparator className="h-full bg-secondary-400 opacity-60" />
          <SecondQuarterHourTimeSeparator className="h-full bg-secondary-400 opacity-60" />
        </div>
      ))}
    </div>
  );
}
