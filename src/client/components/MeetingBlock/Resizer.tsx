import { cn } from "../../../lib/cn";

type ResizerProps<T extends "left" | "right"> = {
  edge: T;
  onResizeStart: (edge: T) => void;
};

export function Resizer<T extends "left" | "right">({
  edge,
  onResizeStart,
}: ResizerProps<T>) {
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onResizeStart(edge);
  };
  return (
    <div
      className={cn(
        "resize-handle absolute inset-y-0 z-2 w-2.5 cursor-ew-resize touch-none transition-colors duration-150 hover:bg-white/20",
        {
          "left-0 rounded-l-lg": edge === "left",
          "right-0 rounded-r-lg": edge === "right",
        },
      )}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    />
  );
}
