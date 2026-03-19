import { formatTime } from "../../lib/date-utils";
import type { MeetingDTO } from "../../../types/Meeting.type";
import { cn } from "../../lib/cn";

export type MeetingTooltipProps = {
  meeting: MeetingDTO;
  open: boolean;
};

export function MeetingTooltip({ meeting, open }: MeetingTooltipProps) {
  return (
    <dialog
      open={open}
      popover="hint"
      className={cn(
        "bg-secondary-900/95 fixed top-[calc(anchor(bottom)+8px)] left-[anchor(left)] z-3 hidden max-w-[280px] min-w-[200px] rounded-xl border border-white/10 p-3 px-3.5 text-xs text-white shadow-2xl shadow-black/20 backdrop-blur-xl",
        open && "group-hover/meeting-block:block",
      )}
      style={{ positionAnchor: `--tooltip-${meeting.id}` }}
    >
      <div className="mb-1.5 text-[13px] font-semibold tracking-tight">
        {meeting.name}
      </div>
      {meeting.description && (
        <div className="text-secondary-300 leading-relaxed">
          {meeting.description}
        </div>
      )}
      <div className="text-secondary-400 mt-1.5 flex items-center gap-1.5">
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        {formatTime(new Date(meeting.start))} –{" "}
        {formatTime(new Date(meeting.end))}
      </div>
      <div className="mt-2.5 flex items-center gap-2 border-t border-white/10 pt-2.5">
        {!!meeting.owner.picture && (
          <img
            src={meeting.owner.picture}
            alt="owner picture"
            className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/20"
            width={24}
            height={24}
          />
        )}
        <div className="min-w-0 flex-1">
          <span className="text-secondary-300 font-medium">
            {meeting.owner.name}
          </span>
          {!!meeting.owner.email && (
            <span className="mt-0.5 block">
              <a
                href={`mailto:${meeting.owner.email}`}
                className="text-primary-300 decoration-primary-300/30 hover:text-primary-200 hover:decoration-primary-200/50 block truncate underline transition-colors"
              >
                {meeting.owner.email}
              </a>
            </span>
          )}
        </div>
      </div>
    </dialog>
  );
}
