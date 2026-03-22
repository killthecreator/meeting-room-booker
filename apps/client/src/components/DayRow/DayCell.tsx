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
export default function DayCell({ date }: DayTableItemProps) {
  const weekend = isWeekend(date);
  const today = isToday(date);
  return (
    <td
      className={cn(
        "border-secondary-100 sticky left-0 z-1 flex w-[132px] min-w-[132px] items-center justify-center border-r py-2 backdrop-blur-sm transition-colors duration-200 dark:border-zinc-800",
        weekend
          ? "bg-secondary-100/60 text-secondary-400 cursor-default dark:bg-zinc-800/45 dark:text-zinc-500"
          : today
            ? "from-primary-50/90 to-primary-50/40 dark:from-primary-950/45 dark:to-primary-900/25 bg-linear-to-r"
            : "from-secondary-50/80 group-hover/row:from-primary-50/50 group-hover/row:to-primary-50/20 dark:group-hover/row:from-primary-950/35 dark:group-hover/row:to-primary-900/20 bg-linear-to-r to-white/80 dark:from-zinc-900/95 dark:to-zinc-800/85",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-center gap-0.5 text-center">
        <span
          className={cn(
            "text-[13px] font-semibold tracking-tight",
            weekend
              ? "text-secondary-400"
              : today
                ? "text-primary-700"
                : "text-secondary-400",
          )}
        >
          {formatWeekday(date)}
        </span>
        <span
          className={cn(
            "flex items-center gap-1 text-[11px] font-medium",
            weekend
              ? "text-secondary-300 dark:text-zinc-600"
              : today
                ? "text-primary-600 dark:text-primary-400"
                : "text-secondary-400 dark:text-zinc-500",
          )}
        >
          {today && (
            <span className="bg-primary-500 inline-block h-1.5 w-1.5 rounded-full" />
          )}
          {formatShortDate(date)}
        </span>
      </div>
    </td>
  );
}
