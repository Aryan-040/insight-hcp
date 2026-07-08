import { createSlice } from "@reduxjs/toolkit";

interface State {
  user: { id: string; name: string; email: string; role: string } | null;
  token: string | null;
}

const initialState: State = {
  user: {
    id: "usr_amit",
    name: "Amit Verma",
    email: "amit.verma@medrep.example",
    role: "Field Representative",
  },
  token: null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setUser, logout } = slice.actions;
export default slice.reducer;