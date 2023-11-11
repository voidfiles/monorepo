// @refresh reset
import { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer, Arrow, Rect } from "react-konva";
import Konva from "konva";
import hotkeys from "hotkeys-js";

import Player from "./Player";
import { useSelector, useDispatch } from "react-redux";
import { setScale } from "../lib/state/features/scene/scaleSlice";
import type { RootState } from "../lib/state/store";
import {
  addLinePoint,
  addNote,
  addPlayer,
  finishLine,
  PlayerSide,
  SceneState,
  startLine,
  updateLine,
} from "../lib/state/features/sceneSlice";
import {
  canvasReady,
  hidePlayerContextMenu,
  setRendered,
} from "../lib/state/features/navigationSlice";
import { fieldConfigForKey } from "../lib/Fields";
import TextItem from "./TextItem";
type PlayStageInput = {
  width?: number;
  height?: number;
  stageFrame?: string;
  onStage?: (node: Konva.Stage) => void;
};

const PlayStage: React.FC<PlayStageInput> = ({
  onStage,
  stageFrame,
  width = window.innerWidth,
  height = window.innerHeight,
}) => {
  const sceneScale = useSelector((state: RootState) => state.scale);
  const sceneState = useSelector((state: RootState) => state.scene);
  const contextMenuState = useSelector((state: RootState) => state.navigation);
  const dispatch = useDispatch();
  const stageRef = useRef<Konva.Stage>();
  const rectRef = useRef<Konva.Rect>();
  const rectCB = useCallback((node: Konva.Rect) => {
    if (!node) {
      return;
    }
    rectRef.current = node;
  }, []);
  const stageCB = useCallback((node: Konva.Stage) => {
    if (!node) {
      return;
    }
    stageRef.current = node;
    onStage && onStage(node);
  }, []);
  const imageRef = useRef<Konva.Image | null>(null);
  const [layer, setLayer] = useState<Konva.Layer | null>(null);
  const layerCB = useCallback((node: Konva.Layer) => {
    if (layer) {
      return;
    }
    setLayer(node);
  }, []);

  const playersLayerRef = useRef<Konva.Layer>();
  const playersLayerRefCB = useCallback((node: Konva.Layer) => {
    if (layer) {
      return;
    }
    playersLayerRef.current = node;
  }, []);

  useEffect(() => {
    if (!layer) {
      return;
    }
    if (!stageRef.current) {
      return;
    }

    const field = fieldConfigForKey(sceneState.field);
    Konva.Image.fromURL(field.fieldPath, (imageNode: Konva.Image) => {
      if (imageRef.current) {
        layer.destroyChildren();
        layer.draw();
      }
      imageRef.current = imageNode;

      layer.add(imageNode);

      const box = imageNode.getClientRect({
        relativeTo: stageRef.current,
      });
      const stageSize = stageRef.current!.getSize();
      const scaleX = stageSize.width / box.width;
      const scaleValue = scaleX;
      dispatch(setScale({ scale: scaleValue }));
      dispatch(canvasReady());
      console.log("stage is ready to go");
    });
  }, [layer, sceneState.field]);

  const scaleBy = 1.05;

  const zoomInBy = (
    stage: Konva.Stage,
    direction: number,
    xStart: number | null,
    yStart: number | null
  ) => {
    var oldScale = stage.scaleX();

    const x = xStart || stage.width() / 2;
    const y = yStart || stage.height() / 2;
    var mousePointTo = {
      x: (x - stage.x()) / oldScale,
      y: (y - stage.y()) / oldScale,
    };

    var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    if (newScale > 100) {
      newScale = 100;
    } else if (newScale < 0.1) {
      newScale = 0.1;
    }
    dispatch(
      setScale({
        scale: newScale,
        x: x - mousePointTo.x * newScale,
        y: y - mousePointTo.y * newScale,
      })
    );
  };

  const updateRect = () => {
    if (!stageRef.current) {
      return;
    }

    if (!rectRef.current) {
      return;
    }
    rectRef.current.absolutePosition({ x: 0, y: 0 });

    // rectRef.current.scale(stageRef.current.scale());
  };

  const onWheel = (e: any) => {
    if (!stageRef.current) {
      return;
    }
    const stage = stageRef.current!;
    e.evt.preventDefault();

    var pointer = stage.getPointerPosition()!;
    let direction = e.evt.deltaY > 0 ? 1 : -1;
    if (e.evt.ctrlKey) {
      direction = -direction;
    }
    updateRect();
    zoomInBy(stage, direction, pointer.x, pointer.y);
  };

  const onClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!stageRef.current) {
      return;
    }
    const pos = stageRef.current.getRelativePointerPosition();
    if (contextMenuState.display) {
      dispatch(hidePlayerContextMenu());
    }
    switch (sceneState.props.mode) {
      case "defense-player":
        dispatch(
          addPlayer({
            side: PlayerSide.Deffense,
            x: pos.x,
            y: pos.y,
          })
        );
        break;
      case "offense-player":
        dispatch(
          addPlayer({
            side: PlayerSide.Offense,
            x: pos.x,
            y: pos.y,
          })
        );
        break;
      case "line":
        const group = e.target.findAncestor("Group");
        const metadata = group.getAttr("metadata") || {};
        const isPlayer = metadata.kind === "PLAYER";
        if (!isPlayer) {
          break;
        }

        const rectRel = e.target.getClientRect({
          relativeTo: stageRef.current! as any,
        });
        dispatch(
          startLine({
            id: e.target.id(),
            x: rectRel.x + rectRel.width / 2,
            y: rectRel.y + rectRel.height / 2,
          })
        );
        break;
      case "drawing-line":
        dispatch(
          addLinePoint({
            x: pos.x,
            y: pos.y,
          })
        );
        break;
      case "note":
        dispatch(addNote({ x: pos.x, y: pos.y }));
        break;
    }
  };

  const onMouseMove = (e: any) => {
    switch (sceneState.props.mode) {
      case "drawing-line":
      case "line":
        const pos = stageRef.current!.getRelativePointerPosition();
        dispatch(
          updateLine({
            x: pos.x,
            y: pos.y,
          })
        );
        break;
    }
  };
  useEffect(() => {
    hotkeys("esc", (e) => {
      if (stageRef.current) {
        dispatch(finishLine());
      }
      e.preventDefault();
    });

    return () => {
      hotkeys.unbind("esc");
    };
  });

  useEffect(() => {
    dispatch(setRendered(true));
  });

  const identifyPass = (scene: SceneState): Array<number> | null => {
    let from = undefined;
    let to = undefined;

    const currentFrame = scene.frames[stageFrame || scene.props.currentFrame];
    Object.values(currentFrame.objects).forEach((val) => {
      if (val.hasBall) {
        to = val.id;
      }

      if (val.receiveBallFrom) {
        from = val.receiveBallFrom;
      }
    });
    if (from && to) {
      return [
        currentFrame.objects[from].x,
        currentFrame.objects[from].y,
        currentFrame.objects[to].x,
        currentFrame.objects[to].y,
      ];
    }

    return [];
  };

  return (
    <>
      <Stage
        width={width}
        height={height}
        ref={stageCB}
        onWheel={onWheel}
        onClick={onClick}
        onMouseMove={onMouseMove}
        scaleX={sceneScale.scale}
        scaleY={sceneScale.scale}
        onDragMove={updateRect}
        x={sceneScale.x}
        y={sceneScale.y}
        draggable
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            ref={rectCB}
            width={width * 4}
            height={height * 4}
            fill="#FFF"
          ></Rect>
        </Layer>
        <Layer ref={layerCB}></Layer>
        <Layer ref={playersLayerRefCB}>
          {sceneState.line.points.length > 0 ? (
            <Arrow
              points={sceneState.line.points}
              stroke="red"
              strokeWidth={5}
              draggable
            ></Arrow>
          ) : (
            <></>
          )}

          {Object.keys(
            sceneState.frames[sceneState.props.currentFrame].objects
          ).map((key) => {
            const obj =
              sceneState.frames[sceneState.props.currentFrame].objects[key];
            const paintObj = obj;
            if (!(paintObj.x && paintObj.y)) {
              return <></>;
            }

            return (
              <Player
                key={obj.id}
                id={obj.id}
                x={paintObj.x}
                y={paintObj.y}
                metadata={obj.metadata}
                obj={obj}
              ></Player>
            );
          })}
          {Object.values(
            sceneState.frames[sceneState.props.currentFrame].notes! || {}
          ).map((note) => {
            return <TextItem key={note.id} note={note}></TextItem>;
          })}
          {(() => {
            const pass = identifyPass(sceneState);
            if (!pass) {
              return <></>;
            }
            return (
              <Arrow
                stroke="red"
                strokeWidth={5}
                points={pass}
                dash={[33, 10]}
              ></Arrow>
            );
          })()}
        </Layer>
      </Stage>
    </>
  );
};

export default PlayStage;
