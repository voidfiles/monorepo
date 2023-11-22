import Tool, { StageEvent } from './Tool';
import {
  addChild,
  StageItemForCreate
} from '../../lib/store/features/stage/stageSlice';

export class PlayerTool extends Tool {
  childObject: (e: StageEvent) => StageItemForCreate;
  onClick(e: StageEvent): void {
    if (e.target) {
      return;
    }

    this.dispatch(addChild(this.childObject(e)));
  }

  onMouseDown(event: StageEvent): void {
    if (!event.target) {
      return;
    }
    this.setMode('hand', event, this.mode);
  }

  onMouseUp(event: StageEvent): void {
    if (!event.target) {
      return;
    }
    this.setMode('hand', event, this.mode);
  }

  onMouseMove(event: StageEvent): void {
    if (!event.target) {
      return;
    }

    if (!event.state.dragging) {
      return;
    }

    if (event.state.dragTarget != event.target) {
      return;
    }

    this.setMode('hand', event);
  }
}
