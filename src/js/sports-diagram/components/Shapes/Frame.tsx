import React, { useEffect, useState } from 'react';
import { StageItem } from '../StageItem';
import Konva from 'konva';
import { Rect, Transformer } from 'react-konva';
import useRegistry from '@lib/useRegistry';
import { updateFrameDimensions } from '@lib/store/features/stage/stageSlice';
import { useDispatch } from 'react-redux';

export interface FrameProps extends StageItem {
  kind: 'frame';
  x: number;
  y: number;
  width: number;
  height: number;
  active?: boolean;
  resizing?: boolean;
}

const FRAME_DEFAULTS = {
  x: 100,
  y: 100,
  width: 366,
  height: 200,
  strokeWidth: 10,
  stroke: '#555',
  className: 'cursor-grab',
  fill: 'transparent',
  mode: 'frame',
  active: false
};

export default function Frame(props: React.PropsWithChildren<FrameProps>) {
  const { active, stroke, x, y, height, width, id, ...iprops } = {
    ...FRAME_DEFAULTS,
    ...props
  };
  const activeStroke = active ? 'red' : stroke;
  const [rect, setRect] = useState<Konva.Rect | null>();
  const [transformer, setTransformer] = useState<Konva.Transformer | null>();
  const [_, registerEventHandler] = useRegistry();
  useEffect(() => {
    if (active && transformer && rect) {
      // we need to attach transformer manually
      transformer.nodes([rect]);
      transformer.getLayer()!.batchDraw();
    }
  }, [active, transformer, rect]);
  const dispatch = useDispatch();
  return (
    <>
      <Rect
        id={id}
        x={x}
        y={y}
        ref={(el) => setRect(el)}
        width={width}
        height={height}
        stroke={activeStroke}
        fillEnabled={false}
        onMouseEnter={(e) => {
          // style stage container:
          const container = e.target!.getStage()!.container();
          container.style.cursor = 'pointer';
        }}
        onMouseLeave={(e) => {
          const container = e.target!.getStage()!.container();
          container.style.cursor = 'default';
        }}
        onClick={registerEventHandler('onClick', 'frame')}
        onWheel={registerEventHandler('onWheel', 'hand')}
        onDragEnd={registerEventHandler('onDragEnd', 'frame')}
        onTransformEnd={(e) => {
          console.log('End of the transformer');
          if (!rect) {
            return;
          }
          const scaleX = rect.scaleX();
          const scaleY = rect.scaleY();
          rect.scaleX(1);
          rect.scaleY(1);
          dispatch(
            updateFrameDimensions({
              id: id,
              x: rect.x(),
              y: rect.y(),
              // set minimal value
              width: Math.max(5, rect.width() * scaleX),
              height: Math.max(rect.height() * scaleY)
            })
          );
        }}
        draggable
        {...iprops}
      ></Rect>
      {active && (
        <Transformer
          ref={(el) => setTransformer(el)}
          flipEnabled={false}
          rotateEnabled={false}
          keepRatio={true}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right'
          ]}
          resizeEnabled={true}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
