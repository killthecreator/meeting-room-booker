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
        "resize-handle absolute inset-y-0 w-2 z-2 cursor-ew-resize hover:bg-white/20",
        {
          "left-0 rounded-l-md": edge === "left",
          "right-0 rounded-r-md": edge === "right",
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
