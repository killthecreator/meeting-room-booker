import axios from "axios";
import type {
  CreateMeetingDTO,
  MeetingDTO,
  UpdateMeetingDTO,
} from "../types/Meeting.type";
import { getStoredToken, setStoredToken } from "./lib/storedAuthToken";

const getAuthReqConfig = () => {
  const token = getStoredToken();
  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
};

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
      return apiWrapper.get("/auth/me", getAuthReqConfig());
    },

    async logout() {
      await apiWrapper.post(`/auth/logout`, undefined, getAuthReqConfig());
      setStoredToken(null);
    },
  },
};
