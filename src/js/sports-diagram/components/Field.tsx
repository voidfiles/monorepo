import React from 'react';
import Circle from './Shapes/Circle';
import X from './Shapes/X';
import FinaHalfField from './Fields/WaterPolo/FinaHalfField';
import Arrow from './Shapes/Markers/Arrow';
import { StageItem, ViewBox } from '../lib/store/features/stage/stageTools';
import Frame from './Shapes/Frame';
import CirclePoint from './Shapes/Markers/CriclePoint';

interface StageProps {
  svge: React.MutableRefObject<SVGSVGElement | null>;
  items: StageItem[];
  viewBox: ViewBox;
  matrix: number[];
}

const SVG_DEFAULTS = {
  xmlns: 'http://www.w3.org/2000/svg',
  height: '100%',
  width: '100%'
};

const Markers = {
  arrow: <Arrow></Arrow>,
  circlePoint: <CirclePoint></CirclePoint>
};

export default function Field(props: React.PropsWithChildren<StageProps>) {
  let { svge, items, matrix, viewBox, ...extras } = props;

  const elementProps = {
    ...SVG_DEFAULTS,
    ...extras
  };

  const markersRequired: Array<string> = [];

  props.items.forEach((c) => {
    switch (c.kind) {
      case 'circle':
      case 'x':
        if (c.path !== undefined) {
          if (markersRequired.indexOf('arrow') < 0) {
            markersRequired.push('arrow');
          }
        }
    }
  });

  const pitems = [...items].sort((a, _b) => {
    if (a.kind == 'frame') {
      return -1;
    } else {
      return 1;
    }
  });

  return (
    <svg
      ref={svge}
      key={'stage'}
      {...elementProps}
      viewBox={[viewBox.x, viewBox.y, viewBox.width, viewBox.height].join(',')}
      preserveAspectRatio="xMidYMid meet"
    >
      {markersRequired.map((m) => {
        return Markers[m];
      })}
      <CirclePoint></CirclePoint>
      <g transform={`matrix(${props.matrix.join(' ')})`}>
        <FinaHalfField></FinaHalfField>
        {pitems.map((c) => {
          switch (c.kind) {
            case 'circle':
              return <Circle key={c.id} {...{ ...extras, ...c }}></Circle>;
            case 'x':
              return <X key={c.id} {...{ ...extras, ...c }}></X>;
            case 'frame':
              return <Frame key={c.id} {...{ ...extras, ...c }}></Frame>;
            default:
              const _exhaustiveCheck: never = c;
              return _exhaustiveCheck;
          }
        })}
      </g>
    </svg>
  );
}
