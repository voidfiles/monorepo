import {
  panStage,
  updateActive,
  updateDragging,
  updatePosition,
  zoomStage
} from '../../lib/store/features/stage/stageSlice';
import Tool, { StageEvent } from './Tool';

export class HandTool extends Tool {
  mode = 'hand';

  startX: number;
  startY: number;

  onClick(event: StageEvent): void {}

  onMouseDown(event: StageEvent): void {
    console.log('Hand On mouse down');
    if (!event.target) {
      console.log('On mouse down');
      this.startX = event.x;
      this.startY = event.y;
      return;
    }

    if (event.state.dragging) {
      return;
    }

    this.dispatch(
      updateDragging({
        dragging: true,
        dragTarget: event.target
      })
    );
  }

  onMouseUp(event: StageEvent): void {
    console.log('On mouse up');
    if (!event.target) {
      this.dispatch(
        panStage({
          dx: this.startX - event.x,
          dy: this.startY - event.y
        })
      );
      return;
    }

    if (event.state.dragging && event.state.dragTarget != event.target) {
      return;
    }

    this.dispatch(
      updateDragging({
        dragging: false,
        dragTarget: event.target
      })
    );
  }

  onMouseMove(event: StageEvent): void {
    if (!event.target) {
      return;
    }

    if (event.state.dragging && event.state.dragTarget == event.target) {
      this.dispatch(
        updatePosition({
          id: event.target,
          x: event.x,
          y: event.y
        })
      );
    }
  }
}
