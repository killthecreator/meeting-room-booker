import {
  useRef,
  useState,
  useCallback,
  type RefObject,
  useEffect,
} from "react";
import type { MeetingDTO } from "../../../types/Meeting.type";
import {
  minutesFromMidnight,
  dayKey,
  roundToClosestStep,
  setMinutesFromMidnight,
} from "../../lib/date-utils";
import {
  getMeetingBlockLayoutPercent,
  snapPointerMinutesOnTimeline,
} from "../../lib/timeline";
import { MeetingTooltip } from "./MeetingTooltip";
import { cn } from "../../lib/cn";
import { Resizer } from "./Resizer";
import { useMeetings } from "../../context/MeetingsContext";
import { useAuth } from "../../context/AuthContext";
import type { DragState } from "../../../types/DragState.type";
import { getEndBounds, getStartBounds } from "../../lib/meeting-bounds";

type MeetingBlockProps = {
  meeting: MeetingDTO;
  timelineCellRef: RefObject<HTMLTableCellElement | null>;
  ignoreNextClickRef: RefObject<boolean>;
};

export function MeetingBlock({
  meeting,

  timelineCellRef,
  ignoreNextClickRef,
}: MeetingBlockProps) {
  const { user } = useAuth();
  const isUsersMeeting = user?.id === meeting.owner.id;
  const blockRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const { meetings, updateMeeting, deleteMeeting } = useMeetings();

  const [drag, setDrag] = useState<DragState | null>(null);
  const isResizing = !!drag;

  const showTooltip = !isDragging && !isResizing;

  // This logic is added to avoid update requests on resizing
  const [localBounds, setLocalBounds] = useState({
    start: meeting.start,
    end: meeting.end,
  });
  useEffect(() => {
    if (
      !isResizing &&
      (localBounds.start !== meeting.start || localBounds.end !== meeting.end)
    ) {
      void updateMeeting(meeting.id, {
        start: localBounds.start,
        end: localBounds.end,
      });
    }
  }, [isResizing, localBounds, meeting, updateMeeting]);
  //

  const handleResize = useCallback(
    (newStartMin: number | null, newEndMin: number | null) => {
      const meetingId = meeting.id;
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

      setLocalBounds({
        start: start.toISOString(),
        end: end.toISOString(),
      });
    },
    [meetings, meeting],
  );

  useEffect(() => {
    if (!drag) return;
    const cell = timelineCellRef.current;
    if (!cell) return;
    if (drag.edge === "move") return;

    const handleMove = (e: globalThis.MouseEvent) => {
      const rect = cell.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const minutes = snapPointerMinutesOnTimeline(x, rect.width);

      switch (drag.edge) {
        case "left": {
          handleResize(minutes, null);
          break;
        }
        case "right": {
          handleResize(null, minutes);
          break;
        }
      }
    };
    const handleUp = () => {
      ignoreNextClickRef.current = true;
      setDrag(null);
    };

    const controller = new AbortController();
    const { signal } = controller;

    //for desktop
    window.addEventListener("mousemove", handleMove, { signal });
    window.addEventListener("mouseup", handleUp, { signal });

    return () => {
      controller.abort();
    };
  }, [drag, handleResize, timelineCellRef, ignoreNextClickRef]);

  const handleResizeStart = useCallback(
    (edge: "left" | "right") => {
      setDrag({
        meetingId: meeting.id,
        edge,
        startMin: minutesFromMidnight(new Date(meeting.start)),
        endMin: minutesFromMidnight(new Date(meeting.end)),
      });
    },
    [meeting],
  );

  const startMin = minutesFromMidnight(new Date(localBounds.start));
  const endMin = minutesFromMidnight(new Date(localBounds.end));
  const { leftPct: left, widthPct: width } = getMeetingBlockLayoutPercent(
    startMin,
    endMin,
  );

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("meetingId", meeting.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", meeting.name);
    const el = blockRef.current;
    const rect = el?.getBoundingClientRect();
    if (rect) {
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      e.dataTransfer.setData("dragOffsetX", String(offsetX));
      if (el) e.dataTransfer.setDragImage(el, offsetX, offsetY);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={blockRef}
      className={cn(
        "group/meeting-block absolute top-1.5 bottom-1.5 flex min-w-[40px] items-center gap-1.5 overflow-visible rounded-lg px-2.5 transition-shadow duration-200",
        isUsersMeeting
          ? "from-primary-500 to-primary-600 shadow-primary-500/25 hover:shadow-primary-500/30 cursor-grab bg-linear-to-r text-white shadow-md ring-1 ring-white/20 ring-inset hover:shadow-lg active:cursor-grabbing"
          : "from-secondary-600 to-secondary-700 shadow-secondary-500/15 bg-linear-to-r text-white/90 shadow-sm ring-1 ring-white/10 ring-inset",
      )}
      style={{
        left: `${left}%`,
        width: `${width}%`,
        anchorName: `--tooltip-${meeting.id}`,
      }}
      onClick={(e) => e.stopPropagation()}
      {...(isUsersMeeting && {
        draggable: true,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
      })}
    >
      <MeetingTooltip meeting={meeting} open={showTooltip} />
      <span className="min-w-0 flex-1 overflow-hidden text-[13px] font-medium text-ellipsis whitespace-nowrap">
        {meeting.name}
      </span>

      {isUsersMeeting && (
        <>
          <button
            className="meeting-delete flex h-[22px] w-[22px] shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-white/15 p-0 text-sm leading-none text-white/80 transition-colors duration-150 hover:bg-white/30 hover:text-white"
            draggable={false}
            onClick={() => deleteMeeting(meeting.id)}
          >
            ×
          </button>
          <Resizer edge="left" onResizeStart={handleResizeStart} />
          <Resizer edge="right" onResizeStart={handleResizeStart} />
        </>
      )}
    </div>
  );
}
