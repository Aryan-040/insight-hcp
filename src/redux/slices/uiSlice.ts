import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface State {
  globalLoading: boolean;
  sidebarCollapsed: boolean;
}

const initialState: State = { globalLoading: false, sidebarCollapsed: false };

const slice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const { setGlobalLoading, toggleSidebar } = slice.actions;
export default slice.reducer;