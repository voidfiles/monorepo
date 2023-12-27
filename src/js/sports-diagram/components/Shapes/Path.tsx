import React from 'react';
import { StageItem } from '../StageItem';
import next from 'next';
import { Arrow, Line } from 'react-konva';

export interface PathProps extends StageItem {
  kind: 'path';
  points: Array<[number, number]>;
  nextPoint?: [number, number];
}

const DEFAULTS = {
  points: [],
  strokeWidth: 4,
  fill: 'none',
  stroke: 'black'
};

export default function Path(props: React.PropsWithChildren<PathProps>) {
  let { id, points, nextPoint, stroke, ...iprops } = { ...DEFAULTS, ...props };
  let ipoints: Array<[number, number]>;
  if (nextPoint) {
    ipoints = [...points, nextPoint];
  } else {
    ipoints = [...points];
  }

  let joinedPoints = ipoints.flatMap((p) => p);

  return (
    <Arrow id={id} points={joinedPoints} stroke={stroke} strokeWidth={5} />
  );
}
