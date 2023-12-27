import React, { useEffect, useRef } from 'react';
import type { RootState } from '../lib/store/store';
import { useSelector, useDispatch } from 'react-redux';
import BuildToolRegistry from './Tools/ToolRegistry';
import { CircleTool } from './Tools/CircleTool';
import { XTool } from './Tools/XTool';
import { HandTool } from './Tools/HandTool';
import { LineTool } from './Tools/LineTool';
import { useHotkeys } from 'react-hotkeys-hook';
import Field from './Field';

interface StageProps {}

export default function Stage(props: React.PropsWithChildren<StageProps>) {
  return (
    <Field
      svge={svge}
      items={children}
      viewBox={stage.viewBox}
      matrix={stage.transformMatrix}
      {...elementProps}
    />
  );
}
