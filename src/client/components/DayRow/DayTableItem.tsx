import {
  formatShortDate,
  formatWeekday,
  isToday,
  isWeekend,
} from "../../lib/date-utils";
import { cn } from "../../lib/cn";

type DayTableItemProps = {
  date: Date;
};
export function DayTableItem({ date }: DayTableItemProps) {
  const weekend = isWeekend(date);
  const isCurDay = isToday(date);
  return (
    <td
      className={cn(
        "border-secondary-100 sticky left-0 z-1 flex w-[132px] min-w-[132px] items-center justify-center border-r py-2 backdrop-blur-sm transition-colors duration-200",
        weekend
          ? "bg-secondary-100/60 text-secondary-400 cursor-default"
          : "from-secondary-50/80 group-hover/row:from-primary-50/50 group-hover/row:to-primary-50/20 bg-linear-to-r to-white/80",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={cn("flex flex-col items-center gap-0.5 text-center")}>
        <span
          className={cn(
            "text-[13px] font-semibold tracking-tight",
            weekend ? "text-secondary-400" : "text-secondary-800",
          )}
        >
          {formatWeekday(date)}
        </span>
        <span
          className={cn(
            "text-[11px] font-medium",
            weekend ? "text-secondary-300" : "text-secondary-400",
          )}
        >
          {formatShortDate(date)}
        </span>
      </div>
    </td>
  );
}
