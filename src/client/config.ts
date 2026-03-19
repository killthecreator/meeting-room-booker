export const CONFIG = {
  VERT_HEADER_CELL_WIDTH: 132,
  CONTENT_CELL_WIDTH: 120,
  TIME_STEP: 15, //IN MINS
  DAY_START_HOUR: 8, // Left table boundary
  DAY_END_HOUR: 19, // Right table boundary
  WORKDAY_START: 9,
  WORKDAY_END: 17,
  WEEKS_TO_SHOW: 2,
};

export const HOURS = Array.from(
  { length: CONFIG.DAY_END_HOUR - CONFIG.DAY_START_HOUR },
  (_, i) => i + 8,
); // 8:00 – 18:00 (columns for 8–9 through 18–19)
