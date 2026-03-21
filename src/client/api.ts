import axios from "axios";
import type {
  CreateMeetingDTO,
  MeetingDTO,
  UpdateMeetingDTO,
} from "../types/Meeting.type";

import type { AuthUser } from "../types/AuthUser.type";

const apiWrapper = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
    async generateSession(input: { code: string }) {
      return apiWrapper.post("/auth/google/callback", input);
    },
    async logout() {
      return apiWrapper.get("/auth/google/logout");
    },
    async verifyToken() {
      return apiWrapper.get<AuthUser | undefined>("/auth/google/verify-token");
    },
  },
};
