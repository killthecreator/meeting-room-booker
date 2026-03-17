import { cn } from "../../../lib/cn";

type HalfHourTimeSeparatorProps = {
  className?: string;
};

export const HalfHourTimeSeparator = ({
  className,
}: HalfHourTimeSeparatorProps) => (
  <span
    className={cn(
      "absolute bottom-0 left-[calc(50%-1px)] w-px bg-gray-500",
      className,
    )}
  />
);
