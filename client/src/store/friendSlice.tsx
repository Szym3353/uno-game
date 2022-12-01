import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type friendType = {
  activityStatus: "online" | "offline";
  friendId: string;
  status: string;
  username: string;
};

let friends = [] as friendType[];

const friendSlice = createSlice({
  name: "friend",
  initialState: { friends },
  reducers: {
    setFriends: (state, action: PayloadAction<friendType[]>) => {
      state.friends = action.payload;
    },
    removeFromList: (state, action: PayloadAction<string>) => {
      state.friends = state.friends.filter(
        (el: friendType) => el.friendId !== action.payload
      );
    },
    updateFriendStatus: (
      state,
      action: PayloadAction<{ friendId: string; status: "online" | "offline" }>
    ) => {
      let friendIndex = state.friends.findIndex(
        (el: friendType) => el.friendId === action.payload.friendId
      );
      state.friends[friendIndex].activityStatus = action.payload.status;
    },
    addToList: (state, action: PayloadAction<friendType>) => {
      let checkIfExists = state.friends.findIndex(
        (el: friendType) => el.friendId === action.payload.friendId
      );
      if (checkIfExists >= 0) {
        state.friends[checkIfExists] = action.payload;
      }
    },
  },
});

const { reducer, actions } = friendSlice;
export const { setFriends, removeFromList, addToList, updateFriendStatus } =
  actions;
export default reducer;
