import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type errorType = {
  message: string;
  type: "error" | "warning" | "info" | "success";
  action?: "changePath" | false;
  path?: string;
};

const errorSlice = createSlice({
  name: "error",
  initialState: [] as errorType[],
  reducers: {
    addError: (state, action: PayloadAction<errorType>) => {
      state.push(action.payload);
    },
  },
});

const { actions, reducer } = errorSlice;
export const { addError } = actions;
export default reducer;
