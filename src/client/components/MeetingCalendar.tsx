import { useState, useCallback, useRef } from "react";
import {
  dayKey,
  setMinutesFromMidnight,
  minutesFromMidnight,
  WORKDAY_END_MIN,
  getCalendarDays,
  formatDateForInput,
} from "../../lib/date-utils";
import {
  getStartBounds,
  getEndBounds,
  clampMoveStart,
  hasOverlap,
  GRID_STEP_MINUTES,
} from "../../lib/meeting-bounds";
import { CalendarHeader } from "./CalendarHeader";
import { DayRow, type DraftMeeting } from "./DayRow";
import { useConfirmMeetingCreation } from "../context/ConfirmMeetingCreationContext";
import { useAuth } from "../context/AuthContext";
import { useMeetings } from "../context/MeetingsContext";
import type { MeetingDTO } from "../../types/Meeting.type";

/** Step in minutes for the timeline (15 minutes) */
const STEP = 15;

export function MeetingCalendar() {
  const { user: authUser } = useAuth();
  const { meetings, createMeeting, deleteMeeting, updateMeeting } =
    useMeetings();

  const { confirmMeetingCreation, updateCreateFormDraft } =
    useConfirmMeetingCreation();
  const currentUserId = authUser?.id;
  const [draftMeeting, setDraftMeeting] = useState<DraftMeeting | null>(null);
  const ghostAnchorRef = useRef<HTMLDivElement>(null);
  const touchDragEndRef = useRef(false);

  const meetingsByDay = meetings.reduce<Record<string, MeetingDTO[]>>(
    (acc, m) => {
      const k = dayKey(new Date(m.start));
      if (!acc[k]) acc[k] = [];
      acc[k].push(m);
      return acc;
    },
    {},
  );

  const today = new Date();
  const days = getCalendarDays(today);
  const weekMinDate = formatDateForInput(days[0]);
  const weekMaxDate = formatDateForInput(days[days.length - 1]);

  const handleSlotClick = useCallback(
    async (date: Date, startMinutes: number) => {
      if (touchDragEndRef.current) {
        touchDragEndRef.current = false;
        return;
      }
      const snappedStart = Math.round(startMinutes / STEP) * STEP;
      const defaultEnd = Math.round((startMinutes + 60) / STEP) * STEP;
      const snappedEnd = Math.min(defaultEnd, WORKDAY_END_MIN);
      const start = setMinutesFromMidnight(date, snappedStart);
      const end = setMinutesFromMidnight(date, snappedEnd);
      setDraftMeeting({ date, start, end, name: "New meeting" });

      const confirmRes = await confirmMeetingCreation({
        title: "Create Meeting",
        start,
        end,
        date,
        step: STEP * 60,
        minDate: weekMinDate,
        maxDate: weekMaxDate,
        checkOverlap: (s, e) =>
          hasOverlap(s, e, meetingsByDay[dayKey(s)] ?? []),
        onDraftChange: (newStart, newEnd, newDate) => {
          setDraftMeeting((prev) =>
            prev
              ? { ...prev, date: newDate, start: newStart, end: newEnd }
              : null,
          );
        },
        onDraftNameChange: (name) => {
          setDraftMeeting((prev) => (prev ? { ...prev, name } : null));
        },
        getAnchorRect: () =>
          ghostAnchorRef.current?.getBoundingClientRect() ?? null,
      });

      setDraftMeeting(null);

      if (!confirmRes) return;

      await createMeeting({
        name: confirmRes.name,
        description: confirmRes.description,
        owner: authUser!,
        start: confirmRes.start.toISOString(),
        end: confirmRes.end.toISOString(),
      });
    },
    [
      confirmMeetingCreation,
      meetingsByDay,
      weekMinDate,
      weekMaxDate,
      authUser,
      createMeeting,
    ],
  );

  const handleTouchDragEnd = useCallback(() => {
    touchDragEndRef.current = true;
  }, []);

  const handleDraftDrop = useCallback(
    (date: Date, startMinutes: number) => {
      if (!draftMeeting) return;
      const duration =
        minutesFromMidnight(draftMeeting.end) -
        minutesFromMidnight(draftMeeting.start);
      const snapped =
        Math.round(startMinutes / GRID_STEP_MINUTES) * GRID_STEP_MINUTES;
      const start = setMinutesFromMidnight(date, snapped);
      const end = setMinutesFromMidnight(date, snapped + duration);
      setDraftMeeting((prev) => (prev ? { ...prev, date, start, end } : null));
      updateCreateFormDraft(start, end, date);
    },
    [draftMeeting, updateCreateFormDraft],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMeeting(id);
    },
    [deleteMeeting],
  );

  const handleResize = useCallback(
    (
      meetingId: string,
      newStartMin: number | null,
      newEndMin: number | null,
    ) => {
      const meeting = meetings.find((m) => m.id === meetingId);
      if (!meeting || meeting.owner.id !== currentUserId) return;
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
        const [minStart, maxStart] = getStartBounds(endMin, others, STEP);
        const snapped = Math.round(newStartMin / STEP) * STEP;
        const clamped = Math.max(minStart, Math.min(maxStart, snapped));
        start = setMinutesFromMidnight(startDate, clamped);
      }
      if (newEndMin !== null) {
        const [minEnd, maxEnd] = getEndBounds(startMin, others, STEP);
        const snapped = Math.round(newEndMin / STEP) * STEP;
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
    [currentUserId, meetings, updateMeeting],
  );

  const handleMeetingDrop = useCallback(
    (date: Date, startMinutes: number, meetingId: string) => {
      const meeting = meetings.find((m) => m.id === meetingId);
      if (!meeting || meeting.owner.id !== currentUserId) return;
      const startDate = new Date(meeting.start);
      const endDate = new Date(meeting.end);
      const duration =
        minutesFromMidnight(endDate) - minutesFromMidnight(startDate);
      const targetDayKey = dayKey(date);
      const othersOnTargetDay = meetings.filter(
        (m) => dayKey(new Date(m.start)) === targetDayKey && m.id !== meetingId,
      );
      const snapped = Math.round(startMinutes / STEP) * STEP;
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
    [currentUserId, meetings, updateMeeting],
  );

  return (
    <div className="animate-fade-in shadow-primary-900/5 relative flex max-h-[90vh] w-[90vw] max-w-[1500px] justify-center overflow-auto rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-xl">
      <table className="block w-full border-collapse overflow-auto rounded-2xl">
        <colgroup className="grid grid-cols-[auto_1fr]">
          <col />
          <col />
        </colgroup>
        <CalendarHeader />
        <tbody>
          {days.map((date) => (
            <DayRow
              key={dayKey(date)}
              date={date}
              meetings={meetingsByDay[dayKey(date)] ?? []}
              draftMeeting={draftMeeting}
              ghostAnchorRef={
                draftMeeting && dayKey(draftMeeting.date) === dayKey(date)
                  ? ghostAnchorRef
                  : undefined
              }
              currentUserId={currentUserId}
              onSlotClick={handleSlotClick}
              onDelete={handleDelete}
              onResize={handleResize}
              onMeetingDrop={handleMeetingDrop}
              onDraftDrop={handleDraftDrop}
              onTouchDragEnd={handleTouchDragEnd}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
