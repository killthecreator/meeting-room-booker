import {
  formatMinutesAsTime,
  WORKDAY_END_MIN,
  WORKDAY_START_MIN,
} from "../../lib/date-utils";
import { LATEST_SLOT_START_MIN } from "../../lib/timeline";

export const TIME_INPUT_BOUNDS = {
  START_MIN: formatMinutesAsTime(WORKDAY_START_MIN),
  START_MAX: formatMinutesAsTime(LATEST_SLOT_START_MIN),
  END_MAX: formatMinutesAsTime(WORKDAY_END_MIN),
} as const;
