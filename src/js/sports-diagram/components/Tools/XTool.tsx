import { StageItemForCreate } from '../../lib/store/features/stage/stageSlice';
import { PlayerTool } from './Player';
import { StageEvent } from './Tool';

export class XTool extends PlayerTool {
  mode = 'x';
  hotkeys(): Array<[string, () => void]> {
    return [['x', this.selfMode]];
  }
  childObject = (e: StageEvent): StageItemForCreate => {
    return {
      kind: 'x',
      x: e.stageRelativePointer!.x,
      y: e.stageRelativePointer!.y
    };
  };
}
