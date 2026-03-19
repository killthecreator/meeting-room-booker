import { CONFIG } from "../config";
import {
  WORKDAY_START_MIN,
  WORKDAY_END_MIN,
  TIMELINE_MINUTES,
  formatMinutesAsTime,
  roundToClosestStep,
} from "./date-utils";

/** Latest start minute that still allows at least one TIME_STEP slot before day end. */
export const LATEST_SLOT_START_MIN = WORKDAY_END_MIN - CONFIG.TIME_STEP;

/** Position along the day timeline (0–100%) from minutes since midnight. */
export function minutesToTimelinePercent(minutes: number): number {
  return ((minutes - WORKDAY_START_MIN) / TIMELINE_MINUTES) * 100;
}

/** Raw minutes on the timeline from horizontal position 0–1 within the cell. */
export function timelinePercentToRawMinutes(pct: number): number {
  const clamped = Math.max(0, Math.min(1, pct));
  return WORKDAY_START_MIN + clamped * TIMELINE_MINUTES;
}

/** Offset from left edge of timeline cell (px) → 0–1. */
export function offsetToTimelinePercent(
  offsetX: number,
  cellWidth: number,
): number {
  if (cellWidth <= 0) return 0;
  return Math.max(0, Math.min(1, offsetX / cellWidth));
}

/** Left % and width % for a meeting block clipped to the visible timeline. */
export function getMeetingBlockLayoutPercent(
  startMin: number,
  endMin: number,
): { leftPct: number; widthPct: number } {
  const visibleStart = Math.max(startMin, WORKDAY_START_MIN);
  const visibleEnd = Math.min(endMin, WORKDAY_END_MIN);
  const leftPct = minutesToTimelinePercent(visibleStart);
  const widthPct =
    visibleEnd > visibleStart
      ? minutesToTimelinePercent(visibleEnd) - leftPct
      : 0;
  return { leftPct, widthPct };
}

export function isCurrentTimeOnTimeline(minutes: number): boolean {
  return minutes >= WORKDAY_START_MIN && minutes <= WORKDAY_END_MIN;
}

/** After snapping, clamp start so a slot can still fit before WORKDAY_END. */
export function clampNewSlotStartMinutes(snappedMinutes: number): number {
  return Math.max(
    WORKDAY_START_MIN,
    Math.min(LATEST_SLOT_START_MIN, snappedMinutes),
  );
}

/** Default "start" / "end" strings for create-meeting form. */
export function getDefaultMeetingFormTimeStrings(): {
  start: string;
  end: string;
} {
  return {
    start: formatMinutesAsTime(WORKDAY_START_MIN),
    end: formatMinutesAsTime(
      WORKDAY_START_MIN + CONFIG.DEFAULT_MEETING_DURATION_MIN,
    ),
  };
}

/** Min/max for `<input type="time">` on the create form. */
export function getTimeInputMinMaxStrings(): {
  startMin: string;
  startMax: string;
  endMax: string;
} {
  return {
    startMin: formatMinutesAsTime(WORKDAY_START_MIN),
    startMax: formatMinutesAsTime(LATEST_SLOT_START_MIN),
    endMax: formatMinutesAsTime(WORKDAY_END_MIN),
  };
}

/** Minimum allowed end time given start "HH:mm", for paired time inputs. */
export function endTimeInputMinFromStartTimeStr(
  startTimeStr: string,
): string {
  const [h, m] = startTimeStr.split(":").map(Number);
  const startMins = h * 60 + m;
  return formatMinutesAsTime(
    Math.min(startMins + CONFIG.TIME_STEP, WORKDAY_END_MIN),
  );
}

/** Snap raw minutes from pointer position to TIME_STEP grid (nearest). */
export function snapPointerMinutesOnTimeline(
  offsetXInCell: number,
  cellWidth: number,
): number {
  const pct = offsetToTimelinePercent(offsetXInCell, cellWidth);
  const raw = timelinePercentToRawMinutes(pct);
  return roundToClosestStep(raw);
}

/** Snap click position to the previous TIME_STEP boundary (slot “left edge”). */
export function snapSlotClickToTimelineMinutes(
  offsetXInCell: number,
  cellWidth: number,
): number {
  const pct = offsetToTimelinePercent(offsetXInCell, cellWidth);
  const raw = timelinePercentToRawMinutes(pct);
  return roundToClosestStep(raw, "floor");
}
