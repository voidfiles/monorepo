import React from 'react';
import { StageItem } from '../StageItem';
import Konva from 'konva';
import { Circle, Group } from 'react-konva';
import useRegistry from '@lib/useRegistry';
import Path, { PathProps } from './Path';

export interface CircleProps extends StageItem {
  kind: 'circle';
  x: number;
  y: number;
  r?: number;
  active?: boolean;
  path?: PathProps;
}
export const CIRCLE_RADIUS = 30;
const CIRCLE_DEFAULTS = {
  x: 100,
  y: 100,
  radius: CIRCLE_RADIUS,
  strokeWidth: 5,
  fill: '#93c5fd',
  stroke: '#555',
  mode: 'circle',
  active: false
};

export default function OurCircle(
  props: React.PropsWithChildren<CircleProps & Partial<Konva.CircleConfig>>
) {
  const [_register, registerEventHandler] = useRegistry();
  const { x, y, active, stroke, id, path, ...iprops } = {
    ...CIRCLE_DEFAULTS,
    ...props
  };
  const activeStroke = active ? 'red' : stroke;
  const arrow = path ? <Path {...path}></Path> : '';

  return (
    <Group
      id={id}
      key={id}
      x={x}
      y={y}
      onMouseEnter={(e) => {
        // style stage container:
        const container = e.target!.getStage()!.container();
        container.style.cursor = 'pointer';
      }}
      onMouseLeave={(e) => {
        const container = e.target!.getStage()!.container();
        container.style.cursor = 'default';
      }}
      onClick={registerEventHandler('onClick', 'line')}
      onWheel={registerEventHandler('onWheel', 'hand')}
      onDragEnd={registerEventHandler('onDragEnd', 'circle')}
      draggable
    >
      {arrow}
      {/* <Rect
        width={CIRCLE_RADIUS * 2}
        height={CIRCLE_RADIUS * 2}
        x={0}
        y={0}
        stroke={'#000'}
      ></Rect> */}
      <Circle
        id={id}
        stroke={activeStroke}
        {...iprops}
        x={CIRCLE_RADIUS}
        y={CIRCLE_RADIUS}
      ></Circle>
    </Group>
  );
}
