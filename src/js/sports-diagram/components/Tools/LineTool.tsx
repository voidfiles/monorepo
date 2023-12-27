import Tool, { StageEvent } from './Tool';
import {
  updatePath,
  addPathToChild,
  addPointToPath,
  finishPath
} from '../../lib/store/features/stage/stageSlice';
import Konva from 'konva';

export class LineTool extends Tool {
  mode = 'line';
  active = false;
  target?: string;
  lastTarget?: Konva.Shape | Konva.Stage | Konva.Node;
  hotkeys(): Array<[string, () => void]> {
    return [['c', this.activateLineTool.bind(this)]];
  }

  finishLine(): void {
    if (this.target && this.active) {
      this.dispatch(
        finishPath({
          id: this.target,
          x: 0,
          y: 0
        })
      );
      this.active = false;
      this.target = undefined;
      this.lastTarget = undefined;
      this.setMode('hand');
    }
  }

  activateLineTool(): void {
    if (this.active) {
      this.finishLine();
    }
    this.setMode(this.mode);
  }

  onClick(event: StageEvent): void {
    if (this.target) {
      const relativePointer = this.lastTarget!.getRelativePointerPosition();
      console.log('Add point to arrow', {
        id: event.target,
        x: relativePointer!.x,
        y: relativePointer!.y
      });
      this.dispatch(
        addPointToPath({
          id: this.target!,
          x: relativePointer!.x,
          y: relativePointer!.y
        })
      );
      return;
    }
    this.active = true;
    this.target = event.target;
    this.lastTarget = event.lastTarget;
    const relativePointer = this.lastTarget!.getRelativePointerPosition();
    this.dispatch(
      addPathToChild({
        id: this.target!,
        x: relativePointer!.x,
        y: relativePointer!.y
      })
    );
  }

  onDblClick(event: StageEvent): void {
    console.debug('Finish line');
    if (this.target) {
      this.finishLine();
      return;
    }
  }

  onMouseMove(event: StageEvent): void {
    if (this.active && this.target) {
      const relativePointer = this.lastTarget!.getRelativePointerPosition();
      this.dispatch(
        updatePath({
          id: this.target,
          x: relativePointer!.x,
          y: relativePointer!.y
        })
      );
    }
  }
}
