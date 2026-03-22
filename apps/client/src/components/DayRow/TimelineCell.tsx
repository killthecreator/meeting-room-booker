import {
  useCallback,
  useRef,
  type DragEvent,
  type MouseEvent,
  type RefObject,
} from "react";
import { cn } from "../../lib/cn";
import { TimePerDayDistribution } from "./TimePerDayDistribution";
import { CurrentTimeIndicator } from "../CurrentTimeIndicator";
import type { MeetingDTO } from "@meeting-calendar/shared";
import { MeetingBlock } from "../MeetingBlock";
import {
  DRAFT_MEETING_ID,
  DraftMeetingBlock,
} from "../MeetingBlock/DraftMeetingBlock";
import {
  dayKey,
  minutesFromMidnight,
  roundToClosestStep,
  setMinutesFromMidnight,
} from "../../lib/date-utils";
import type { DraftMeeting } from ".";
import {
  clampNewSlotStartMinutes,
  snapPointerMinutesOnTimeline,
  snapSlotClickToTimelineMinutes,
} from "../../lib/timeline";
import { clampMoveStart } from "../../lib/meeting-bounds";
import { useMeetings } from "../../context/MeetingsContext";

type TimelineCellProps = {
  weekend: boolean;
  today: boolean;
  dayMeetings: MeetingDTO[];
  draftMeeting: DraftMeeting | null;
  date: Date;
  ghostAnchorRef?: RefObject<HTMLDivElement | null>;
  onDraftDrop: (date: Date, startMinutes: number) => void;
  onSlotClick: (date: Date, startMinutes: number) => void;
};

export default function TimelineCell({
  weekend,
  today,
  draftMeeting,
  date,
  ghostAnchorRef,
  dayMeetings,
  onDraftDrop,
  onSlotClick,
}: TimelineCellProps) {
  const { updateMeeting, meetings } = useMeetings();
  const timelineCellRef = useRef<HTMLTableCellElement>(null);

  // This is needed to prevent opening create meeting popup after resize
  const ignoreNextClickRef = useRef(false);

  const handleDragOver = useCallback((e: DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleMeetingDrop = useCallback(
    (date: Date, startMinutes: number, meetingId: string) => {
      const meeting = meetings.find((m) => m.id === meetingId)!;
      const startDate = new Date(meeting.start);
      const endDate = new Date(meeting.end);
      const duration =
        minutesFromMidnight(endDate) - minutesFromMidnight(startDate);
      const targetDayKey = dayKey(date);
      const othersOnTargetDay = meetings.filter(
        (m) => dayKey(new Date(m.start)) === targetDayKey && m.id !== meetingId,
      );
      const snapped = roundToClosestStep(startMinutes);
      const clampedStart = clampMoveStart(snapped, duration, othersOnTargetDay);
      const start = setMinutesFromMidnight(date, clampedStart);
      const end = setMinutesFromMidnight(date, clampedStart + duration);
      if (
        start.getTime() === startDate.getTime() &&
        end.getTime() === endDate.getTime()
      )
        return;

      updateMeeting(meetingId, {
        start: start.toISOString(),
        end: end.toISOString(),
      });
    },
    [meetings, updateMeeting],
  );

  const dropProcessedRef = useRef(false);
  const handleDrop = useCallback(
    (e: DragEvent<HTMLTableCellElement>) => {
      if (dropProcessedRef.current) return;
      const meetingId = e.dataTransfer.getData("meetingId");
      if (!meetingId) return;
      dropProcessedRef.current = true;
      requestAnimationFrame(() => {
        dropProcessedRef.current = false;
      });
      const cell = timelineCellRef.current;
      if (!cell) return;
      const rect = cell.getBoundingClientRect();
      const offsetX = parseFloat(e.dataTransfer.getData("dragOffsetX") || "0");
      const blockLeftScreen = e.clientX - offsetX;
      const dropX = blockLeftScreen - rect.left;
      const snapped = snapPointerMinutesOnTimeline(dropX, rect.width);
      const clamped = clampNewSlotStartMinutes(snapped);
      if (meetingId === DRAFT_MEETING_ID) onDraftDrop(date, clamped);
      else handleMeetingDrop(date, clamped, meetingId);
    },
    [date, handleMeetingDrop, onDraftDrop],
  );

  const handleTimelineClick = (e: MouseEvent<HTMLTableCellElement>) => {
    if (ignoreNextClickRef.current) {
      ignoreNextClickRef.current = false;
      return;
    }
    const cell = timelineCellRef.current;
    if (!cell) return;
    const rect = cell.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const snapped = snapSlotClickToTimelineMinutes(x, rect.width);
    const clamped = clampNewSlotStartMinutes(snapped);

    onSlotClick(date, clamped);
  };

  return (
    <td
      ref={timelineCellRef}
      className={cn(
        "relative min-w-0 flex-1 p-0 transition-colors duration-200",
        today
          ? "bg-primary-50/25 dark:bg-primary-950/30"
          : "bg-white/60 group-hover/row:bg-primary-50/30 dark:bg-zinc-950/45 dark:group-hover/row:bg-primary-950/35",
        weekend && "bg-secondary-100/40 dark:bg-zinc-800/30",
      )}
      {...(!weekend && {
        onClick: handleTimelineClick,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
      })}
    >
      <TimePerDayDistribution />
      {today && <CurrentTimeIndicator />}
      {dayMeetings.map((m) => (
        <MeetingBlock
          // Cannot just use ID. otherwise it is not possible to dnd within the same day
          // Cuz react treats it as if it didnt change
          key={`${m.start}_${m.id}_${m.end}`}
          meeting={m}
          timelineCellRef={timelineCellRef}
          ignoreNextClickRef={ignoreNextClickRef}
        />
      ))}
      {draftMeeting && dayKey(draftMeeting.date) === dayKey(date) && (
        <DraftMeetingBlock
          ref={ghostAnchorRef}
          name={draftMeeting.name}
          start={draftMeeting.start}
          end={draftMeeting.end}
        />
      )}
    </td>
  );
}
