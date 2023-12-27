import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CircleProps } from '../../../../components/Shapes/Circle';
import type { XProps } from '../../../../components/Shapes/X';
import { FrameProps } from '@components/Shapes/Frame';
import { nanoid } from 'nanoid';
import { PathProps } from '../../../../components/Shapes/Path';

import StageTools, { StageItem, StageState } from './stageTools';

export type CirclePropsCreate = Omit<CircleProps, 'id'>;
export type XPropsCreate = Omit<XProps, 'id'>;
export type FramePropsCreate = Omit<FrameProps, 'id'>;

export type StageItemForCreate =
  | CirclePropsCreate
  | XPropsCreate
  | FramePropsCreate;

export interface Postionable {
  id: string;
  x: number;
  y: number;
}

export interface Resizeable {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Directable {
  path?: PathProps;
}

export interface Activateable {
  id: string;
  active: boolean;
}

type Zoom = {
  scale: number;
  centerX: number;
  centerY: number;
};

const findChildInFrame = (
  id: string,
  state: StageState
): StageItem | undefined => {
  const frame = StageTools.getCurrentFrame(state);
  if (state.viewBox && state.viewBox.id == id) {
    return state.viewBox;
  }
  const child = frame.children.find((x) => {
    if (x.id == id) {
      return x;
    }
  });

  return child;
};

const deactivateChildren = (state: StageState): void => {
  const frame = StageTools.getCurrentFrame(state);
  frame.children.forEach((x) => {
    x.active = false;
  });
};

export const stageSlice = createSlice({
  name: 'stage',
  initialState: StageTools.initialState(),
  reducers: {
    addChild: (state, action: PayloadAction<StageItemForCreate>) => {
      const frame = StageTools.getCurrentFrame(state);
      const item = action.payload;
      const newChild = {
        ...item,
        id: nanoid()
      };
      switch (newChild.kind) {
        case 'frame':
          state.viewBox = { ...newChild };
          break;
        default:
          frame.children = [...frame.children];
          frame.children.push(newChild);
      }
    },
    updatePosition: (state, action: PayloadAction<Postionable>) => {
      const child = findChildInFrame(action.payload.id, state);

      if (!child) {
        return;
      }

      child.x = action.payload.x;
      child.y = action.payload.y;
    },
    updateActive: (state, action: PayloadAction<Activateable>) => {
      const child = findChildInFrame(action.payload.id, state);
      if (!child) {
        deactivateChildren(state);
        return;
      }

      child.active = action.payload.active;
    },
    changeMode: (state, action: PayloadAction<string>) => {
      state.mode = action.payload;
    },
    addPathToChild: (state, action: PayloadAction<Postionable>) => {
      const child = findChildInFrame(action.payload.id, state);

      if (!child) {
        return;
      }

      let [x, y] = [0, 0];
      switch (child.kind) {
        case 'circle':
          x = 30;
          y = 30;
          break;
        case 'x':
          x = 45 / 2;
          y = 45 / 2;
          break;
      }
      const firstPoint: [number, number] = [x, y];
      const directable = child as StageItem & Directable;
      directable.path = {
        id: child.id,
        kind: 'path',
        points: [firstPoint],
        nextPoint: firstPoint
      };
    },
    updatePath: (state, action: PayloadAction<Postionable>) => {
      const child = findChildInFrame(action.payload.id, state);

      if (!child) {
        return;
      }

      const point: [number, number] = [action.payload.x, action.payload.y];
      const directable = child as Directable;
      directable.path!.nextPoint = point;
    },
    addPointToPath: (state, action: PayloadAction<Postionable>) => {
      const child = findChildInFrame(action.payload.id, state);

      if (!child) {
        return;
      }

      const directable = child as Directable;

      directable.path!.points.push(directable.path!.nextPoint!);
      console.log('Points', directable.path!.points);
    },
    finishPath: (state, action: PayloadAction<Postionable>) => {
      const child = findChildInFrame(action.payload.id, state);

      if (!child) {
        return;
      }

      const directable = child as Directable;

      directable.path!.points.push(directable.path!.nextPoint!);
      directable.path!.nextPoint = undefined;

      let lastPoint: [number, number] = [0, 0];
      let points: [number, number][] = [];

      for (let index = 0; index < directable.path!.points.length; index++) {
        const innerPoint = directable.path!.points[index];
        if (index === 0) {
          lastPoint = innerPoint;
          points.push(innerPoint);
          continue;
        }

        const distance = Math.sqrt(
          Math.pow(lastPoint[0] - innerPoint[0], 2) +
            Math.pow(lastPoint[1] - innerPoint[1], 2)
        );

        if (distance < 7) {
          continue;
        }

        points.push(innerPoint);
        lastPoint = innerPoint;
      }

      directable.path!.points = points;
    },
    updateFrameDimensions: (state, action: PayloadAction<Resizeable>) => {
      state.viewBox = {
        kind: 'frame',
        ...action.payload
      };
      const child = findChildInFrame(action.payload.id, state);

      if (!child) {
        return;
      }

      switch (child.kind) {
        case 'frame':
          child.x = action.payload.x;
          child.y = action.payload.y;
          child.width = action.payload.width;
          child.height = action.payload.height;
      }
    },
    addFrame: (state) => {
      const lastFrame = StageTools.lastFrame(state);
      const nextFrameID = nanoid();
      const nextFrame = {
        id: nextFrameID,
        children: [
          ...lastFrame.children.map((x) => {
            const copy = { ...x };
            switch (copy.kind) {
              case 'circle':
              case 'x':
                if (copy.path) {
                  const lastPoint =
                    copy.path.points[copy.path.points.length - 1];
                  copy.x = lastPoint[0];
                  copy.y = lastPoint[1];
                }
                copy.path = undefined;
              case 'frame':
            }

            return copy;
          })
        ]
      };
      state.frames[nextFrameID] = nextFrame;
      state.frameOrder.push(nextFrameID);
    },
    moveToFrame: (state, action: PayloadAction<string>) => {
      state.frameIndex = action.payload;
    },
    resetStage: (state) => {
      if (global.confirm('Reset state of board?')) {
        return StageTools.initialState();
      }
    }
  }
});

// Action creators are generated for each case reducer function
export const {
  addChild,
  changeMode,
  updatePosition,
  updateActive,
  addPathToChild,
  addPointToPath,
  updatePath,
  finishPath,
  addFrame,
  moveToFrame,
  resetStage,
  updateFrameDimensions
} = stageSlice.actions;

export default stageSlice.reducer;
