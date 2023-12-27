import React, { useRef } from 'react';
import type { RootState } from '../lib/store/store';
import { useSelector } from 'react-redux';
import stageTools from '@lib/store/features/stage/stageTools';
import Stage from './Stage';

interface StaticStageProps {
  frameID: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export default function StaticStage({
  frameID,
  width,
  height,
  scale,
  x = 0,
  y = 0,
  ...props
}: React.PropsWithChildren<StaticStageProps>) {
  const stage = useSelector((state: RootState) => state.stage);
  const frame = stageTools.getFrame(stage, frameID);

  return (
    <Stage
      x={x}
      y={y}
      width={width}
      height={height}
      scaleX={scale}
      scaleY={scale}
      stageItems={frame.children}
      draggable={false}
    ></Stage>
  );
}
