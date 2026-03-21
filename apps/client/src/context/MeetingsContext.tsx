import {
  createContext,
  use,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  CreateMeetingDTO,
  MeetingDTO,
  UpdateMeetingDTO,
} from "@meeting-calendar/shared";

import { api } from "../api";

type MeetingsContextValue = {
  meetings: MeetingDTO[];
  createMeeting: (meeting: CreateMeetingDTO) => Promise<MeetingDTO>;
  deleteMeeting: (id: string) => Promise<void>;
  updateMeeting: (id: string, updates: UpdateMeetingDTO) => Promise<void>;
};

const MeetingsContext = createContext<MeetingsContextValue | null>(null);

type MeetingsProviderProps = {
  children: ReactNode;
};

export function MeetingsProvider({ children }: MeetingsProviderProps) {
  const [meetings, setMeetings] = useState<MeetingDTO[]>([]);

  const getMeetings = useCallback(async (): Promise<MeetingDTO[]> => {
    const res = await api.meetings.getAll();

    setMeetings(res.data);
    return res.data;
  }, []);

  useEffect(() => {
    (async () => getMeetings())();
  }, [getMeetings]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      await getMeetings();
    }, 20_000);

    return () => clearInterval(intervalId);
  }, [getMeetings]);

  const createMeeting = useCallback(
    async (input: CreateMeetingDTO): Promise<MeetingDTO> => {
      const res = await api.meetings.createMeeting(input);

      setMeetings((prev) => prev.concat(res.data));
      return res.data;
    },
    [],
  );

  const deleteMeeting = useCallback(async (id: string): Promise<void> => {
    await api.meetings.deleteById(id);

    setMeetings((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMeeting = useCallback(
    async (id: string, updates: UpdateMeetingDTO): Promise<void> => {
      const body: Record<string, string> = {};
      if (updates.start) body.start = updates.start;
      if (updates.end) body.end = updates.end;
      if (Object.keys(body).length === 0) return;

      const res = await api.meetings.updateById(id, body);

      setMeetings((prev) => prev.map((m) => (m.id === id ? res.data : m)));
    },
    [],
  );

  const value: MeetingsContextValue = {
    meetings,
    createMeeting,
    deleteMeeting,
    updateMeeting,
  };

  return <MeetingsContext value={value}>{children}</MeetingsContext>;
}

export function useMeetings() {
  const ctx = use(MeetingsContext);
  if (!ctx) throw new Error("useMeeting must be used within MeetingProvider");
  return ctx;
}
