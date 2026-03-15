import { type RefObject } from "react";
import {
  minutesFromMidnight,
  WORKDAY_START_MIN,
  WORKDAY_END_MIN,
  TIMELINE_MINUTES,
} from "../../lib/date-utils";

export const DRAFT_MEETING_ID = "__draft__";

type DraftMeetingBlockProps = {
  name: string;
  start: Date;
  end: Date;
  ref: RefObject<HTMLDivElement | null> | undefined;
};

export function DraftMeetingBlock({
  name,
  start,
  end,
  ref,
}: DraftMeetingBlockProps) {
  const startMin = minutesFromMidnight(start);
  const endMin = minutesFromMidnight(end);
  const visibleStart = Math.max(startMin, WORKDAY_START_MIN);
  const visibleEnd = Math.min(endMin, WORKDAY_END_MIN);
  const left = ((visibleStart - WORKDAY_START_MIN) / TIMELINE_MINUTES) * 100;
  const width =
    visibleEnd > visibleStart
      ? ((visibleEnd - visibleStart) / TIMELINE_MINUTES) * 100
      : 0;

  return (
    <div
      ref={ref}
      className="border-primary-400 bg-primary-400/30 absolute top-1.5 bottom-1.5 flex min-w-[40px] items-center overflow-visible rounded-md border-2 border-dashed px-2"
      style={{ left: `${left}%`, width: `${width}%` }}
    >
      <span className="text-primary-800 inline-block max-w-full min-w-0 flex-1 overflow-hidden text-sm text-ellipsis whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}
