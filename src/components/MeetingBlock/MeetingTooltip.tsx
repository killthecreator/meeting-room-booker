import { formatTime } from "../../lib/date-utils";
import type { Meeting } from "../../types/Meeting.type";
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
        "p-2.5 hidden top-[calc(anchor(bottom)+5px)] left-[anchor(left)] px-3 z-3 fixed bg-gray-800 text-white text-xs rounded-lg shadow-xl min-w-[200px] max-w-[280px]",
        open && "group-hover/meeting-block:block",
      )}
      style={{ positionAnchor: `--tooltip-${meeting.id}` }}
    >
      <div className="font-semibold mb-1">{meeting.name}</div>
      {meeting.description && (
        <div className="text-gray-300">{meeting.description}</div>
      )}
      <div className="text-gray-400 mt-1">
        {formatTime(meeting.start)} – {formatTime(meeting.end)}
      </div>
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-600">
        {!!meeting.ownerPicture && (
          <img
            src={meeting.ownerPicture}
            alt="owner picture"
            className="w-6 h-6 rounded-full object-cover shrink-0"
            width={24}
            height={24}
          />
        )}
        <div className="min-w-0 flex-1">
          <span className="text-gray-400">Owner: {meeting.owner}</span>
          {!!meeting.ownerEmail && (
            <span className="block mt-0.5">
              <a
                href={`mailto:${meeting.ownerEmail}`}
                className="text-primary-400 hover:text-primary-300 underline truncate block"
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
