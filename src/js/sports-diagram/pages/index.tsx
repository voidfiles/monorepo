import dynamic from 'next/dynamic';

import Sidebar from '@components/Sidebar';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../lib/store/store';
import { mainStageDimensions } from '@lib/store/features/ui/uiSlice';

const WhiteboardStage = dynamic(() => import('@components/WhiteboardStage'), {
  ssr: false
});

export default function Home() {
  const dispatch = useDispatch();

  const [container, setContainer] = useState<HTMLElement | null>(null);

  const ui = useSelector((state: RootState) => state.ui);

  const handleResize = () => {
    console.debug('handleResize $container');
    if (container == null) {
      return;
    }
    // but we also make the full scene visible
    // so we need to scale all objects on canvas

    const rect = container.getBoundingClientRect();
    console.info('resizing', rect);
    dispatch(
      mainStageDimensions({
        width: rect.width,
        height: rect.height
      })
    );
  };

  useEffect(handleResize, [container, ui.sideBarWidth]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      handleResize();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useLayoutEffect(() => {
    handleResize();
    if (!container) {
      return;
    }
  }, [container]);

  return (
    <>
      <div className=" bg-slate-50 h-screen w-screen overflow-hidden grid grid-cols-[4fr_1fr]">
        <main ref={(el) => setContainer(el)} className="h-screen">
          <WhiteboardStage
            width={ui.dimensions.width}
            height={ui.dimensions.height}
          ></WhiteboardStage>
        </main>
        <Sidebar></Sidebar>
      </div>
    </>
  );
}
