import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import Konva from "konva";
import { stages } from "konva/lib/Stage";

export type NavigationState = {
  id: string;
  display: boolean;
  x: string;
  y: string;
  canvasReady: boolean;
  stage: Konva.Stage | undefined;
  rendered: boolean;
  transforming?: string;
};

const initialState: NavigationState = {
  id: "",
  display: false,
  x: "",
  y: "",
  canvasReady: false,
  stage: undefined,
  rendered: false,
};

export const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    showPlayerContextMenu: (
      state,
      action: PayloadAction<{ id: string; x: string; y: string }>
    ) => {
      state.id = action.payload.id;
      state.display = true;
      state.x = action.payload.x;
      state.y = action.payload.y;
    },
    hidePlayerContextMenu: (state) => {
      state.display = false;
    },
    canvasReady: (state) => {
      state.canvasReady = true;
    },
    canvasNotReady: (state) => {
      state.canvasReady = false;
    },
    setRendered: (state, action: PayloadAction<boolean>) => {
      state.rendered = action.payload;
    },
    resetStage: (state) => {
      state.canvasReady = false;
      state.stage = undefined;
      state.rendered = false;
    },
    setTransforming: (state, action: PayloadAction<string | undefined>) => {
      state.transforming = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  showPlayerContextMenu,
  hidePlayerContextMenu,
  canvasReady,
  canvasNotReady,
  setRendered,
  resetStage,
  setTransforming,
} = navigationSlice.actions;

export default navigationSlice.reducer;
