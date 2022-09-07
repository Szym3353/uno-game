import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type card = {
  value: string;
  color: string;
  special: boolean;
  description: string;
};

type winner = {
  points: number;
  username: string;
};

type player = {
  username: string;
  id: string;
  numberOfCards: number;
  cards?: card[];
  waiting: boolean;
  stopped: number;
  points: number;
};

type centerCards = {
  latestCard: card;
  numberOfCards: number;
};

type spareCards = {
  numberOfCards: number;
};

type gameType = {
  id: string;
  lobbyId: string;
  players: player[];
  direction: number;
  winners: winner[];
  centerCards: centerCards;
  spareCards: spareCards;
  state: "started" | "ended";
  turn: string;
  specialActive: boolean;
};

let game = {} as gameType;

const gameSlice = createSlice({
  name: "game",
  initialState: { game },
  reducers: {
    setGame: (state, action: PayloadAction<gameType>) => {
      state.game = action.payload;
    },
  },
});

const { actions, reducer } = gameSlice;
export const { setGame } = actions;
export default reducer;
