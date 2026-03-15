import { formatShortDate, formatWeekday } from "../../lib/date-utils";

type DayTableItemProps = {
  date: Date;
};
export function DayTableItem({ date }: DayTableItemProps) {
  return (
    <td
      className="bg-secondary-50 group-hover/row:bg-secondary-100 border-secondary-200 sticky left-0 z-1 flex w-[132px] min-w-[132px] items-center justify-center border-r py-2 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.04)] transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-center gap-0.5 text-center">
        <span className="text-secondary-800 text-[13px] font-semibold">
          {formatWeekday(date)}
        </span>
        <span className="text-secondary-500 text-[11px] font-normal">
          {formatShortDate(date)}
        </span>
      </div>
    </td>
  );
}
