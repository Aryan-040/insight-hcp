import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { interactionsApi } from "@/api/services";
import type { Interaction, InteractionDraft } from "@/types";

interface State {
  items: Interaction[];
  current: Interaction | null;
  status: "idle" | "loading" | "success" | "error";
  saving: boolean;
  error: string | null;
  filters: { q: string; type: string; sentiment: string };
}

const initialState: State = {
  items: [],
  current: null,
  status: "idle",
  saving: false,
  error: null,
  filters: { q: "", type: "", sentiment: "" },
};

export const fetchInteractions = createAsyncThunk(
  "interactions/fetch",
  async (
    filters: Partial<State["filters"]> | undefined,
    { rejectWithValue },
  ) => {
    try {
      const res = await interactionsApi.list(filters);
      return res.items;
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to load interactions");
    }
  },
);

export const fetchInteraction = createAsyncThunk(
  "interactions/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      return await interactionsApi.get(id);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed");
    }
  },
);

export const saveInteraction = createAsyncThunk(
  "interactions/save",
  async (draft: InteractionDraft, { rejectWithValue }) => {
    try {
      if (draft.id) return await interactionsApi.update(draft.id, draft);
      return await interactionsApi.create(draft);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to save");
    }
  },
);

export const deleteInteraction = createAsyncThunk(
  "interactions/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await interactionsApi.remove(id);
      return id;
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to delete");
    }
  },
);

const slice = createSlice({
  name: "interactions",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<State["filters"]>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchInteractions.pending, (s) => {
      s.status = "loading";
      s.error = null;
    })
      .addCase(fetchInteractions.fulfilled, (s, a) => {
        s.status = "success";
        s.items = a.payload;
      })
      .addCase(fetchInteractions.rejected, (s, a) => {
        s.status = "error";
        s.error = a.payload as string;
      })
      .addCase(fetchInteraction.fulfilled, (s, a) => {
        s.current = a.payload;
      })
      .addCase(saveInteraction.pending, (s) => {
        s.saving = true;
      })
      .addCase(saveInteraction.fulfilled, (s, a) => {
        s.saving = false;
        const idx = s.items.findIndex((i) => i.id === a.payload.id);
        if (idx >= 0) s.items[idx] = a.payload;
        else s.items.unshift(a.payload);
      })
      .addCase(saveInteraction.rejected, (s, a) => {
        s.saving = false;
        s.error = a.payload as string;
      })
      .addCase(deleteInteraction.fulfilled, (s, a) => {
        s.items = s.items.filter((i) => i.id !== a.payload);
      });
  },
});

export const { setFilters, clearCurrent } = slice.actions;
export default slice.reducer;