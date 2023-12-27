import React, { ReactNode } from 'react';
import type { RootState } from '../lib/store/store';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import {
  CircleIcon,
  XIcon,
  TrendingUpIcon,
  HandIcon,
  LucideIcon,
  SquareIcon
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { changeMode } from '../lib/store/features/stage/stageSlice';

const Inside = ({
  Icon,
  shortcut,
  size = 18
}: {
  Icon: LucideIcon;
  shortcut: string;
  size: number;
}): ReactNode => {
  return (
    <div className="relative">
      <Icon size={size} strokeWidth={1} className="m-1" />
      <div className="absolute -bottom-1.5 -right-2 font-light">{shortcut}</div>
    </div>
  );
};

const ToggleModeMenu = () => {
  const stage = useSelector((state: RootState) => state.stage);
  const dispatch = useDispatch();

  return (
    <ToggleGroup
      type="single"
      size={'sm'}
      value={stage.mode}
      aria-label="Hand"
      className="border rounded bg-white shadow-md"
      onValueChange={(value: string) => {
        if (value) {
          if (value == stage.mode) {
            dispatch(changeMode('hand'));
          } else {
            dispatch(changeMode(value));
          }
        }
      }}
    >
      <ToggleGroupItem value="hand" aria-label="Place offense">
        <Inside Icon={HandIcon} shortcut="h" size={15} />
      </ToggleGroupItem>
      <ToggleGroupItem value="circle" aria-label="Place defense">
        <Inside Icon={CircleIcon} shortcut="o" size={18} />
      </ToggleGroupItem>
      <ToggleGroupItem value="x" aria-label="Center aligned">
        <Inside Icon={XIcon} shortcut="x" size={18} />
      </ToggleGroupItem>
      <ToggleGroupItem value="line" aria-label="Draw palyer path">
        <Inside Icon={TrendingUpIcon} shortcut="c" size={18} />
      </ToggleGroupItem>
      <ToggleGroupItem value="frame" aria-label="Draw frame on screen">
        <Inside Icon={SquareIcon} shortcut="f" size={18} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

const ModeMenu = () => {
  return (
    <div className="flex justify-center">
      <ToggleModeMenu></ToggleModeMenu>
    </div>
  );
};

export default ModeMenu;
