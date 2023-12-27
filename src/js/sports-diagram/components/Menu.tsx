import { useHotkeys } from 'react-hotkeys-hook';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger
} from './ui/menubar';
import { useDispatch, useSelector } from 'react-redux';
import { resetStage } from '@lib/store/features/stage/stageSlice';
import { RootState } from '@lib/store';
import { useState } from 'react';
import useRegistry from '@lib/useRegistry';

export default () => {
  const dispatch = useDispatch();
  const [registry, _] = useRegistry();

  const newBoard = (e) => {
    dispatch(resetStage());
  };
  const saveBoard = () => {
    registry.triggerDownload();
  };
  useHotkeys(['Control+n', 'Meta+n', ''], newBoard);
  useHotkeys(['Control+s', 'Meta+s', ''], saveBoard);

  let modifierKeyPrefix = 'ctrl';
  if (
    navigator.platform.indexOf('Mac') === 0 ||
    navigator.platform === 'iPhone'
  ) {
    modifierKeyPrefix = '⌘';
  }

  return (
    <Menubar
      className={
        'rounded-none border-0 rounded-br-lg border-b border-r shadow-lg z-10'
      }
    >
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={newBoard}>
            New Board
            <MenubarShortcut>
              <kbd>ctrl-n</kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={saveBoard}>
            Save Board
            <MenubarShortcut>
              <kbd>{modifierKeyPrefix}-s</kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
