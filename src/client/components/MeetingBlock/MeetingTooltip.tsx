import { formatTime } from "../../lib/date-utils";
import type { MeetingDTO } from "../../../types/Meeting.type";
import { cn } from "../../lib/cn";
import ClockIcon from "../Icons/ClockIcon";

type MeetingTooltipProps = {
  meeting: MeetingDTO;
  open: boolean;
};

export function MeetingTooltip({ meeting, open }: MeetingTooltipProps) {
  return (
    <dialog
      open={open}
      popover="hint"
      className={cn(
        "bg-secondary-900/95 fixed top-[anchor(bottom)] left-[anchor(left)] z-3 mt-0.5 hidden max-w-[280px] min-w-[200px] rounded-xl border border-white/10 p-3 px-3.5 text-xs text-white shadow-2xl shadow-black/20 backdrop-blur-xl",
        open && "group-hover/meeting-block:block",
      )}
      style={{ positionAnchor: `--tooltip-${meeting.id}` }}
    >
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold tracking-tight">
          {meeting.name}
        </span>
        {meeting.description && (
          <span className="text-secondary-300 leading-relaxed">
            {meeting.description}
          </span>
        )}
        <div className="text-secondary-400 flex items-center gap-1.5">
          <ClockIcon className="size-3" />
          {formatTime(new Date(meeting.start))} –{" "}
          {formatTime(new Date(meeting.end))}
        </div>
      </div>
      <hr className="my-2 border-white/10" />
      <div className="flex items-center gap-2">
        {!!meeting.owner.picture && (
          <img
            src={meeting.owner.picture}
            alt="owner picture"
            className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/20"
            width={24}
            height={24}
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-secondary-300 font-medium">
            {meeting.owner.name}
          </span>
          {!!meeting.owner.email && (
            <a
              href={`mailto:${meeting.owner.email}`}
              className="text-primary-300 decoration-primary-300/30 hover:text-primary-200 hover:decoration-primary-200/50 mt-0.5 inline-block truncate underline transition-colors"
            >
              {meeting.owner.email}
            </a>
          )}
        </div>
      </div>
    </dialog>
  );
}
