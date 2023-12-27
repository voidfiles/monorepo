import { updateMainStage } from '@lib/store/features/ui/uiSlice';
import {
  zoomStage,
  updateActive
} from '../../lib/store/features/stage/stageSlice';
import Tool, { StageEvent } from './Tool';

export class HandTool extends Tool {
  mode = 'hand';
  // debug = true;
  startX: number = 0;
  startY: number = 0;
  stageStartX: number = 0;
  stageStartY: number = 0;
  startClientX: number = 0;
  startClientY: number = 0;
  scaleBy: number = 1.01;
  lastMouseWheelEventTime: number = 0;
  zoomScaleSensitivity: number = 0.1;

  hotkeys(): Array<[string, () => void]> {
    return [['h', this.selfMode]];
  }

  onWheel(event: StageEvent): void {
    const oldScale = event.state.ui.stage.scale.x;
    const data = {};
    data['oldScale'] = oldScale;
    const stagePtr = event.stagePointer;
    if (!stagePtr) {
      return;
    }
    data['event.stagePointer'] = event.stagePointer;
    var mousePointTo = {
      x: (stagePtr.x - event.stagePosition!.x) / oldScale,
      y: (stagePtr.y - event.stagePosition!.y) / oldScale
    };

    // how to scale? Zoom in? Or zoom out?
    let direction = event.deltaY! > 0 ? 1 : -1;
    data['event.deltaY'] = event.deltaY;
    data['direction'] = direction;
    data['event.ctrlKey'] = event.ctrlKey;
    // when we zoom on trackpad, e.evt.ctrlKey is true
    // in that case lets revert direction
    if (event.ctrlKey) {
      direction = -direction;
    }

    var newScale =
      direction > 0 ? oldScale * this.scaleBy : oldScale / this.scaleBy;
    data['newScale'] = newScale;
    data['positon.x'] = event.x - mousePointTo.x * newScale;
    data['positon.y'] = event.y - mousePointTo.y * newScale;
    console.table(data);
    this.dispatch(
      updateMainStage({
        scale: { x: newScale, y: newScale },
        position: {
          x: event.x - mousePointTo.x * newScale,
          y: event.y - mousePointTo.y * newScale
        }
      })
    );
  }

  onDblClick(event: StageEvent): void {
    this.dispatch(
      zoomStage({
        scale: -0.2,
        centerX: event.x,
        centerY: event.y
      })
    );
  }

  onDragEnd(event: StageEvent): void {
    this.dispatch(
      updateMainStage({
        position: {
          x: event.targetPosition!.x,
          y: event.targetPosition!.y
        }
      })
    );
  }

  onClick(event: StageEvent): void {
    this.dispatch(
      updateActive({
        id: event.target || '',
        active: true
      })
    );
  }
}
