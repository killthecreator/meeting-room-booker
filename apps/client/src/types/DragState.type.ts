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
