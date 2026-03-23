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
  MeetingSyncMessage,
  UpdateMeetingDTO,
} from "@meeting-calendar/shared";
import { meetingSyncMessageSchema } from "@meeting-calendar/shared";
import { toast } from "react-toastify";

import { api, API_URL } from "../api";

function applyMeetingSync(
  prev: MeetingDTO[],
  msg: MeetingSyncMessage,
): MeetingDTO[] {
  switch (msg.action) {
    case "add":
      if (prev.some((m) => m.id === msg.meeting.id)) return prev;
      return [...prev, msg.meeting];
    case "update":
      return prev.map((m) => (m.id === msg.meeting.id ? msg.meeting : m));
    case "delete":
      return prev.filter((m) => m.id !== msg.meeting.id);
  }
}

type MeetingsContextValue = {
  meetings: MeetingDTO[];
  createMeeting: (meeting: CreateMeetingDTO) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  updateMeeting: (id: string, updates: UpdateMeetingDTO) => Promise<void>;
};

const MeetingsContext = createContext<MeetingsContextValue | null>(null);

type MeetingsProviderProps = {
  children: ReactNode;
};

export function MeetingsProvider({ children }: MeetingsProviderProps) {
  const [meetings, setMeetings] = useState<MeetingDTO[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/meetings/events`, {
      withCredentials: true,
    });

    const onMessage = (ev: MessageEvent<string>) => {
      try {
        const json = JSON.parse(ev.data);
        const parsed = meetingSyncMessageSchema.parse(json);
        setMeetings((prev) => applyMeetingSync(prev, parsed));
      } catch (e) {
        console.error(e);
      }
    };

    eventSource.addEventListener("message", onMessage);

    return () => {
      eventSource.removeEventListener("message", onMessage);
      eventSource.close();
    };
  }, []);

  const getMeetings = useCallback(async (): Promise<MeetingDTO[]> => {
    const res = await api.meetings.getAll();

    setMeetings(res.data);
    return res.data;
  }, []);

  useEffect(() => {
    (async () => getMeetings())();
  }, [getMeetings]);

  const createMeeting = useCallback(
    async (input: CreateMeetingDTO): Promise<void> => {
      try {
        await api.meetings.createMeeting(input);
        toast.success("Meeting created");
      } catch (err) {
        console.error(err);
        toast.error("Failed to create meeting");
      }
    },
    [],
  );

  const deleteMeeting = useCallback(async (id: string): Promise<void> => {
    try {
      await api.meetings.deleteById(id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete meeting");
    }
  }, []);

  const updateMeeting = useCallback(
    async (id: string, updates: UpdateMeetingDTO): Promise<void> => {
      if (Object.keys(updates).length === 0) return;

      try {
        await api.meetings.updateById(id, updates);
      } catch (err) {
        console.error(err);
        toast.error("Failed to update meeting");
      }
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
