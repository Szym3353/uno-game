import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import jwt from "jwt-decode";
import { socket } from "../socket";
import { errorType } from "./errorSlice";

type userType = {
  id: string;
  username: string;
  email: string;
  friends?: string[];
  //activityStatus: string;
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
      /* {
        ...jwt<userType>(action.payload.token),
        activityStatus: "online",
      }; */
      localStorage.setItem("user", action.payload.token);
    },

    logout: (state) => {
      socket.emit(
        "user:activityStatusChange",
        { userId: state.user && state.user.id, status: "offline" },
        (err: errorType) => {
          console.log("error", err);
        }
      );
      state.user = false;
      localStorage.clear();
    },
  },
});

const { actions, reducer } = userSlice;
export const { login, logout /* , activityStatusChange */ } = actions;
export default reducer;
