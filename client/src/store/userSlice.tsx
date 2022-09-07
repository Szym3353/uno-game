import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import jwt from "jwt-decode";

type userType = {
  id: string;
  username: string;
  email: string;
};

let user: userType | false = localStorage.getItem("user")
  ? jwt(localStorage.getItem("user") || "")
  : false;

const userSlice = createSlice({
  name: "user",
  initialState: {
    user,
  },
  reducers: {
    login: (state, action: PayloadAction<{ token: string }>) => {
      state.user = jwt<userType>(action.payload.token);
      localStorage.setItem("user", action.payload.token);
    },
    logout: (state) => {
      state.user = false;
      localStorage.clear();
    },
  },
});

const { actions, reducer } = userSlice;
export const { login, logout } = actions;
export default reducer;
