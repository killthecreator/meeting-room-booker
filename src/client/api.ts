import axios from "axios";
import type {
  CreateMeetingDTO,
  MeetingDTO,
  UpdateMeetingDTO,
} from "../types/Meeting.type";

const SESSION_STORAGE_KEY = "auth_session";

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(SESSION_STORAGE_KEY, token);
    else localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

const apiWrapper = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

export const api = {
  meetings: {
    async getAll() {
      return apiWrapper.get<MeetingDTO[]>("/meetings/");
    },
    async deleteById(id: string) {
      await apiWrapper.delete(`/meetings/${id}`);
    },
    async createMeeting(input: CreateMeetingDTO) {
      return apiWrapper.post<MeetingDTO>("/meetings/", input);
    },
    async updateById(id: string, input: UpdateMeetingDTO) {
      return apiWrapper.patch<MeetingDTO>(`/meetings/${id}`, input);
    },
  },

  auth: {
    async getUser() {
      const token = getStoredToken();
      return apiWrapper.get("/auth/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },

    async logout() {
      const token = getStoredToken();
      await apiWrapper.post(`/auth/logout`, undefined, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setStoredToken(null);
    },
  },
};
