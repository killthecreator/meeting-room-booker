import { formatShortDate, formatWeekday } from "../../lib/date-utils";

type DayTableItemProps = {
  date: Date;
};
export function DayTableItem({ date }: DayTableItemProps) {
  return (
    <td
      className="w-[132px] min-w-[132px] bg-secondary-50 group-hover/row:bg-secondary-100 flex items-center justify-center z-10 sticky left-0 border-r border-secondary-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.04)] py-2 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-center gap-0.5 text-center">
        <span className="text-[13px] font-semibold text-secondary-800">
          {formatWeekday(date)}
        </span>
        <span className="text-[11px] text-secondary-500 font-normal">
          {formatShortDate(date)}
        </span>
      </div>
    </td>
  );
}
