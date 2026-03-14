import {
  minutesFromMidnight,
  WORKDAY_START_MIN,
  WORKDAY_END_MIN,
} from "./date-utils";

export const MIN_DURATION_MINUTES = 15;

/** Grid step in minutes (15 min) */
export const GRID_STEP_MINUTES = 15;

function snapToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/** Bounds for changing the start (left edge): [minStart, maxStart] in minutes from midnight. */
export function getStartBounds(
  endMin: number,
  others: { start: Date; end: Date }[],
  step: number = GRID_STEP_MINUTES,
): [number, number] {
  const rightBound = endMin - MIN_DURATION_MINUTES;
  let minStart = WORKDAY_START_MIN;
  for (const o of others) {
    const oStart = minutesFromMidnight(o.start);
    const oEnd = minutesFromMidnight(o.end);
    if (oEnd <= endMin && endMin > oStart) minStart = Math.max(minStart, oEnd);
  }
  const maxStart = Math.max(minStart, rightBound);
  const minStartSnap = Math.ceil(minStart / step) * step;
  const maxStartSnap = Math.floor(maxStart / step) * step;
  return [minStartSnap, maxStartSnap];
}

/** Bounds for changing the end (right edge): [minEnd, maxEnd]. */
export function getEndBounds(
  startMin: number,
  others: { start: Date; end: Date }[],
  step: number = GRID_STEP_MINUTES,
): [number, number] {
  const leftBound = startMin + MIN_DURATION_MINUTES;
  let maxEnd = WORKDAY_END_MIN;
  for (const o of others) {
    const oStart = minutesFromMidnight(o.start);
    const oEnd = minutesFromMidnight(o.end);
    if (oEnd > startMin) maxEnd = Math.min(maxEnd, oStart);
  }
  const minEndSnap = Math.ceil(leftBound / step) * step;
  const maxEndSnap = Math.floor(maxEnd / step) * step;
  return [minEndSnap, maxEndSnap];
}

/** Clamps the start when dragging a block (move entire block). Returns a value aligned to step (15 min). */
export function clampMoveStart(
  proposedStart: number,
  duration: number,
  others: { start: Date; end: Date }[],
  step: number = GRID_STEP_MINUTES,
): number {
  let s = snapToStep(proposedStart, step);
  s = Math.max(WORKDAY_START_MIN, Math.min(WORKDAY_END_MIN - duration, s));
  const maxIterations = (others.length + 1) * 2;
  let iterations = 0;
  let changed = true;
  while (changed && iterations < maxIterations) {
    iterations++;
    changed = false;
    for (const o of others) {
      const oStart = minutesFromMidnight(o.start);
      const oEnd = minutesFromMidnight(o.end);
      if (s < oEnd && s + duration > oStart) {
        if (s < oStart) {
          s = Math.floor((oStart - duration) / step) * step;
        } else {
          s = Math.ceil(oEnd / step) * step;
        }
        changed = true;
        break;
      }
    }
  }
  s = Math.max(WORKDAY_START_MIN, Math.min(WORKDAY_END_MIN - duration, s));
  return snapToStep(s, step);
}

/** Returns true if the interval [start, end] overlaps any of others (by minutes from midnight on the same day). */
export function hasOverlap(
  start: Date,
  end: Date,
  others: { start: Date; end: Date }[],
): boolean {
  const startMin = minutesFromMidnight(start);
  const endMin = minutesFromMidnight(end);
  for (const o of others) {
    const oStart = minutesFromMidnight(o.start);
    const oEnd = minutesFromMidnight(o.end);
    if (startMin < oEnd && oStart < endMin) return true;
  }
  return false;
}
