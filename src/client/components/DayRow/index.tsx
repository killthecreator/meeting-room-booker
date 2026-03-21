import { type RefObject } from "react";

import { dayKey, isWeekend, isToday } from "../../lib/date-utils";

import type { MeetingDTO } from "../../../types/Meeting.type";
import { cn } from "../../lib/cn";
import DayCell from "./DayCell";

import TimelineCell from "./TimelineCell";

export type DraftMeeting = {
  date: Date;
  start: Date;
  end: Date;
  name: string;
};

type DayRowProps = {
  date: Date;
  dayMeetings: MeetingDTO[];
  draftMeeting: DraftMeeting | null;
  ghostAnchorRef?: RefObject<HTMLDivElement | null>;
  onSlotClick: (date: Date, startMinutes: number) => void;
  onDraftDrop: (date: Date, startMinutes: number) => void;
};

export function DayRow({
  date,
  dayMeetings,
  draftMeeting,
  ghostAnchorRef,
  onSlotClick,
  onDraftDrop,
}: DayRowProps) {
  const weekend = isWeekend(date);
  const today = isToday(date);

  return (
    <tr
      data-daykey={dayKey(date)}
      className={cn(
        "group/row border-secondary-100 relative flex h-14 border-b transition-colors duration-200",
        weekend && "bg-secondary-100/50",
        today && "border-primary-200/60 z-1",
      )}
    >
      {today && (
        <td className="from-primary-500 to-primary-400 absolute top-0 bottom-0 left-0 z-2 w-[3px] rounded-r-full bg-linear-to-b" />
      )}
      <DayCell date={date} />
      <TimelineCell
        weekend={weekend}
        today={today}
        dayMeetings={dayMeetings}
        draftMeeting={draftMeeting}
        date={date}
        ghostAnchorRef={ghostAnchorRef}
        onDraftDrop={onDraftDrop}
        onSlotClick={onSlotClick}
      />
    </tr>
  );
}
