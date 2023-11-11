import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface SceneScale {
  scale: number;
  x?: number;
  y?: number;
}

const initialState: SceneScale = {
  scale: 1,
};

export const scaleSlice = createSlice({
  name: "scale",
  initialState,
  reducers: {
    setScale: (state, action: PayloadAction<SceneScale>) => {
      state.scale = action.payload.scale;
      state.x = action.payload.x;
      state.y = action.payload.y;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setScale } = scaleSlice.actions;

export default scaleSlice.reducer;
