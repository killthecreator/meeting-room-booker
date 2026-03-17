import {
  createContext,
  use,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Meeting } from "../../types/Meeting.type";

type CreateMeetingInput = Omit<Meeting, "id">;

type MeetingContextValue = {
  meetings: Meeting[];
  loading: boolean;
  createMeeting: (meeting: CreateMeetingInput) => Promise<Meeting>;
  getMeetings: () => Promise<Meeting[]>;
  deleteMeeting: (id: string) => Promise<void>;
  updateMeeting: (
    id: string,
    updates: Partial<Pick<Meeting, "start" | "end">>,
  ) => Promise<void>;
};

const MeetingContext = createContext<MeetingContextValue | null>(null);

function parseMeeting(raw: Record<string, unknown>): Meeting {
  return {
    id: String(raw.id),
    name: String(raw.name),
    description: String(raw.description ?? ""),
    owner: String(raw.owner),
    ownerId: raw.ownerId ? String(raw.ownerId) : undefined,
    ownerEmail: raw.ownerEmail ? String(raw.ownerEmail) : undefined,
    ownerPicture: raw.ownerPicture ? String(raw.ownerPicture) : undefined,
    start: new Date(raw.start as string),
    end: new Date(raw.end as string),
  };
}

export function MeetingProvider({ children }: { children: ReactNode }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const getMeetings = useCallback(async (): Promise<Meeting[]> => {
    const res = await fetch("/api/meetings", { credentials: "include" });
    if (!res.ok) return [];
    const data = (await res.json()) as Record<string, unknown>[];
    const parsed = data.map((row) => parseMeeting(row));
    setMeetings(parsed);
    return parsed;
  }, []);

  const createMeeting = useCallback(
    async (input: CreateMeetingInput): Promise<Meeting> => {
      const id = String(Date.now());
      const body = {
        id,
        ...input,
        start: input.start.toISOString(),
        end: input.end.toISOString(),
      };
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create meeting");
      const meeting: Meeting = { ...input, id };
      setMeetings((prev) => prev.concat(meeting));
      return meeting;
    },
    [],
  );

  const deleteMeeting = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/meetings/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete meeting");
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMeeting = useCallback(
    async (
      id: string,
      updates: Partial<Pick<Meeting, "start" | "end">>,
    ): Promise<void> => {
      const body: Record<string, string> = {};
      if (updates.start) body.start = updates.start.toISOString();
      if (updates.end) body.end = updates.end.toISOString();
      if (Object.keys(body).length === 0) return;

      const res = await fetch(`/api/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update meeting");
      const updated = (await res.json()) as Record<string, unknown>;
      setMeetings((prev) =>
        prev.map((m) => (m.id === id ? parseMeeting(updated) : m)),
      );
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
