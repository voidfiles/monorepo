import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../components/ui/accordion';
import dynamic from 'next/dynamic';

import React, { useState } from 'react';
import type { RootState } from '../lib/store/store';
import { Resizable } from 're-resizable';
import { useDispatch, useSelector } from 'react-redux';
import { changeSidebarSize } from '@lib/store/features/ui/uiSlice';
import { Trash2Icon } from 'lucide-react';

const FrameList = dynamic(() => import('@components/FrameList'), {
  ssr: false
});

export default function Sidebar() {
  const ui = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();

  return (
    // <Resizable
    //   size={{ width: ui.sideBarWidth, height: 'auto' }}
    //   onResizeStop={(e, direction, ref, delta) =>
    //     dispatch(changeSidebarSize(delta.width))
    //   }
    // >
    <aside className="h-screen flex border-l">
      <Accordion
        type="single"
        collapsible
        className="w-full border-t"
        defaultValue="frame-list"
      >
        <AccordionItem value="frame-list">
          <AccordionTrigger className="pl-2">Frames</AccordionTrigger>
          <AccordionContent>
            <FrameList></FrameList>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="tools">
          <AccordionTrigger className="pl-2">Tools</AccordionTrigger>
          <AccordionContent>
            <ul>
              <li className="block">
                <a className="text-lg hover:cursor-pointer">
                  <Trash2Icon size={16} className="inline" />
                  <span>Erase</span>
                </a>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
    // </Resizable>
  );
}
