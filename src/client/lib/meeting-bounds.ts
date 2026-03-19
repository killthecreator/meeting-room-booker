import { CONFIG } from "../config";
import {
  minutesFromMidnight,
  WORKDAY_START_MIN,
  WORKDAY_END_MIN,
  roundToClosestStep,
} from "./date-utils";

const MIN_DURATION_MINUTES = CONFIG.TIME_STEP;

/** Bounds for changing the start (left edge): [minStart, maxStart] in minutes from midnight. */
export function getStartBounds(
  endMin: number,
  others: { start: string; end: string }[],
): [number, number] {
  const rightBound = endMin - MIN_DURATION_MINUTES;
  let minStart = WORKDAY_START_MIN;
  for (const o of others) {
    const oStart = minutesFromMidnight(new Date(o.start));
    const oEnd = minutesFromMidnight(new Date(o.end));
    if (oEnd <= endMin && endMin > oStart) minStart = Math.max(minStart, oEnd);
  }
  const maxStart = Math.max(minStart, rightBound);
  const minStartSnap = roundToClosestStep(minStart, "ceil");
  const maxStartSnap = roundToClosestStep(maxStart, "floor");

  return [minStartSnap, maxStartSnap];
}

/** Bounds for changing the end (right edge): [minEnd, maxEnd]. */
export function getEndBounds(
  startMin: number,
  others: { start: string; end: string }[],
): [number, number] {
  const leftBound = startMin + MIN_DURATION_MINUTES;
  let maxEnd = WORKDAY_END_MIN;
  for (const o of others) {
    const oStart = minutesFromMidnight(new Date(o.start));
    const oEnd = minutesFromMidnight(new Date(o.end));
    if (oEnd > startMin) maxEnd = Math.min(maxEnd, oStart);
  }
  const minEndSnap = roundToClosestStep(leftBound, "ceil");
  const maxEndSnap = roundToClosestStep(maxEnd, "floor");
  return [minEndSnap, maxEndSnap];
}

/** Clamps the start when dragging a block (move entire block). Returns a value aligned to step (15 min). */
export function clampMoveStart(
  proposedStart: number,
  duration: number,
  others: { start: string; end: string }[],
): number {
  let s = roundToClosestStep(proposedStart);
  s = Math.max(WORKDAY_START_MIN, Math.min(WORKDAY_END_MIN - duration, s));
  const maxIterations = (others.length + 1) * 2;
  let iterations = 0;
  let changed = true;
  while (changed && iterations < maxIterations) {
    iterations++;
    changed = false;
    for (const o of others) {
      const oStart = minutesFromMidnight(new Date(o.start));
      const oEnd = minutesFromMidnight(new Date(o.end));
      if (s < oEnd && s + duration > oStart) {
        if (s < oStart) {
          s = roundToClosestStep(oStart - duration, "floor");
        } else {
          s = roundToClosestStep(oEnd, "ceil");
        }
        changed = true;
        break;
      }
    }
  }
  s = Math.max(WORKDAY_START_MIN, Math.min(WORKDAY_END_MIN - duration, s));
  return roundToClosestStep(s);
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
