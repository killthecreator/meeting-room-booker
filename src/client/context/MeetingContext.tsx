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
} from "../../types/Meeting.type";
import axios from "axios";
import { meetingSchema } from "../../schemas/meeting";

type MeetingContextValue = {
  meetings: MeetingDTO[];
  loading: boolean;
  createMeeting: (meeting: CreateMeetingDTO) => Promise<MeetingDTO>;
  getMeetings: () => Promise<MeetingDTO[]>;
  deleteMeeting: (id: string) => Promise<void>;
  updateMeeting: (id: string, updates: UpdateMeetingDTO) => Promise<void>;
};

const MeetingContext = createContext<MeetingContextValue | null>(null);

export function MeetingProvider({ children }: { children: ReactNode }) {
  const [meetings, setMeetings] = useState<MeetingDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const getMeetings = useCallback(async (): Promise<MeetingDTO[]> => {
    const res = await axios.get("/api/meetings", { withCredentials: true });

    const parsed = meetingSchema.array().parse(res.data);
    setMeetings(parsed);
    return parsed;
  }, []);

  const createMeeting = useCallback(
    async (input: CreateMeetingDTO): Promise<MeetingDTO> => {
      const res = await axios.post<MeetingDTO>("/api/meetings", input, {
        withCredentials: true,
      });

      setMeetings((prev) => prev.concat(res.data));
      return res.data;
    },
    [],
  );

  const deleteMeeting = useCallback(async (id: string): Promise<void> => {
    await axios.delete(`/api/meetings/${id}`, {
      withCredentials: true,
    });

    setMeetings((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMeeting = useCallback(
    async (id: string, updates: UpdateMeetingDTO): Promise<void> => {
      const body: Record<string, string> = {};
      if (updates.start) body.start = updates.start;
      if (updates.end) body.end = updates.end;
      if (Object.keys(body).length === 0) return;

      const res = await axios.patch<MeetingDTO>(`/api/meetings/${id}`, body, {
        withCredentials: true,
      });

      setMeetings((prev) => prev.map((m) => (m.id === id ? res.data : m)));
    },
    [],
  );

  useEffect(() => {
    (async () => {
      const meetings = await getMeetings();
      setMeetings(meetings);
      setLoading(false);
    })();
  }, [getMeetings]);

  const value: MeetingContextValue = {
    meetings,
    loading,
    createMeeting,
    getMeetings,
    deleteMeeting,
    updateMeeting,
  };

  return <MeetingContext value={value}>{children}</MeetingContext>;
}

export function useMeeting() {
  const ctx = use(MeetingContext);
  if (!ctx) throw new Error("useMeeting must be used within MeetingProvider");
  return ctx;
}
