import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dashboardApi } from "@/api/services";
import type { DashboardPayload } from "@/types";

interface State {
  data: DashboardPayload | null;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
}

const initialState: State = { data: null, status: "idle", error: null };

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardApi.fetch();
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to load dashboard");
    }
  },
);

const slice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDashboard.pending, (s) => {
      s.status = "loading";
      s.error = null;
    })
      .addCase(fetchDashboard.fulfilled, (s, a) => {
        s.status = "success";
        s.data = a.payload;
      })
      .addCase(fetchDashboard.rejected, (s, a) => {
        s.status = "error";
        s.error = (a.payload as string) ?? "Failed";
      });
  },
});

export default slice.reducer;