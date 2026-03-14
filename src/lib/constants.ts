export const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8:00 – 18:00 (columns for 8–9 through 18–19)

/** Hours shown as non-working (8–9am and 17–19) */
export const isNonWorkingHour = (h: number): boolean => h < 9 || h >= 17;

/** Column starts at boundary between working and non-working (draw fat dotted line on left) */
export const isWorkBoundaryHour = (h: number): boolean => h === 9 || h === 17;
