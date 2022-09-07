import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./userSlice";
import errorReducer from "./errorSlice";
import lobbyReducer from "./lobbySlice";
import gameReducer from "./gameSlice";

const store = configureStore({
  reducer: { userReducer, errorReducer, lobbyReducer, gameReducer },
});
export type RootState = ReturnType<typeof store.getState>;

export default store;
