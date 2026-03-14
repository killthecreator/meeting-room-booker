import type { Meeting } from "../types/Meeting.type";
import { getCurrentWeekDays } from "../lib/date-utils";

function atTime(
  day: Date,
  startH: number,
  startM: number,
  endH: number,
  endM: number,
) {
  const start = new Date(day);
  start.setHours(startH, startM, 0, 0);
  const end = new Date(day);
  end.setHours(endH, endM, 0, 0);
  return { start, end };
}

export function initMeetings(): Meeting[] {
  const week = getCurrentWeekDays(new Date());
  const [mon, tue, wed, thu, fri] = week;

  return [
    {
      id: "0",
      name: "Idea",
      description: "Brainstorm and capture product ideas.",
      owner: "Alex",
      ...atTime(mon, 9, 15, 12, 30),
    },
    {
      id: "1",
      name: "Research",
      description: "Market and competitor research.",
      owner: "Sam",
      ...atTime(mon, 12, 45, 15, 0),
    },
    {
      id: "2",
      name: "Discussion with team",
      description: "Sync with design and eng.",
      owner: "Jordan",
      ...atTime(tue, 15, 15, 17, 0),
    },
    {
      id: "3",
      name: "Developing",
      description: "Implementation and testing.",
      owner: "Casey",
      ...atTime(tue, 17, 15, 18, 0),
    },
    {
      id: "4",
      name: "Review",
      description: "Code and design review.",
      owner: "Morgan",
      ...atTime(wed, 17, 45, 19, 0),
    },
    {
      id: "5",
      name: "Party Time",
      description: "Team social event.",
      owner: "Everyone",
      ...atTime(wed, 19, 15, 20, 0),
    },
    {
      id: "6",
      name: "Standup",
      description: "Daily standup and blockers.",
      owner: "Alex",
      ...atTime(thu, 10, 0, 10, 15),
    },
    {
      id: "7",
      name: "Planning",
      description: "Sprint planning and capacity.",
      owner: "Sam",
      ...atTime(fri, 14, 0, 15, 45),
    },
  ];
}
