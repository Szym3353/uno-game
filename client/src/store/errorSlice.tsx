import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type errorType = {
  message: string;
  type: "error" | "warning" | "info" | "success";
  action?: "changePath" | false;
  path?: string;
};

let errors = [] as errorType[];

const errorSlice = createSlice({
  name: "error",
  initialState: { errors },
  reducers: {
    addError: (state, action: PayloadAction<errorType>) => {
      state.errors.push(action.payload);
    },
    clearError: (state, action: PayloadAction<number>) => {
      state.errors = state.errors.filter(
        (el, index) => index !== action.payload
      );
    },
  },
});

const { actions, reducer } = errorSlice;
export const { addError, clearError } = actions;
export default reducer;
