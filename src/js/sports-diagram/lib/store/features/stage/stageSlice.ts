import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { CircleProps } from '../../../../components/Shapes/Circle';
import { XProps } from '../../../../components/Shapes/X';
import { nanoid } from 'nanoid';
import { LineProps } from '../../../../components/Shapes/Line';

export type CirclePropsCreate = Omit<CircleProps, 'id'>;
export type XPropsCreate = Omit<XProps, 'id'>;
export type LinePropsCreate = Omit<LineProps, 'id'>;

export type StageItemForCreate =
  | CirclePropsCreate
  | XPropsCreate
  | LinePropsCreate;

export type StageItem = CircleProps | XProps | LineProps;

export interface Postionable {
  id: string;
  x: number;
  y: number;
}

export interface Activateable {
  id: string;
  active: boolean;
}

export type LinePropsPartial = Partial<LineProps>;

export interface StageState {
  children: Array<StageItem>;
  mode: string;
  dragging: Boolean;
  dragTarget?: string;
  transformMatrix: Array<number>;
}

type DragTarget = {
  dragging: Boolean;
  dragTarget: string;
};

type Pan = {
  dx: number;
  dy: number;
};

type Zoom = {
  scale: number;
  centerX: number;
  centerY: number;
};

const initialState: StageState = {
  children: [],
  mode: 'hand',
  dragging: false,
  transformMatrix: [1, 0, 0, 1, 0, 0]
};

export const stageSlice = createSlice({
  name: 'stage',
  initialState,
  reducers: {
    addChild: (state, action: PayloadAction<StageItemForCreate>) => {
      const item = action.payload;
      state.children = [
        ...state.children,
        {
          ...item,
          id: nanoid()
        }
      ];
    },
    updatePosition: (state, action: PayloadAction<Postionable>) => {
      const child = state.children.find((x) => {
        if (x.id == action.payload.id) {
          return x;
        }
      });

      if (!child) {
        return;
      }

      child.x = action.payload.x;
      child.y = action.payload.y;
    },
    updateActive: (state, action: PayloadAction<Activateable>) => {
      const child = state.children.find((x) => {
        if (x.id == action.payload.id) {
          return x;
        }
      });

      if (!child) {
        return;
      }

      child.active = action.payload.active;
    },
    changeMode: (state, action: PayloadAction<string>) => {
      state.mode = action.payload;
    },
    updateDragging: (state, action: PayloadAction<DragTarget>) => {
      state.dragging = action.payload.dragging;
      state.dragTarget = action.payload.dragging
        ? action.payload.dragTarget
        : undefined;
    },
    updateLine: (state, action: PayloadAction<LinePropsPartial>) => {
      const child = state.children.find((x) => {
        if (x.id == action.payload.id) {
          return x;
        }
      });

      if (!child) {
        return;
      }

      if (child.kind == 'line') {
        child.points[child.points.length] = [
          action.payload.x!,
          action.payload.y!
        ];
      }
    },
    addPointToLine: (state, action: PayloadAction<LinePropsPartial>) => {
      const child = state.children.find((x) => {
        if (x.id == action.payload.id) {
          return x;
        }
      });

      if (!child) {
        return;
      }

      if (child.kind == 'line') {
        child.points.push([action.payload.x!, action.payload.y!]);
      }
    },
    panStage: (state, action: PayloadAction<Pan>) => {
      console.log('Zoom', action.payload);
      state.transformMatrix[4] += action.payload.dx;
      state.transformMatrix[5] += action.payload.dy;
    },
    zoomStage: (state, action: PayloadAction<Zoom>) => {
      for (var i = 0; i < 4; i++) {
        state.transformMatrix[i] *= action.payload.scale;
      }
      state.transformMatrix[4] +=
        (1 - action.payload.scale) * action.payload.centerX;
      state.transformMatrix[5] +=
        (1 - action.payload.scale) * action.payload.centerY;
    }
  }
});

// Action creators are generated for each case reducer function
export const {
  addChild,
  changeMode,
  updatePosition,
  updateDragging,
  updateActive,
  panStage,
  zoomStage
} = stageSlice.actions;

export default stageSlice.reducer;
