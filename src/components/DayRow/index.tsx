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
  WORKDAY_START_MIN,
  WORKDAY_END_MIN,
  TIMELINE_MINUTES,
} from "../../lib/date-utils";
import { GRID_STEP_MINUTES } from "../../lib/meeting-bounds";
import type { DragState } from "../../types/DragState.type";
import type { Meeting } from "../../types/Meeting.type";
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
  meetings: Meeting[];
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
}: DayRowProps) {
  const timelineRef = useRef<HTMLTableRowElement>(null);
  const timelineCellRef = useRef<HTMLTableCellElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const ignoreNextClickRef = useRef(false);

  useEffect(() => {
    if (!drag) return;
    const cell = timelineCellRef.current;
    if (!cell) return;
    if (drag.edge === "move") return;

    const handleMove = (e: globalThis.MouseEvent) => {
      const rect = cell.getBoundingClientRect();
      const x = e.clientX - rect.left;
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

    const controller = new AbortController();
    const { signal } = controller;

    window.addEventListener("mousemove", handleMove, { signal });
    window.addEventListener("mouseup", handleUp, { signal });
    return () => {
      controller.abort();
    };
  }, [drag, onResize]);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLTableRowElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    [],
  );

  const dropProcessedRef = useRef(false);
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLTableRowElement>) => {
      e.preventDefault();
      e.stopPropagation();
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
    [date, onMeetingDrop, onDraftDrop],
  );

  const handleTimelineClick = (e: MouseEvent<HTMLTableRowElement>) => {
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
        startMin: minutesFromMidnight(m.start),
        endMin: minutesFromMidnight(m.end),
      });
    },
    [meetings, draftMeeting],
  );

  return (
    <tr
      ref={timelineRef}
      className="group/row border-secondary-200 relative flex h-14 border-b transition-colors"
      onClick={handleTimelineClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DayTableItem date={date} />

      <td
        ref={timelineCellRef}
        className="group-hover/row:bg-secondary-100 relative min-w-0 flex-1 bg-white p-0 transition-colors"
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
            isResizing={drag !== null && drag.meetingId === m.id}
            isMine={!!(currentUserId && m.ownerId === currentUserId)}
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
