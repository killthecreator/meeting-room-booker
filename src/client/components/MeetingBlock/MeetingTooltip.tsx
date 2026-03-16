import { formatTime } from "../../lib/date-utils";
import type { Meeting } from "../../../types/Meeting.type";
import { cn } from "../../lib/cn";

export type MeetingTooltipProps = {
  meeting: Meeting;
  open: boolean;
};

export function MeetingTooltip({ meeting, open }: MeetingTooltipProps) {
  return (
    <dialog
      open={open}
      popover="hint"
      className={cn(
        "fixed top-[calc(anchor(bottom)+5px)] left-[anchor(left)] z-3 hidden max-w-[280px] min-w-[200px] rounded-lg bg-gray-800 p-2.5 px-3 text-xs text-white shadow-xl",
        open && "group-hover/meeting-block:block",
      )}
      style={{ positionAnchor: `--tooltip-${meeting.id}` }}
    >
      <div className="mb-1 font-semibold">{meeting.name}</div>
      {meeting.description && (
        <div className="text-gray-300">{meeting.description}</div>
      )}
      <div className="mt-1 text-gray-400">
        {formatTime(meeting.start)} – {formatTime(meeting.end)}
      </div>
      <div className="mt-2 flex items-center gap-2 border-t border-gray-600 pt-2">
        {!!meeting.ownerPicture && (
          <img
            src={meeting.ownerPicture}
            alt="owner picture"
            className="h-6 w-6 shrink-0 rounded-full object-cover"
            width={24}
            height={24}
          />
        )}
        <div className="min-w-0 flex-1">
          <span className="text-gray-400">Owner: {meeting.owner}</span>
          {!!meeting.ownerEmail && (
            <span className="mt-0.5 block">
              <a
                href={`mailto:${meeting.ownerEmail}`}
                className="text-primary-400 hover:text-primary-300 block truncate underline"
              >
                {meeting.ownerEmail}
              </a>
            </span>
          )}
        </div>
      </div>
    </dialog>
  );
}
