import React from 'react';
import type { RootState } from '../lib/store/store';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { CircleIcon, XIcon, HandIcon, LineChartIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { changeMode } from '../lib/store/features/stage/stageSlice';

const toggleGroupItemClasses =
  'hover:bg-violet3 color-mauve11 data-[state=on]:bg-violet6 data-[state=on]:text-violet12 flex h-[35px] w-[35px] items-center justify-center bg-white text-base leading-4 first:rounded-l last:rounded-r focus:z-10 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none';

const ModeMenu = () => {
  const stage = useSelector((state: RootState) => state.stage);
  const dispatch = useDispatch();

  return (
    <div className="absolute top-0">
      <ToggleGroup.Root
        className="inline-flex bg-mauve6 rounded shadow-[0_2px_10px] shadow-blackA4 space-x-px"
        type="single"
        value={stage.mode}
        aria-label="Text alignment"
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
        <ToggleGroup.Item
          className={toggleGroupItemClasses}
          value="hand"
          aria-label="Left aligned"
        >
          <HandIcon />
        </ToggleGroup.Item>
        <ToggleGroup.Item
          className={toggleGroupItemClasses}
          value="circle"
          aria-label="Left aligned"
        >
          <CircleIcon />
        </ToggleGroup.Item>
        <ToggleGroup.Item
          className={toggleGroupItemClasses}
          value="x"
          aria-label="Center aligned"
        >
          <XIcon />
        </ToggleGroup.Item>
        <ToggleGroup.Item
          className={toggleGroupItemClasses}
          value="line"
          aria-label="Center aligned"
        >
          <LineChartIcon />
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  );
};

export default ModeMenu;
