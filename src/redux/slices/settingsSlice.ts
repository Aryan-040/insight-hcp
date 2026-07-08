import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface State {
  theme: "light" | "dark";
  compactMode: boolean;
  notifications: {
    emailFollowUps: boolean;
    inAppReminders: boolean;
    dailySummary: boolean;
  };
  aiAssistant: { autoExtract: boolean; autoSaveDrafts: boolean };
}

const initialState: State = {
  theme: "light",
  compactMode: false,
  notifications: { emailFollowUps: true, inAppReminders: true, dailySummary: false },
  aiAssistant: { autoExtract: true, autoSaveDrafts: true },
};

const slice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<"light" | "dark">) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
    setCompactMode(state, action: PayloadAction<boolean>) {
      state.compactMode = action.payload;
    },
    updateNotifications(state, action: PayloadAction<Partial<State["notifications"]>>) {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    updateAssistant(state, action: PayloadAction<Partial<State["aiAssistant"]>>) {
      state.aiAssistant = { ...state.aiAssistant, ...action.payload };
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setCompactMode,
  updateNotifications,
  updateAssistant,
} = slice.actions;
export default slice.reducer;