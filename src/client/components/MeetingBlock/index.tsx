import { useRef, useState, useCallback } from "react";
import type { MeetingDTO } from "../../../types/Meeting.type";
import {
  minutesFromMidnight,
  parseDateInput,
  isWeekend,
  WORKDAY_START_MIN,
  WORKDAY_END_MIN,
  TIMELINE_MINUTES,
  roundToClosestStep,
} from "../../lib/date-utils";
import { MeetingTooltip } from "./MeetingTooltip";
import { cn } from "../../lib/cn";
import { Resizer } from "./Resizer";
import { useMeetings } from "../../context/MeetingsContext";
import { useAuth } from "../../context/AuthContext";

const DRAG_THRESHOLD_PX = 8;

type MeetingBlockProps = {
  meeting: MeetingDTO;
  onResizeStart: (edge: "left" | "right") => void;
  onMeetingDrop: (date: Date, startMinutes: number, meetingId: string) => void;
  onTouchDragEnd?: () => void;
  isResizing?: boolean;
};

export function MeetingBlock({
  meeting,
  onResizeStart,
  onMeetingDrop,
  onTouchDragEnd,
  isResizing = false,
}: MeetingBlockProps) {
  const { user } = useAuth();
  const isUsersMeeting = user?.id === meeting.owner.id;
  const blockRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const touchDragRef = useRef<{
    touchId: number;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const showTooltip = !isDragging && !isResizing;

  const { deleteMeeting } = useMeetings();

  const startMin = minutesFromMidnight(new Date(meeting.start));
  const endMin = minutesFromMidnight(new Date(meeting.end));
  const visibleStart = Math.max(startMin, WORKDAY_START_MIN);
  const visibleEnd = Math.min(endMin, WORKDAY_END_MIN);
  const left = ((visibleStart - WORKDAY_START_MIN) / TIMELINE_MINUTES) * 100;
  const width =
    visibleEnd > visibleStart
      ? ((visibleEnd - visibleStart) / TIMELINE_MINUTES) * 100
      : 0;

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

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isUsersMeeting) return;
      const touch = e.touches[0];
      if (!touch) return;
      const rect = blockRef.current?.getBoundingClientRect();
      if (!rect) return;
      const data = {
        touchId: touch.identifier,
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
        startX: touch.clientX,
        startY: touch.clientY,
        didDrag: false,
      };
      touchDragRef.current = data;

      const handleMove = (moveE: TouchEvent) => {
        const t = Array.from(moveE.touches).find(
          (x) => x.identifier === data.touchId,
        );
        if (!t) return;
        const dx = Math.abs(t.clientX - data.startX);
        const dy = Math.abs(t.clientY - data.startY);
        if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) {
          data.didDrag = true;
          moveE.preventDefault();
          setIsDragging(true);
        }
      };

      const handleEnd = (endE: TouchEvent) => {
        const t = endE.changedTouches[0];
        if (!t || t.identifier !== data.touchId) {
          touchDragRef.current = null;
          setIsDragging(false);
          cleanup();
          return;
        }
        touchDragRef.current = null;
        setIsDragging(false);
        cleanup();

        if (!data.didDrag) return;

        const el = document.elementFromPoint(t.clientX, t.clientY);
        if (!el) return;

        const tr = el.closest("tr[data-daykey]");
        if (!tr || !(tr instanceof HTMLElement)) return;

        const dayKeyVal = tr.getAttribute("data-daykey");
        if (!dayKeyVal) return;

        const targetDate = parseDateInput(dayKeyVal);
        if (isWeekend(targetDate)) return;

        const timelineCell = tr.querySelector("td:last-child");
        if (!timelineCell) return;

        const cellRect = timelineCell.getBoundingClientRect();
        const blockLeftScreen = t.clientX - data.offsetX;
        const dropX = blockLeftScreen - cellRect.left;
        const pct = Math.max(0, Math.min(1, dropX / cellRect.width));
        const startMinutes = WORKDAY_START_MIN + pct * TIMELINE_MINUTES;
        const snapped = roundToClosestStep(startMinutes);

        const clamped = Math.max(
          WORKDAY_START_MIN,
          Math.min(WORKDAY_END_MIN - 15, snapped),
        );

        onMeetingDrop(targetDate, clamped, meeting.id);
        onTouchDragEnd?.();
      };

      const cleanup = () => {
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleEnd);
        document.removeEventListener("touchcancel", handleEnd);
      };

      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleEnd);
      document.addEventListener("touchcancel", handleEnd);
    },
    [isUsersMeeting, meeting.id, onMeetingDrop, onTouchDragEnd],
  );

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
        ...(isUsersMeeting && { touchAction: "none" as const }),
      }}
      onClick={(e) => e.stopPropagation()}
      {...(isUsersMeeting && {
        draggable: true,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onTouchStart: handleTouchStart,
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
          <Resizer edge="left" onResizeStart={onResizeStart} />
          <Resizer edge="right" onResizeStart={onResizeStart} />
        </>
      )}
    </div>
  );
}
