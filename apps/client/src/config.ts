export const CONFIG = {
  VERT_HEADER_CELL_WIDTH: 132,
  CONTENT_CELL_WIDTH: 120,
  TIME_STEP: 15, //IN MINS
  /** Default duration when opening create-meeting flow (minutes). */
  DEFAULT_MEETING_DURATION_MIN: 60,
  DAY_START_HOUR: 8, // Left table boundary
  DAY_END_HOUR: 19, // Right table boundary
  WORKDAY_START: 9,
  WORKDAY_END: 17,
  WEEKS_TO_SHOW: 2,
};

export const GOOGLE_CLIENT_ID =
  "520618371557-k3fj090l0rprsmg9vgucjrs4vpng0hqm.apps.googleusercontent.com";

export const HOURS = Array.from(
  { length: CONFIG.DAY_END_HOUR - CONFIG.DAY_START_HOUR },
  (_, i) => i + CONFIG.DAY_START_HOUR,
);
