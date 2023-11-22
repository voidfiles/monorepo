import { AnyAction } from '@reduxjs/toolkit';
import {
  StageState,
  updateActive
} from '../../lib/store/features/stage/stageSlice';

export type StageEvent = {
  target?: string;
  method: string;
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  state: StageState;
};
type Dispatcher = (action: AnyAction) => void;
type ModeSetter = (mode: string, event?: StageEvent, fromMode?: string) => void;

export default class Tool {
  mode: string;
  children: Array<Tool> = [];
  dispatcher: Dispatcher;
  setMode: ModeSetter;

  onRegister(dispatcher: Dispatcher, setMode: ModeSetter) {
    this.dispatcher = dispatcher;
    this.setMode = setMode;
  }

  dispatch(action: AnyAction): void {
    this.dispatcher(action);
  }

  onClick(e: StageEvent): void {}
  onMouseMove(e: StageEvent): void {}
  onMouseEnter(event: StageEvent): void {
    if (!event.target) {
      return;
    }

    if (event.state.dragging) {
      return;
    }
    this.dispatch(
      updateActive({
        id: event.target,
        active: true
      })
    );
  }

  onMouseLeave(event: StageEvent): void {
    if (!event.target) {
      return;
    }

    if (event.state.dragging) {
      return;
    }

    this.dispatch(
      updateActive({
        id: event.target,
        active: false
      })
    );
  }
  onMouseDown(e: StageEvent): void {}
  onMouseUp(e: StageEvent): void {}
  onMouseWheel(e: StageEvent): void {}
}
