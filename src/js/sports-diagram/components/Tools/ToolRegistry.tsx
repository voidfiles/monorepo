import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import Tool, { Dataset, EventState, StageEvent } from './Tool';
import { changeMode } from '../../lib/store/features/stage/stageSlice';
import { Point } from '../StageTypes';
import { StageState } from '@lib/store/features/stage/stageTools';
import Konva from 'konva';
import { RootState } from '@lib/store';

interface ToolIndex {
  [index: string]: Tool;
}

type PointResolver = (point: Point, stage: StageState) => Point;
type ExecuteEvent = {
  method: string;
  e: Konva.KonvaEventObject<MouseEvent | WheelEvent>;
  state: EventState;
  overideMode?: string;
};

const findGroup = (
  target: Konva.Shape | Konva.Stage | Konva.Node
): Konva.Group | undefined => {
  if (target.constructor.name === 'Group') {
    return target as Konva.Group;
  }

  if (target.parent) {
    return findGroup(target.parent);
  }
};

export class ToolRegister {
  tools: ToolIndex = {};
  dispatch: Dispatch;
  pointResolver: PointResolver;
  ready: boolean = false;
  konvaStage: Konva.Stage;
  stage: StageState;
  stateDownload?: HTMLAnchorElement;

  register(tool: Tool, mode: string) {
    this.tools[mode] = tool;
    const t = this;
    tool.onRegister((action: AnyAction) => {
      return t.dispatcher(action);
    }, this.setMode);
  }

  hotkeys(): Array<[string, () => void]> {
    return Object.values(this.tools).flatMap((tool) => {
      return tool.hotkeys().map((a) => a);
    });
  }

  dispatcher(action: AnyAction) {
    this.dispatch(action);
  }

  setDispatch(dispatch: Dispatch) {
    this.dispatch = dispatch;
  }

  setKonvaStage(stage: Konva.Stage) {
    this.konvaStage = stage;
  }

  setStageState(state: StageState) {
    this.stage = state;
  }

  setStateDownload(el: HTMLAnchorElement | null) {
    if (el) {
      this.stateDownload = el;
    } else {
      this.stateDownload = undefined;
    }
  }

  triggerDownload() {
    console.log('Triggering a download of state', this.stateDownload);
    this.stateDownload!.click();
  }

  setMode = (mode: string, event?: StageEvent, fromMode?: string) => {
    this.dispatch ? this.dispatch(changeMode(mode)) : null;

    if (!this.tools[mode]) {
      throw mode + ' not in the available modes';
    }

    if (event) {
      this.executeEvent(event);
    }

    if (fromMode) {
      this.setMode(fromMode);
    }
  };

  resolveKonvaEventToStageEvent(
    event: Konva.KonvaEventObject<MouseEvent | WheelEvent>,
    method: string,
    state: () => RootState
  ): StageEvent {
    const box = event.target.getClientRect();
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    const baseData = {
      target: event.target.id(),
      method: method,
      x: event.evt.x,
      y: event.evt.y,
      clientX: event.evt.clientX,
      clientY: event.evt.clientY,
      altKey: event.evt.altKey,
      ctrlKey: event.evt.ctrlKey,
      shiftKey: event.evt.shiftKey,
      targetPosition: {
        x: event.target.x(),
        y: event.target.y()
      },
      targetCenter: {
        x: centerX,
        y: centerY
      }
    };

    if (this.konvaStage) {
      const pointer = this.konvaStage.getPointerPosition()!;
      baseData['stagePointer'] = Number.isNaN(pointer.x)
        ? null
        : { x: pointer.x, y: pointer.y };
    }

    if (this.konvaStage) {
      const pointer = this.konvaStage.getRelativePointerPosition()!;
      baseData['stageRelativePointer'] = Number.isNaN(pointer.x)
        ? null
        : { x: pointer.x, y: pointer.y };
    }

    if (this.konvaStage) {
      baseData['stagePosition'] = {
        x: this.konvaStage.x(),
        y: this.konvaStage.y()
      };
    }

    if ('getRelativePointerPosition' in event.target) {
      const pointer = event.target.getRelativePointerPosition()!;
      baseData['lastTarget'] = findGroup(event.target);
      baseData['targetRelativePointer'] = {
        x: pointer.x,
        y: pointer.y
      };
    }

    if ('deltaY' in event.evt) {
      baseData['deltaY'] = event.evt.deltaY;
      baseData['deltaX'] = event.evt.deltaX;
    }

    const e: StageEvent = {
      ...baseData,
      dataset: {},
      state: state()
    };

    return e;
  }

  executeEvent(e: StageEvent, overideMethod?: string): void {
    const mode = overideMethod || e.state.stage.mode;

    if (this.tools[mode].debug) {
      this.tools[mode].debugEvent(e);
    }

    return this.tools[mode][e.method](e);
  }

  executeKonvaEvent({ method, e, state, overideMode }: ExecuteEvent): void {
    const stageEvent = this.resolveKonvaEventToStageEvent(
      e,
      method,
      () => state
    );
    if (method != 'onMouseMove' && method != 'onWheel') {
      console.debug(`dispatching target: ${e.target} method: ${method} e:`, e);
    }
    this.executeEvent(stageEvent, overideMode);
  }
}

export default function BuildToolRegistry(): ToolRegister {
  return new ToolRegister();
}
