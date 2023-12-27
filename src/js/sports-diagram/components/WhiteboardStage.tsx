import React, { useCallback, useContext } from 'react';
import type { RootState } from '../lib/store/store';
import { useSelector, useDispatch } from 'react-redux';
import stageTools, { StageState } from '@lib/store/features/stage/stageTools';
import { Layer, Text } from 'react-konva';
import ToolRegistryContext from '@lib/registry';
import Circle from './Shapes/Circle';
import { UI, updateMainStage } from '@lib/store/features/ui/uiSlice';
import useRegistry from '@lib/useRegistry';
import X from './Shapes/X';
import FinaHalfField from './Fields/WaterPolo/FinaHalfField';
import { useHotkeys } from 'react-hotkeys-hook';
import ModeMenu from './ModeMenu';
import Menu from './Menu';
import StateSaveHelpers from './StateSaveHelpers';
import Stage from './Stage';

type WhiteboardstageProps = {
  width: number;
  height: number;
};

export default function WhiteboardStage({
  width,
  height,
  ...props
}: React.PropsWithChildren<WhiteboardstageProps>) {
  const ui = useSelector((state: RootState): UI => state.ui);
  const stage = useSelector((state: RootState): StageState => state.stage);
  const frame = stageTools.getCurrentFrame(stage);
  const dispatch = useDispatch();
  const [register, registerEventHandler] = useRegistry();

  useCallback(() => {
    const scale = width / 1980;
    dispatch(
      updateMainStage({
        scale: {
          x: scale,
          y: scale
        }
      })
    );
  }, []);

  let children = [...frame.children];
  if (stage.dragging && stage.dragTarget) {
    const notDragging = frame.children.filter((x) => x.id != stage.dragTarget);
    const draging = frame.children.find((x) => x.id == stage.dragTarget);
    if (draging) {
      children = [...notDragging, draging];
    } else {
      children = [...notDragging];
    }
  }

  if (stage.viewBox) {
    children.push(stage.viewBox);
  }
  console.debug('Children', children, 'stage', ui.stage.position);

  register.hotkeys().forEach(([key, cb]) => {
    useHotkeys(key, cb);
  });
  return (
    <ToolRegistryContext.Provider value={register}>
      <div className="absolute left-0 z-10">
        <Menu></Menu>
      </div>
      <Stage
        x={0}
        y={0}
        width={width}
        height={height}
        scaleX={ui.stage.scale.x}
        scaleY={ui.stage.scale.y}
        ref={(ref) => {
          if (register && ref) {
            register.setKonvaStage(ref);
          }
        }}
        onClick={registerEventHandler('onClick')}
        onDblClick={registerEventHandler('onDblClick')}
        onWheel={registerEventHandler('onWheel', 'hand')}
        onMouseMove={registerEventHandler('onMouseMove')}
        stageItems={children}
        draggable
      ></Stage>
      <div className="w-screen absolute bottom-5">
        <ModeMenu></ModeMenu>
      </div>
      <StateSaveHelpers></StateSaveHelpers>
    </ToolRegistryContext.Provider>
  );
}
