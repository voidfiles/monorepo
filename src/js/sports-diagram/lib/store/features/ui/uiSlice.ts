import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Position {
  x: number;
  y: number;
}

export interface Scale {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Stage {
  position: Position;
  scale: Scale;
}

export interface UI {
  sideBarWidth: number;
  dimensions: Dimensions;
  stage: Stage;
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sideBarWidth: 200,
    dimensions: {
      width: 0,
      height: 0
    },
    stage: {
      scale: { x: 1, y: 1 },
      position: { x: 0, y: 0 }
    }
  },
  reducers: {
    changeSidebarSize: (state, action: PayloadAction<number>) => {
      state.sideBarWidth += action.payload;
    },
    mainStageDimensions: (state, action: PayloadAction<Dimensions>) => {
      state.dimensions = action.payload;
    },
    updateMainStage: (state, action: PayloadAction<Partial<Stage>>) => {
      if (action.payload.scale) {
        state.stage.scale = action.payload.scale;
      }
      if (action.payload.position) {
        state.stage.position = action.payload.position;
      }
    }
  }
});

// Action creators are generated for each case reducer function
export const { changeSidebarSize, mainStageDimensions, updateMainStage } =
  uiSlice.actions;

export default uiSlice.reducer;
