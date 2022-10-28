import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type card = {
  value: string;
  color: string;
  special: boolean;
  description: string;
};

export type winner = {
  points: number;
  username: string;
};

export type player = {
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

function getCurrentTurn(index: number, game: gameType) {
  let value = index;
  do {
    console.log(value);
    if (game.direction === 1 && value >= game.players.length - 1) {
      value = 0;
    } else if (game.direction === -1 && value === 0) {
      value = game.players.length - 1;
    } else {
      value += game.direction;
    }
    if (game.players[value].stopped > 0) game.players[value].stopped -= 1;
  } while (game.players[value].stopped > 0);

  console.log(value);
  return game.players[value].id;
}

let game = {} as gameType;

const gameSlice = createSlice({
  name: "game",
  initialState: { game },
  reducers: {
    setGame: (state, action: PayloadAction<gameType>) => {
      state.game = action.payload;
    },
    updatePlayer: (state, action: PayloadAction<player>) => {
      let playerIndex = state.game.players.findIndex(
        (el: player) => el.id === action.payload.id
      );
      console.log("update test1", state.game.players[playerIndex]);
      state.game.players[playerIndex] = {
        ...state.game.players[playerIndex],
        ...action.payload,
      };
      console.log("update test2", state.game.players[playerIndex]);

      //Change turn
      state.game.turn = getCurrentTurn(playerIndex, state.game);
    },
    updateMiddle: (state, action: PayloadAction<card>) => {
      console.log("test", action.payload, state.game.centerCards.latestCard);
      state.game.centerCards.latestCard = action.payload;
      console.log("test", state.game.centerCards.latestCard);
    },
    updateYoursCards: (state, action: PayloadAction<card[] & player>) => {
      let playerIndex = state.game.players.findIndex(
        (el: player) => el.id === action.payload.id
      );

      state.game.players[playerIndex].cards = action.payload;
    },
    leaveGame: (state) => {
      state.game = {} as gameType;
    },
  },
});

const { actions, reducer } = gameSlice;
export const {
  setGame,
  leaveGame,
  updatePlayer,
  updateMiddle,
  updateYoursCards,
} = actions;
export default reducer;
