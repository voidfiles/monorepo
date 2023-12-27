import { PlusCircleIcon } from 'lucide-react';
import type { RootState } from '../lib/store/store';
import StaticStage from '../components/StaticStage';
import * as TP from './ui/tooltip';
import stageTools from '@lib/store/features/stage/stageTools';
import { useDispatch, useSelector } from 'react-redux';
import { addFrame, moveToFrame } from '@lib/store/features/stage/stageSlice';
import { useEffect, useState } from 'react';

export default function FrameList() {
  const dispatch = useDispatch();
  const stage = useSelector((state: RootState) => state.stage);
  const stageWidth = stage.viewBox?.width || 100;
  const stageHeight = stage.viewBox?.height || 50;
  const x = stage.viewBox?.x || 0;
  const y = stage.viewBox?.y || 0;
  console.log('viewbox', JSON.stringify(stage.viewBox));
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
    scale: number;
  }>({ width: stageWidth, height: stageHeight, scale: 1 });

  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!container) {
      return;
    }

    // now we need to fit stage into parent container
    const containerWidth = container.offsetWidth;

    // but we also make the full scene visible
    // so we need to scale all objects on canvas
    const scale = containerWidth / stageWidth;
    setDimensions({
      width: stageWidth * scale,
      height: stageHeight * scale,
      scale: scale
    });
    console.log('reseting scale', {
      width: stageWidth * scale,
      height: stageHeight * scale,
      scale: scale
    });
  }, [container, stage.viewBox]);
  console.log(
    'x: ' + x,
    'y: ' + y,
    'width: ' + dimensions.width,
    'height: ' + dimensions.height,
    'scale: ' + dimensions.scale
  );
  return (
    <div className="flex flex-col">
      <div className="flex-initial">
        {stageTools.getFrameIDs(stage).map((frameID) => {
          return (
            <div
              key={frameID}
              className="hover:cursor-pointer bg-slate-100 hover:bg-slate-200 aspect-video"
              onClick={() => dispatch(moveToFrame(frameID))}
              ref={(container) => setContainer(container)}
            >
              <StaticStage
                x={x * -1}
                y={y * -1}
                width={dimensions.width}
                height={dimensions.height}
                scale={dimensions.scale}
                frameID={frameID}
              />
            </div>
          );
        })}
        <div
          className="text-center p-10 m-2 hover:cursor-pointer bg-slate-100 hover:bg-slate-200 border"
          onClick={() => dispatch(addFrame())}
          ref={(el) => console.log('setting a container', el, setContainer(el))}
        >
          <TP.TooltipProvider>
            <TP.Tooltip>
              <TP.TooltipTrigger asChild>
                <PlusCircleIcon className="inline"></PlusCircleIcon>
              </TP.TooltipTrigger>
              <TP.TooltipContent
                className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 select-none rounded-[4px] bg-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
                sideOffset={5}
              >
                Add a frame
              </TP.TooltipContent>
            </TP.Tooltip>
          </TP.TooltipProvider>
        </div>
      </div>
    </div>
  );
}
