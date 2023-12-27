import Konva from 'konva';
import React, { forwardRef } from 'react';
import Circle from './Shapes/Circle';
import X from './Shapes/X';
import { Stage, Layer } from 'react-konva';
import FinaHalfField from './Fields/WaterPolo/FinaHalfField';
import { StageItem } from '@lib/store/features/stage/stageTools';
import Frame from './Shapes/Frame';

interface StageProps {
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  x: number;
  y: number;
  stageItems: StageItem[];
  onClick?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onDblClick?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onWheel?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  draggable: boolean;
}

const stage = (props: React.PropsWithChildren<StageProps>, ref) => {
  const { stageItems, x = 0, y = 0, ...propsWithDefaults } = props;

  return (
    <Stage x={x} y={y} {...propsWithDefaults} ref={ref}>
      <Layer>
        <FinaHalfField></FinaHalfField>
      </Layer>
      <Layer>
        {stageItems.map((e) => {
          switch (e.kind) {
            case 'circle':
              return <Circle key={e.id} {...e}></Circle>;
            case 'x':
              return <X key={e.id} {...e}></X>;
            case 'frame':
              return <Frame key={e.id} {...e}></Frame>;
          }
        })}
      </Layer>
    </Stage>
  );
};
export default forwardRef<Konva.Stage, React.PropsWithChildren<StageProps>>(
  stage
);
