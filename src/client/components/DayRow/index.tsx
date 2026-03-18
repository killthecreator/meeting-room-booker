import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type MouseEvent,
  type RefObject,
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
  WORKDAY_START_MIN,
  WORKDAY_END_MIN,
  TIMELINE_MINUTES,
} from "../../../lib/date-utils";
import { GRID_STEP_MINUTES } from "../../../lib/meeting-bounds";
import type { DragState } from "../../../types/DragState.type";
import type { MeetingDTO } from "../../../types/Meeting.type";
import { cn } from "../../../lib/cn";
import { DayTableItem } from "./DayTableItem";
import { TimePerDayDistribution } from "./TimePerDayDistribution";

/** Step in minutes for the timeline (15 minutes) */
const STEP = 15;

export type DraftMeeting = {
  date: Date;
  start: Date;
  end: Date;
  name: string;
};

type DayRowProps = {
  date: Date;
  meetings: MeetingDTO[];
  draftMeeting: DraftMeeting | null;
  ghostAnchorRef?: RefObject<HTMLDivElement | null>;
  /** Current user id (e.g. Google sub) for canDelete / isMine */
  currentUserId?: string | null;
  onSlotClick: (date: Date, startMinutes: number) => void;
  onDelete: (id: string) => void;
  onResize: (
    meetingId: string,
    newStartMin: number | null,
    newEndMin: number | null,
  ) => void;
  onMeetingDrop: (date: Date, startMinutes: number, meetingId: string) => void;
  onDraftDrop: (date: Date, startMinutes: number) => void;
  onTouchDragEnd?: () => void;
};

export function DayRow({
  date,
  meetings,
  draftMeeting,
  ghostAnchorRef,
  currentUserId = null,
  onSlotClick,
  onDelete,
  onResize,
  onMeetingDrop,
  onDraftDrop,
  onTouchDragEnd,
}: DayRowProps) {
  const timelineRef = useRef<HTMLTableRowElement>(null);
  const timelineCellRef = useRef<HTMLTableCellElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const ignoreNextClickRef = useRef(false);
  const weekend = isWeekend(date);

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
        Math.round((rawMinutes - WORKDAY_START_MIN) / GRID_STEP_MINUTES) *
          GRID_STEP_MINUTES;
      if (drag.edge === "left") {
        onResize(drag.meetingId, minutes, null);
      } else {
        onResize(drag.meetingId, null, minutes);
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
  }, [drag, onResize]);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLTableRowElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = weekend ? "none" : "move";
    },
    [weekend],
  );

  const dropProcessedRef = useRef(false);
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLTableRowElement>) => {
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
      const snapped = Math.round(startMinutes / STEP) * STEP;
      const clamped = Math.max(
        WORKDAY_START_MIN,
        Math.min(WORKDAY_END_MIN - 15, snapped),
      );
      if (meetingId === DRAFT_MEETING_ID) {
        onDraftDrop(date, clamped);
      } else {
        onMeetingDrop(date, clamped, meetingId);
      }
    },
    [date, weekend, onMeetingDrop, onDraftDrop],
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
    const startMinutesToClosestLeftBorder =
      Math.floor(clickMinutes / STEP) * STEP;
    const clamped = Math.max(
      WORKDAY_START_MIN,
      Math.min(WORKDAY_END_MIN - 15, startMinutesToClosestLeftBorder),
    );

    onSlotClick(date, clamped);
  };

  const handleResizeStart = useCallback(
    (meetingId: string, edge: "left" | "right") => {
      if (meetingId === DRAFT_MEETING_ID && draftMeeting) {
        setDrag({
          meetingId: DRAFT_MEETING_ID,
          edge,
          startMin: minutesFromMidnight(draftMeeting.start),
          endMin: minutesFromMidnight(draftMeeting.end),
        });
        return;
      }
      const m = meetings.find((x) => x.id === meetingId);
      if (!m) return;
      setDrag({
        meetingId,
        edge,
        startMin: minutesFromMidnight(new Date(m.start)),
        endMin: minutesFromMidnight(new Date(m.end)),
      });
    },
    [meetings, draftMeeting],
  );

  return (
    <tr
      ref={timelineRef}
      data-daykey={dayKey(date)}
      className={cn(
        "group/row border-secondary-100 relative flex h-14 border-b transition-colors duration-200",
        weekend && "bg-secondary-100/50 cursor-default",
      )}
      onClick={handleTimelineClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DayTableItem date={date} />

      <td
        ref={timelineCellRef}
        className={cn(
          "relative min-w-0 flex-1 p-0 transition-colors duration-200",
          weekend
            ? "bg-secondary-100/40"
            : "group-hover/row:bg-primary-50/30 bg-white/60",
        )}
      >
        <TimePerDayDistribution />
        {meetings.map((m) => (
          <MeetingBlock
            key={m.id}
            meeting={m}
            onDelete={onDelete}
            onResizeStart={(edge: "left" | "right") =>
              handleResizeStart(m.id, edge)
            }
            onMeetingDrop={onMeetingDrop}
            onTouchDragEnd={onTouchDragEnd}
            isResizing={drag !== null && drag.meetingId === m.id}
            isMine={!!(currentUserId && m.owner.id === currentUserId)}
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
