import { useRef, useState } from "react";
import type { Meeting } from "../../../types/Meeting.type";
import {
  minutesFromMidnight,
  WORKDAY_START_MIN,
  WORKDAY_END_MIN,
  TIMELINE_MINUTES,
} from "../../lib/date-utils";
import { MeetingTooltip } from "./MeetingTooltip";
import { cn } from "../../lib/cn";
import { Resizer } from "./Resizer";

export type MeetingBlockProps = {
  meeting: Meeting;
  onDelete: (id: string) => void;
  onResizeStart: (edge: "left" | "right") => void;
  isResizing?: boolean;
  /** Only show delete button and allow delete when true (meeting created by current user) */
  canDelete?: boolean;
  /** Highlight block when true (my meeting) */
  isMine?: boolean;
};

export function MeetingBlock({
  meeting,
  onDelete,
  onResizeStart,
  isResizing = false,
  isMine = false,
}: MeetingBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const showTooltip = !isDragging && !isResizing;

  const startMin = minutesFromMidnight(meeting.start);
  const endMin = minutesFromMidnight(meeting.end);
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

  return (
    <div
      ref={blockRef}
      className={cn(
        "group/meeting-block absolute top-1.5 bottom-1.5 flex min-w-[40px] items-center gap-1.5 overflow-visible rounded-lg px-2.5 transition-shadow duration-200",
        isMine
          ? "cursor-grab bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/25 ring-1 ring-inset ring-white/20 hover:shadow-lg hover:shadow-primary-500/30 active:cursor-grabbing"
          : "bg-gradient-to-r from-secondary-600 to-secondary-700 text-white/90 shadow-sm shadow-secondary-500/15 ring-1 ring-inset ring-white/10",
      )}
      style={{
        left: `${left}%`,
        width: `${width}%`,
        anchorName: `--tooltip-${meeting.id}`,
      }}
      onClick={(e) => e.stopPropagation()}
      {...(isMine && {
        draggable: true,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
      })}
    >
      <MeetingTooltip meeting={meeting} open={showTooltip} />
      <span className="min-w-0 flex-1 overflow-hidden text-[13px] font-medium text-ellipsis whitespace-nowrap">
        {meeting.name}
      </span>

      {isMine && (
        <>
          <button
            className="meeting-delete flex h-[22px] w-[22px] shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-white/15 p-0 text-sm leading-none text-white/80 transition-colors duration-150 hover:bg-white/30 hover:text-white"
            draggable={false}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(meeting.id);
            }}
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
