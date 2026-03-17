import { cn } from "../../lib/cn";

type ResizerProps<T extends "left" | "right"> = {
  edge: T;
  onResizeStart: (edge: T) => void;
};

export function Resizer<T extends "left" | "right">({
  edge,
  onResizeStart,
}: ResizerProps<T>) {
  return (
    <div
      className={cn(
        "resize-handle absolute inset-y-0 z-2 w-2.5 cursor-ew-resize transition-colors duration-150 hover:bg-white/20",
        {
          "left-0 rounded-l-lg": edge === "left",
          "right-0 rounded-r-lg": edge === "right",
        },
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onResizeStart(edge);
      }}
    />
  );
}
