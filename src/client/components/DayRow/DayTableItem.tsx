import { formatShortDate, formatWeekday } from "../../lib/date-utils";

type DayTableItemProps = {
  date: Date;
};
export function DayTableItem({ date }: DayTableItemProps) {
  return (
    <td
      className="sticky left-0 z-1 flex w-[132px] min-w-[132px] items-center justify-center border-r border-secondary-100 bg-gradient-to-r from-secondary-50/80 to-white/80 py-2 backdrop-blur-sm transition-colors duration-200 group-hover/row:from-primary-50/50 group-hover/row:to-primary-50/20"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-center gap-0.5 text-center">
        <span className="text-secondary-800 text-[13px] font-semibold tracking-tight">
          {formatWeekday(date)}
        </span>
        <span className="text-secondary-400 text-[11px] font-medium">
          {formatShortDate(date)}
        </span>
      </div>
    </td>
  );
}
