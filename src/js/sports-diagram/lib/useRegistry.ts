import Konva from 'konva';
import { useContext } from 'react';
import type { RootState } from '../lib/store/store';
import { useSelector, useDispatch } from 'react-redux';
import stageTools, { StageState } from '@lib/store/features/stage/stageTools';
import ToolRegistryContext from '@lib/registry';
import { UI } from '@lib/store/features/ui/uiSlice';
import { ToolRegister } from '@components/Tools/ToolRegistry';
import { changeMode } from './store/features/stage/stageSlice';

type KonvaEventListener = (
  evt: Konva.KonvaEventObject<MouseEvent | WheelEvent>
) => void;

type KonvaEventListnerBuilder = (
  method: string,
  mode?: string
) => KonvaEventListener;

type useRegistryReturn = [ToolRegister, KonvaEventListnerBuilder];

export default (): useRegistryReturn => {
  const ui = useSelector((state: RootState): UI => state.ui);
  const stage = useSelector((state: RootState): StageState => state.stage);
  const register = useContext(ToolRegistryContext);
  const dispatch = useDispatch();

  register.setDispatch(dispatch);

  const eventHandlerBuilder = (method: string, mode?: string) => {
    return (evt: Konva.KonvaEventObject<MouseEvent | WheelEvent>) => {
      register.executeKonvaEvent({
        method,
        e: evt,
        state: { ui: ui, stage: stage },
        overideMode: mode
      });
    };
  };

  return [register, eventHandlerBuilder];
};
