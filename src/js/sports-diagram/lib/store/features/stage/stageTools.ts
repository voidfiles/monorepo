import type { CircleProps } from '../../../../components/Shapes/Circle';
import type { XProps } from '../../../../components/Shapes/X';
import { nanoid } from 'nanoid';
import type { FrameProps } from '@components/Shapes/Frame';

export type StageItem = CircleProps | XProps | FrameProps;

export function isCircle(item: StageItem): item is CircleProps {
  return (item as CircleProps).kind == 'circle';
}

export function isX(item: StageItem): item is XProps {
  return (item as XProps).kind == 'x';
}

export function isFrame(item: StageItem): item is FrameProps {
  return (item as FrameProps).kind == 'frame';
}

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Frame {
  id: string;
  children: Array<StageItem>;
}

interface Frames {
  [key: string]: Frame;
}

export interface StageState {
  id: string;
  frames: Frames;
  frameIndex: string;
  frameOrder: Array<string>;
  mode: string;
  dragging: Boolean;
  dragTarget?: string;
  resizing: Boolean;
  resizeTarget?: string;
  resizeDirection?: string;
  viewBox?: FrameProps;
  transformMatrix: Array<number>;
}

export default {
  initialState: (): StageState => {
    const firstFrameId = nanoid();
    const frames = {};
    frames[firstFrameId] = {
      id: firstFrameId,
      children: []
    };

    return {
      id: nanoid(),
      frames: frames,
      frameIndex: firstFrameId,
      frameOrder: [firstFrameId],
      mode: 'hand',
      dragging: false,
      resizing: false,
      transformMatrix: [1, 0, 0, 1, 0, 0]
    };
  },

  getCurrentFrame: (stage: StageState): Frame => {
    return stage.frames[stage.frameIndex];
  },

  getFrames: (stage: StageState): Array<Frame> => {
    return stage.frameOrder.map((frameId) => {
      return stage.frames[frameId];
    });
  },

  getFrameIDs: (stage: StageState): Array<string> => {
    return stage.frameOrder;
  },
  getFrame: (stage: StageState, frameID: string): Frame => {
    return stage.frames[frameID];
  },
  lastFrame: (stage: StageState): Frame => {
    const frameID = stage.frameOrder[stage.frameOrder.length - 1];

    return stage.frames[frameID];
  }
};
