import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import dashboard from "./slices/dashboardSlice";
import interactions from "./slices/interactionsSlice";
import chat from "./slices/chatSlice";
import auth from "./slices/authSlice";
import settings from "./slices/settingsSlice";
import ui from "./slices/uiSlice";

export const store = configureStore({
  reducer: { dashboard, interactions, chat, auth, settings, ui },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;