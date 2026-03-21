import { CONFIG } from "../../config";
import { formatMinutesAsTime, WORKDAY_START_MIN } from "../../lib/date-utils";

export const DEFAULT_MEETING_FORM_TIME_STRINGS = {
  START: formatMinutesAsTime(WORKDAY_START_MIN),
  END: formatMinutesAsTime(
    WORKDAY_START_MIN + CONFIG.DEFAULT_MEETING_DURATION_MIN,
  ),
} as const;
