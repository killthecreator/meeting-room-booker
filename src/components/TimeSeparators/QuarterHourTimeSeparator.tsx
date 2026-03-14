import { cn } from "../../lib/cn";

type QuarterHourTimeSeparatorProps = {
  className?: string;
};

const QuarterHourTimeSeparator = ({
  className,
}: QuarterHourTimeSeparatorProps) => (
  <span className={cn("absolute bottom-0 w-[0.5px] bg-gray-500", className)} />
);

export const FirstQuarterHourTimeSeparator = ({
  className,
}: QuarterHourTimeSeparatorProps) => (
  <QuarterHourTimeSeparator className={cn("left-[calc(25%-1px)]", className)} />
);

export const SecondQuarterHourTimeSeparator = ({
  className,
}: QuarterHourTimeSeparatorProps) => (
  <QuarterHourTimeSeparator className={cn("left-[calc(75%-1px)]", className)} />
);
