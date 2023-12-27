import { createContext } from 'react';
import BuildToolRegistry, {
  ToolRegister
} from '../components/Tools/ToolRegistry';
import { CircleTool } from '../components/Tools/CircleTool';
import { XTool } from '../components/Tools/XTool';
import { HandTool } from '../components/Tools/HandTool';
import { LineTool } from '../components/Tools/LineTool';
import { FrameTool } from '../components/Tools/FrameTool';

const r = BuildToolRegistry();

r.register(new CircleTool(), 'circle');
r.register(new XTool(), 'x');
r.register(new HandTool(), 'hand');
r.register(new LineTool(), 'line');
r.register(new FrameTool(), 'frame');

const ToolRegistryContext = createContext<ToolRegister>(r);

export default ToolRegistryContext;
