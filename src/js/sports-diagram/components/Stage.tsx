import React, { useEffect, useRef, useState } from 'react';
import type { RootState } from '../lib/store/store';
import { useSelector, useDispatch } from 'react-redux';
import Circle from './Shapes/Circle';
import X from './Shapes/X';
import Line from './Shapes/Line';
import BuildToolRegistry from './Tools/ToolRegistry';
import { CircleTool } from './Tools/CircleTool';
import { XTool } from './Tools/XTool';
import { HandTool } from './Tools/HandTool';
import { Point } from './StageTypes';
import { LineTool } from './Tools/LineTool';
import FinaHalfField from './Fields/WaterPolo/FinaHalfField';

interface StageProps {}

const SVG_DEFAULTS = {
  xmlns: 'http://www.w3.org/2000/svg',
  height: '100%',
  width: '100%'
};

const STARTING_TRANSFORM = [1, 0, 0, 1, 0, 0];

const register = BuildToolRegistry();
register.register(new CircleTool());
register.register(new XTool());
register.register(new HandTool());
register.register(new LineTool());
register.setMode('hand');

const eventHandlers = {
  onClick: register.buildEventHandler('onClick'),
  onMouseMove: register.buildEventHandler('onMouseMove'),
  onMouseEnter: register.buildEventHandler('onMouseEnter'),
  onMouseLeave: register.buildEventHandler('onMouseLeave'),
  onMouseDown: register.buildEventHandler('onMouseDown'),
  onMouseUp: register.buildEventHandler('onMouseUp'),
  onMouseWheel: register.buildEventHandler('onMouseWheel')
};

export default function Stage(props: React.PropsWithChildren<StageProps>) {
  const svge = useRef<SVGSVGElement | null>(null);
  const stage = useSelector((state: RootState) => state.stage);
  const dispatch = useDispatch();

  const width = 1920;
  const height = 1080;
  var centerX = width / 2;
  var centerY = height / 2;

  register.updateModeFromState(stage.mode);
  register.setDispatch(dispatch);
  register.setStageState(stage);

  useEffect(() => {
    register.setPointResolver(svge.current!);
  }, [svge.current]);

  const elementProps = {
    ...SVG_DEFAULTS,
    ...props,
    ...eventHandlers
  };

  let children = stage.children;
  if (stage.dragging && stage.dragTarget) {
    const notDragging = stage.children.filter((x) => x.id != stage.dragTarget);
    const draging = stage.children.find((x) => x.id == stage.dragTarget);
    if (draging) {
      children = [...notDragging, draging];
    } else {
      children = [...notDragging];
    }
  }
  const matrix = `matrix(${stage.transformMatrix.join(' ')})`;

  return (
    <svg
      ref={svge}
      key={'stage'}
      {...elementProps}
      viewBox="0,0,1920,1080"
      preserveAspectRatio="slice"
    >
      <g transform={matrix}>
        <FinaHalfField></FinaHalfField>
        {children.map((c) => {
          switch (c.kind) {
            case 'circle':
              const circleProps = { ...c, ...eventHandlers };
              return <Circle key={c.id} {...circleProps}></Circle>;
            case 'x':
              const xProps = { ...c, ...eventHandlers };
              return <X key={c.id} {...xProps}></X>;
            case 'line':
              const lineProps = { ...c, ...eventHandlers };
              return <Line key={c.id} {...lineProps}></Line>;
            default:
              const _exhaustiveCheck: never = c;
              return _exhaustiveCheck;
          }
        })}
      </g>
    </svg>
  );
}
