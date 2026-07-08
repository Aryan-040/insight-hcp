import { apiClient } from "./client";
import type {
  ChatRequest,
  ChatResponse,
  DashboardPayload,
  HCP,
  Interaction,
  InteractionDraft,
  Paginated,
} from "@/types";

// One service module per resource — matches the FastAPI router breakdown so
// the code is trivially portable to a real backend.

export const dashboardApi = {
  fetch: async (): Promise<DashboardPayload> => {
    const { data } = await apiClient.get<DashboardPayload>("/dashboard");
    return data;
  },
};

export const hcpApi = {
  list: async (query = ""): Promise<Paginated<HCP>> => {
    const { data } = await apiClient.get<Paginated<HCP>>("/hcps", {
      params: query ? { q: query } : {},
    });
    return data;
  },
};

export const interactionsApi = {
  list: async (filters: {
    q?: string;
    type?: string;
    sentiment?: string;
  } = {}): Promise<Paginated<Interaction>> => {
    const { data } = await apiClient.get<Paginated<Interaction>>(
      "/interactions",
      { params: filters },
    );
    return data;
  },
  get: async (id: string): Promise<Interaction> => {
    const { data } = await apiClient.get<Interaction>(`/interactions/${id}`);
    return data;
  },
  create: async (draft: InteractionDraft): Promise<Interaction> => {
    const { data } = await apiClient.post<Interaction>("/interactions", draft);
    return data;
  },
  update: async (id: string, draft: InteractionDraft): Promise<Interaction> => {
    const { data } = await apiClient.put<Interaction>(
      `/interactions/${id}`,
      draft,
    );
    return data;
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete<{ success: boolean }>(
      `/interactions/${id}`,
    );
    return data;
  },
};

export const chatApi = {
  send: async (body: ChatRequest): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>("/chat", body);
    return data;
  },
};