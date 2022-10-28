import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type chatMessage = {
  message: string;
  author?: string;
  createdAt: string;
  messageType: "user" | "system";
};

export type lobbyUser = {
  host: boolean;
  username: string;
  id: string;
  stillInGame: boolean;
};

type lobbyType = {
  id: string;
  gameState: "waiting" | "started" | "ended";
  gameId: string;
  code: string;
  lobbyChat: chatMessage[];
  users: lobbyUser[];
};

let lobby = {} as lobbyType;

const lobbySlice = createSlice({
  name: "lobby",
  initialState: { lobby },
  reducers: {
    setLobby: (state, action: PayloadAction<lobbyType>) => {
      state.lobby = action.payload;
    },
    leaveLobby: (state) => {
      state.lobby = {} as lobbyType;
    },
    userJoined: (state, action: PayloadAction<lobbyUser>) => {
      if (
        state.lobby?.users?.every(
          (el: lobbyUser) => el.id !== action.payload.id
        )
      ) {
        state.lobby.users.push(action.payload);
      } else {
        state.lobby.users[
          state.lobby.users.findIndex(
            (el: lobbyUser) => el.id === action.payload.id
          )
        ].stillInGame = false;
      }
    },
    userLeft: (state, action: PayloadAction<string>) => {
      state.lobby.users = state.lobby.users.filter(
        (el: lobbyUser) => el.id !== action.payload
      );
    },
    receiveMessage: (state, action: PayloadAction<chatMessage>) => {
      state.lobby.lobbyChat.push(action.payload);
    },
  },
});

const { actions, reducer } = lobbySlice;
export const { setLobby, leaveLobby, userJoined, userLeft, receiveMessage } =
  actions;
export default reducer;
