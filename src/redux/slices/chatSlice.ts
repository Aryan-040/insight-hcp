import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { chatApi } from "@/api/services";
import type { ChatMessage, InteractionDraft } from "@/types";

interface State {
  messages: ChatMessage[];
  conversationId: string | null;
  sending: boolean;
  extractedDraft: Partial<InteractionDraft> | null;
  error: string | null;
}

const initialState: State = {
  messages: [
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI assistant. Log interaction details here (e.g., \"Met Dr. Sharma today, discussed OncoBoost efficacy, positive sentiment, shared brochure, follow-up in 2 weeks\") or ask for help.",
      createdAt: new Date().toISOString(),
    },
  ],
  conversationId: null,
  sending: false,
  extractedDraft: null,
  error: null,
};

export const sendMessage = createAsyncThunk(
  "chat/send",
  async (message: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { chat: State };
      return await chatApi.send({
        message,
        conversationId: state.chat.conversationId ?? undefined,
        history: state.chat.messages
          .filter((m) => m.role !== "tool")
          .map(({ role, content }) => ({ role, content })),
      });
    } catch (e: any) {
      return rejectWithValue(e?.message || "Chat failed");
    }
  },
);

const slice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    resetChat() {
      return initialState;
    },
    clearExtractedDraft(state) {
      state.extractedDraft = null;
    },
    pushLocalUserMessage(state, action: PayloadAction<string>) {
      state.messages.push({
        id: `local_${Date.now()}`,
        role: "user",
        content: action.payload,
        createdAt: new Date().toISOString(),
      });
    },
  },
  extraReducers: (b) => {
    b.addCase(sendMessage.pending, (s) => {
      s.sending = true;
      s.error = null;
    })
      .addCase(sendMessage.fulfilled, (s, a) => {
        s.sending = false;
        s.conversationId = a.payload.conversationId;
        const newOnes = a.payload.messages.filter((m) => m.role !== "user");
        s.messages.push(...newOnes);
        if (a.payload.extractedDraft) s.extractedDraft = a.payload.extractedDraft;
      })
      .addCase(sendMessage.rejected, (s, a) => {
        s.sending = false;
        s.error = a.payload as string;
      });
  },
});

export const { resetChat, clearExtractedDraft, pushLocalUserMessage } =
  slice.actions;
export default slice.reducer;