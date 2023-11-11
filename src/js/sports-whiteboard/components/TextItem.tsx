import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Html } from "react-konva-utils";
import React, {
  ChangeEventHandler,
  KeyboardEventHandler,
  RefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Group, Rect, Text as KonvaText, Transformer } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { setTransforming } from "../lib/state/features/navigationSlice";
import {
  moveNote,
  Note,
  resizeNote,
  setNoteText,
} from "../lib/state/features/sceneSlice";
import { RootState } from "../lib/state/store";

export type TextItemKind = {
  "data-item-type": string;
  id: string;
  name: string;
  text: string;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
};

export type TextItemProps = {
  e?: DragEvent;
  note: Note;
};

const TextItem: React.FC<TextItemProps> = ({ e, note }) => {
  const dispatch = useDispatch();
  const transforming = useSelector((state: RootState) => {
    return state.navigation.transforming;
  });
  const textRef = useRef() as RefObject<Konva.Text>;
  const groupRef = useRef() as RefObject<Konva.Group>;
  const transformerRef = useRef() as RefObject<Konva.Transformer>;
  const rectRef = useRef() as RefObject<Konva.Rect>;
  const editing = note.id === transforming;

  const getTextAreaStyles = () => {
    if (!textRef.current) {
      console.error("textRef is null");
      return {};
    }
    const textPosition = textRef.current.getAbsolutePosition();
    const stage = textRef.current.getStage();
    if (!stage) {
      return {};
    }
    const container = stage!.container().getBoundingClientRect();
    const areaPosition = {
      x: container.x + textPosition.x,
      y: container.y + textPosition.y,
    };
    textRef.current.padding();

    const width = textRef.current.width();

    return {
      zIndex: "100",
      //position: "absolute",
      top: `${areaPosition.y}px`,
      left: `${areaPosition.x}px`,
      padding: "10px",
      fontSize: `${textRef.current.fontSize()}px`,
      width: `${width}px`,
      height: `${textRef.current.height()}px`,
      border: "none",
      margin: "0px",
      overflow: "hidden",
      background: "none",
      outline: "none",
      //resize: "none",
      lineHeight: textRef.current.lineHeight().toString(),
      fontFamily: textRef.current.fontFamily(),
      transformOrigin: "left top",
      //textAlign: textRef.current.align(),
      //color: textRef.current.fill(),
    };
  };

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    dispatch(setNoteText({ id: note.id, text: e.currentTarget!.value }));
  };

  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    // hide on enter
    // but don't hide on shift + enter
    if (e.keyCode === 13 && !e.shiftKey) {
      dispatch(setTransforming(undefined));
    }
    // on esc do not set value back to node
    if (e.keyCode === 27) {
      dispatch(setTransforming(undefined));
    }
  };

  const onDragMoveFrame = useCallback((e: KonvaEventObject<DragEvent>) => {
    e.target.getLayer()?.batchDraw();
  }, []);

  const onDragEndFrame = useCallback((e: KonvaEventObject<DragEvent>) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();
    dispatch(
      moveNote({
        id: note.id,
        x: e.target.attrs.x,
        y: e.target.attrs.y,
      })
    );
    e.target.getLayer()?.batchDraw();
  }, []);

  const onClickText = (e: KonvaEventObject<MouseEvent>) => {
    dispatch(setTransforming(note.id));
  };

  useEffect(() => {
    if (editing) {
      // we need to attach transformer manually
      transformerRef.current!.nodes([groupRef.current!]);
      transformerRef.current!.getLayer()!.batchDraw();
    }
  }, [editing]);

  const onTransform = () => {
    console.table({
      id: note.id,
      x: groupRef.current!.x(),
      y: groupRef.current!.y(),
      width: Math.max(rectRef.current!.width() * rectRef.current!.scaleX(), 5),
      height: Math.max(rectRef.current!.width() * rectRef.current!.scaleX(), 5),
    });
    dispatch(
      resizeNote({
        id: note.id,
        x: groupRef.current!.x(),
        y: groupRef.current!.y(),
        width: Math.max(
          rectRef.current!.width() * groupRef.current!.scaleX(),
          5
        ),
        height: Math.max(
          rectRef.current!.width() * groupRef.current!.scaleY(),
          5
        ),
      })
    );
  };

  return (
    <React.Fragment>
      <Group
        x={note.x}
        y={note.y}
        ref={groupRef}
        draggable
        onDragMove={onDragMoveFrame}
        onDragEnd={onDragEndFrame}
        scaleX={1}
        scaleY={1}
        onTransform={onTransform}
      >
        <Rect
          ref={rectRef}
          width={note.width}
          height={note.height}
          scaleX={1}
          scaleY={1}
          fill={"#FFF"}
          strokeWidth={3}
          stroke={editing ? "red" : "#aaa"}
          strokeScaleEnabled={false}
          onTransform={onTransform}
        ></Rect>
        {editing ? (
          <Html divProps={{ style: { opacity: editing ? 1 : 0 } }}>
            <textarea
              value={note.text}
              onChange={onChange}
              onKeyDown={onKeyDown}
              style={getTextAreaStyles()}
            />
          </Html>
        ) : (
          <></>
        )}

        <KonvaText
          ref={textRef}
          text={note.text}
          onClick={onClickText}
          name="label-target"
          data-item-type="text"
          data-frame-type="text"
          align={"left"}
          width={note.width}
          height={note.height}
          scaleX={1}
          scaleY={1}
          fill={"#000000"}
          strokeWidth={1}
          padding={10}
          fontSize={24}
          opacity={editing ? 0 : 1}
        />
      </Group>
      {editing && (
        <Transformer ignoreStroke={false} ref={transformerRef}></Transformer>
      )}
    </React.Fragment>
  );
};

export default TextItem;
