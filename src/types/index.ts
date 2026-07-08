// Domain types — shared between UI, Redux, and API service layer.
// These mirror the FastAPI/Pydantic schemas documented in API_CONTRACT.md.

export type Sentiment = "positive" | "neutral" | "negative";

export type InteractionType =
  | "meeting"
  | "call"
  | "email"
  | "conference"
  | "sample_drop"
  | "virtual";

export interface HCP {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  city: string;
  email?: string;
  phone?: string;
  tier?: "A" | "B" | "C";
  avatarUrl?: string;
}

export interface Material {
  id: string;
  name: string;
  type: "brochure" | "clinical_paper" | "slide_deck" | "video";
}

export interface Sample {
  id: string;
  productName: string;
  quantity: number;
  batchNumber?: string;
}

export interface FollowUpAction {
  id: string;
  text: string;
  dueDate?: string; // ISO
  completed?: boolean;
}

export interface Interaction {
  id: string;
  hcpId: string;
  hcp?: HCP;
  type: InteractionType;
  date: string; // ISO date
  time: string; // HH:mm
  attendees: string[];
  topics: string;
  materials: Material[];
  samples: Sample[];
  sentiment: Sentiment;
  outcomes: string;
  followUps: FollowUpAction[];
  notes?: string;
  voiceNoteUrl?: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  source: "form" | "ai";
}

export interface InteractionDraft
  extends Omit<Interaction, "id" | "createdAt" | "updatedAt" | "hcp"> {
  id?: string;
}

export interface DashboardStats {
  todayCount: number;
  weekCount: number;
  pendingFollowUps: number;
  activeHCPs: number;
  todayDelta: number;
  weekDelta: number;
}

export interface DashboardMeeting {
  id: string;
  hcpName: string;
  hcpSpecialty: string;
  type: InteractionType;
  date: string;
  time: string;
  location?: string;
}

export interface AISuggestion {
  id: string;
  interactionId?: string;
  hcpName: string;
  text: string;
  createdAt: string;
}

export interface DashboardPayload {
  stats: DashboardStats;
  todaysInteractions: Interaction[];
  recentInteractions: Interaction[];
  upcomingMeetings: DashboardMeeting[];
  aiSuggestions: AISuggestion[];
  weeklyActivity: { day: string; interactions: number; followUps: number }[];
  sentimentBreakdown: { name: string; value: number }[];
  interactionsByType: { type: string; count: number }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  createdAt: string;
  toolName?: string;
  toolStatus?: "running" | "success" | "error";
  extractedDraft?: Partial<InteractionDraft>;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  history?: Pick<ChatMessage, "role" | "content">[];
}

export interface ChatResponse {
  conversationId: string;
  messages: ChatMessage[];
  extractedDraft?: Partial<InteractionDraft>;
  toolCalls?: {
    name: string;
    status: "success" | "error";
    result?: unknown;
  }[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
