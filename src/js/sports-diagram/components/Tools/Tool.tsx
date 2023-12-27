import { AnyAction } from '@reduxjs/toolkit';

import { StageState } from '@lib/store/features/stage/stageTools';
import { DOMElement } from 'react';
import { UI } from '@lib/store/features/ui/uiSlice';
import Konva from 'konva';

export type Dataset = {
  [key: string]: string;
};

export interface EventState {
  ui: UI;
  stage: StageState;
}
export type Pointer = {
  x: number;
  y: number;
} | null;

export type StageEvent = {
  target?: string;
  method: string;
  dataset: Dataset;
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  targetPosition: Pointer;
  targetCenter: Pointer;
  targetRelativePointer: Pointer;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  stagePointer: Pointer;
  stageRelativePointer: Pointer;
  stagePosition: Pointer;
  deltaY?: number;
  deltaX?: number;
  state: EventState;
  element?: DOMElement<any, any>;
  lastTarget?: Konva.Shape | Konva.Stage;
};

type Dispatcher = (action: AnyAction) => void;

type ModeSetter = (mode: string, event?: StageEvent, fromMode?: string) => void;

export default class Tool {
  mode: string;
  children: Array<Tool> = [];
  dispatcher: Dispatcher;
  setMode: ModeSetter;
  debug: boolean = false;
  hotkeys(): Array<[string, () => void]> {
    return [];
  }

  onRegister(dispatcher: Dispatcher, setMode: ModeSetter) {
    this.dispatcher = dispatcher;
    this.setMode = setMode;
  }

  dispatch(action: AnyAction): void {
    this.dispatcher(action);
  }
  selfMode = (): void => {
    this.setMode(this.mode);
  };

  debugEvent(e: StageEvent): void {
    const items = [
      `constructor: ${this.constructor.name}`,
      `method: ${e.method}`,
      `target: ${e.target}`
    ];

    if (e.target) {
      items.push(`clientX: ${e.clientX}`);
      items.push(`clientY: ${e.clientY}`);
    }
    console.info(items.join('\n'));
  }
  onClick(e: StageEvent): void {}
  onMouseMove(e: StageEvent): void {}
  onMouseEnter(event: StageEvent): void {}
  onMouseLeave(event: StageEvent): void {}
  onMouseDown(e: StageEvent): void {}
  onMouseUp(e: StageEvent): void {}
  onWheel(e: StageEvent): void {}
  onDblClick(e: StageEvent): void {}
  onDragEnd(e: StageEvent): void {}
}
