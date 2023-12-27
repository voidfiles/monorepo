import React from 'react';
import { StageItem } from '../StageItem';
import Path, { PathProps } from './Path';
import { Group, Line, Rect } from 'react-konva';
import useRegistry from '@lib/useRegistry';

export interface XProps extends StageItem {
  kind: 'x';
  x: number;
  y: number;
  active?: boolean;
  stroke?: string;
  path?: PathProps;
}

export const XSIZE = 45;
const HALF_XSIZE = XSIZE / 2;
const X_DEFAULTS = {
  // height: 100,
  // width: 100,
  stroke: '#555',
  fill: '#fda4af',
  className: 'cursor-grab',
  strokeWidth: 5,
  mode: 'x',
  active: false
};

export default function X(props: React.PropsWithChildren<XProps>) {
  const [_register, registerEventHandler] = useRegistry();
  const { x, y, id, active, path, stroke, ...iprops } = {
    ...X_DEFAULTS,
    ...props
  };
  const activeStroke = active ? 'red' : stroke;
  const arrow = props.path ? <Path {...props.path}></Path> : '';

  return (
    <Group
      key={id}
      id={id}
      x={x}
      y={y}
      draggable
      onWheel={registerEventHandler('onWheel', 'hand')}
      onDragEnd={registerEventHandler('onDragEnd', 'circle')}
      onMouseEnter={(e) => {
        // style stage container:
        const container = e.target!.getStage().container();
        container.style.cursor = 'pointer';
      }}
      onMouseLeave={(e) => {
        const container = e.target!.getStage().container();
        container.style.cursor = 'default';
      }}
      onClick={registerEventHandler('onClick', 'line')}
      {...iprops}
    >
      {arrow}
      <Rect
        id={id}
        width={XSIZE}
        height={XSIZE}
        onWheel={registerEventHandler('onWheel')}
      ></Rect>
      <Line
        key={1}
        id={id}
        stroke={activeStroke}
        points={[0, 0, XSIZE, XSIZE]}
        strokeWidth={5}
      />
      <Line
        key={3}
        id={id}
        stroke={activeStroke}
        points={[0, XSIZE, XSIZE, 0]}
        strokeWidth={5}
      ></Line>
    </Group>
  );
}
