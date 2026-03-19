export const CONFIG = {
  VERT_HEADER_CELL_WIDTH: 132,
  CONTENT_CELL_WIDTH: 120,
  TIME_STEP: 15, //IN MINS
  DAY_START: 8, // Left table boundary
  DAY_END: 19, // Right table boundary
  WORKDAY_START: 9,
  WORKDAY_END: 17,
  WEEKS_TO_SHOW: 2,
};

export const HOURS = Array.from(
  { length: CONFIG.DAY_END - CONFIG.DAY_START },
  (_, i) => i + 8,
); // 8:00 – 18:00 (columns for 8–9 through 18–19)

/** Hours shown as non-working (8–9am and 17–19) */
export const isNonWorkingHour = (h: number): boolean =>
  h < CONFIG.WORKDAY_START || h >= CONFIG.WORKDAY_END;

/** Column starts at boundary between working and non-working (draw fat dotted line on left) */
export const isWorkBoundaryHour = (h: number): boolean =>
  h === CONFIG.WORKDAY_START || h === CONFIG.WORKDAY_END;
