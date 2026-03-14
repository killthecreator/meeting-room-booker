import type { Meeting } from "./Meeting.type";

export type DragState =
  | {
      meetingId: string;
      edge: "left" | "right";
      startMin: number;
      endMin: number;
    }
  | {
      meetingId: string;
      edge: "move";
      startMin: number;
      endMin: number;
      startX: number;
    };

export type DayRowProps = {
  date: Date;
  meetings: Meeting[];
  onSlotClick: (date: Date, startMinutes: number) => void;
  onDelete: (id: string) => void;
  onResize: (
    meetingId: string,
    newStartMin: number | null,
    newEndMin: number | null,
  ) => void;
  onMove: (meetingId: string, newStartMin: number, newEndMin: number) => void;
};
