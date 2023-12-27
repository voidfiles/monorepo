import { StageEvent } from './Tool';
import {
  StageItemForCreate,
  updatePosition
} from '../../lib/store/features/stage/stageSlice';
import { PlayerTool } from './Player';

export class FrameTool extends PlayerTool {
  mode = 'frame';

  hotkeys(): Array<[string, () => void]> {
    return [['f', this.selfMode]];
  }

  childObject = (e: StageEvent): StageItemForCreate => {
    return {
      kind: 'frame',
      x: e.x,
      y: e.y,
      width: 198,
      height: 108
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
