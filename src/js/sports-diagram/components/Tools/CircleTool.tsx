import Tool, { StageEvent } from './Tool';
import {
  StageItemForCreate,
  updatePosition
} from '../../lib/store/features/stage/stageSlice';
import { PlayerTool } from './Player';

export class CircleTool extends PlayerTool {
  mode = 'circle';

  hotkeys(): Array<[string, () => void]> {
    return [['o', this.selfMode]];
  }

  childObject = (e: StageEvent): StageItemForCreate => {
    return {
      kind: 'circle',
      x: e.stageRelativePointer!.x,
      y: e.stageRelativePointer!.y
    };
  };

  onDragEnd(e: StageEvent): void {
    console.debug('onDrageEnd', e);
    this.dispatch(
      updatePosition({
        id: e.target!,
        x: e.targetPosition!.x,
        y: e.targetPosition!.y
      })
    );
  }
}
