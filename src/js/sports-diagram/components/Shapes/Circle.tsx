import React from 'react';
import { StageItem } from '../StageItem';

export interface CircleProps extends StageItem {
  kind: 'circle';
  x: number;
  y: number;
  r?: number;
  active?: boolean;
}

const CIRCLE_DEFAULTS = {
  x: 100,
  y: 100,
  r: 30,
  strokeWidth: 3,
  className: 'cursor-grab',
  mode: 'circle',
  active: false
};

export default function Circle(props: React.PropsWithChildren<CircleProps>) {
  const { x: cx, y: cy, active, ...iprops } = { ...CIRCLE_DEFAULTS, ...props };
  const stroke = active ? 'red' : 'black';
  return <circle key={iprops.id} cx={cx} cy={cy} stroke={stroke} {...iprops} />;
}
