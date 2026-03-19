import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type MouseEvent,
  type RefObject,
  type DragEvent,
} from "react";
import { MeetingBlock } from "../MeetingBlock";
import {
  DraftMeetingBlock,
  DRAFT_MEETING_ID,
} from "../MeetingBlock/DraftMeetingBlock";
import {
  minutesFromMidnight,
  dayKey,
  isWeekend,
  isToday,
  WORKDAY_START_MIN,
  WORKDAY_END_MIN,
  TIMELINE_MINUTES,
  setMinutesFromMidnight,
  roundToClosestStep,
} from "../../lib/date-utils";
import {
  clampMoveStart,
  getEndBounds,
  getStartBounds,
} from "../../lib/meeting-bounds";
import type { DragState } from "../../../types/DragState.type";
import type { MeetingDTO } from "../../../types/Meeting.type";
import { cn } from "../../lib/cn";
import { DayTableItem } from "./DayTableItem";
import { TimePerDayDistribution } from "./TimePerDayDistribution";
import { CurrentTimeIndicator } from "../CurrentTimeIndicator";
import { useMeetings } from "../../context/MeetingsContext";
import { CONFIG } from "../../config";

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
  onTouchDragEnd?: () => void;
};

export function DayRow({
  date,
  dayMeetings,
  draftMeeting,
  ghostAnchorRef,
  onSlotClick,
  onDraftDrop,
  onTouchDragEnd,
}: DayRowProps) {
  const timelineRef = useRef<HTMLTableRowElement>(null);
  const timelineCellRef = useRef<HTMLTableCellElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const ignoreNextClickRef = useRef(false);
  const weekend = isWeekend(date);
  const today = isToday(date);

  const { updateMeeting, meetings } = useMeetings();

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

  const handleResize = useCallback(
    (
      meetingId: string,
      newStartMin: number | null,
      newEndMin: number | null,
    ) => {
      const meeting = meetings.find((m) => m.id === meetingId)!;
      const startDate = new Date(meeting.start);
      const endDate = new Date(meeting.end);
      const k = dayKey(startDate);
      const others = meetings.filter(
        (m) => dayKey(new Date(m.start)) === k && m.id !== meetingId,
      );
      const startMin = minutesFromMidnight(startDate);
      const endMin = minutesFromMidnight(endDate);

      let start = startDate;
      let end = endDate;

      if (newStartMin !== null) {
        const [minStart, maxStart] = getStartBounds(endMin, others);
        const snapped = roundToClosestStep(newStartMin);
        const clamped = Math.max(minStart, Math.min(maxStart, snapped));
        start = setMinutesFromMidnight(startDate, clamped);
      }
      if (newEndMin !== null) {
        const [minEnd, maxEnd] = getEndBounds(startMin, others);
        const snapped = roundToClosestStep(newEndMin);
        const clamped = Math.max(minEnd, Math.min(maxEnd, snapped));
        end = setMinutesFromMidnight(endDate, clamped);
      }

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

  useEffect(() => {
    if (!drag) return;
    const cell = timelineCellRef.current;
    if (!cell) return;
    if (drag.edge === "move") return;

    const getClientX = (e: globalThis.MouseEvent | TouchEvent) =>
      "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;

    const handleMove = (e: globalThis.MouseEvent | TouchEvent) => {
      if ("touches" in e) e.preventDefault();
      const rect = cell.getBoundingClientRect();
      const x = getClientX(e) - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      const rawMinutes = WORKDAY_START_MIN + pct * TIMELINE_MINUTES;
      const minutes =
        WORKDAY_START_MIN +
        Math.round((rawMinutes - WORKDAY_START_MIN) / CONFIG.TIME_STEP) *
          CONFIG.TIME_STEP;
      if (drag.edge === "left") {
        handleResize(drag.meetingId, minutes, null);
      } else {
        handleResize(drag.meetingId, null, minutes);
      }
    };
    const handleUp = () => {
      ignoreNextClickRef.current = true;
      setDrag(null);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches[0]) handleUp();
    };

    const controller = new AbortController();
    const { signal } = controller;

    window.addEventListener("mousemove", handleMove, { signal });
    window.addEventListener("mouseup", handleUp, { signal });
    window.addEventListener("touchmove", handleMove, {
      passive: false,
      signal,
    });
    window.addEventListener("touchend", handleTouchEnd, { signal });
    return () => {
      controller.abort();
    };
  }, [drag, handleResize]);

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLTableRowElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = weekend ? "none" : "move";
    },
    [weekend],
  );

  const dropProcessedRef = useRef(false);
  const handleDrop = useCallback(
    (e: DragEvent<HTMLTableRowElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (weekend) return;
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
      const pct = Math.max(0, Math.min(1, dropX / rect.width));
      const startMinutes = WORKDAY_START_MIN + pct * TIMELINE_MINUTES;
      const snapped = roundToClosestStep(startMinutes);

      const clamped = Math.max(
        WORKDAY_START_MIN,
        Math.min(WORKDAY_END_MIN - 15, snapped),
      );
      if (meetingId === DRAFT_MEETING_ID) {
        onDraftDrop(date, clamped);
      } else {
        handleMeetingDrop(date, clamped, meetingId);
      }
    },
    [date, weekend, handleMeetingDrop, onDraftDrop],
  );

  const handleTimelineClick = (e: MouseEvent<HTMLTableRowElement>) => {
    if (weekend) return;
    if (drag) return;
    if (ignoreNextClickRef.current) {
      ignoreNextClickRef.current = false;
      return;
    }
    const cell = timelineCellRef.current;
    if (!cell) return;
    const rect = cell.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const clickMinutes = WORKDAY_START_MIN + pct * TIMELINE_MINUTES;
    const startMinutesToClosestLeftBorder = roundToClosestStep(
      clickMinutes,
      "floor",
    );

    const clamped = Math.max(
      WORKDAY_START_MIN,
      Math.min(WORKDAY_END_MIN - 15, startMinutesToClosestLeftBorder),
    );

    onSlotClick(date, clamped);
  };

  const handleResizeStart = useCallback(
    (meeting: MeetingDTO, edge: "left" | "right") => {
      setDrag({
        meetingId: meeting.id,
        edge,
        startMin: minutesFromMidnight(new Date(meeting.start)),
        endMin: minutesFromMidnight(new Date(meeting.end)),
      });
    },
    [],
  );

  return (
    <tr
      ref={timelineRef}
      data-daykey={dayKey(date)}
      className={cn(
        "group/row border-secondary-100 relative flex h-14 border-b transition-colors duration-200",
        weekend && "bg-secondary-100/50 cursor-default",
        today && "border-primary-200/60 z-1",
      )}
      onClick={handleTimelineClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {today && (
        <div className="from-primary-500 to-primary-400 absolute top-0 bottom-0 left-0 z-2 w-[3px] rounded-r-full bg-linear-to-b" />
      )}
      <DayTableItem date={date} />
      <td
        ref={timelineCellRef}
        className={cn(
          "relative min-w-0 flex-1 p-0 transition-colors duration-200",
          weekend
            ? "bg-secondary-100/40"
            : today
              ? "bg-primary-50/25"
              : "group-hover/row:bg-primary-50/30 bg-white/60",
        )}
      >
        <TimePerDayDistribution />
        {today && <CurrentTimeIndicator />}
        {dayMeetings.map((m) => (
          <MeetingBlock
            key={m.id}
            meeting={m}
            onResizeStart={(edge: "left" | "right") =>
              handleResizeStart(m, edge)
            }
            onMeetingDrop={handleMeetingDrop}
            onTouchDragEnd={onTouchDragEnd}
            isResizing={drag !== null && drag.meetingId === m.id}
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
    </tr>
  );
}
