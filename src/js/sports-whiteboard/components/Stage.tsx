// @refresh reset
import { useCallback, useEffect, useRef, useState } from "react";
import { Stage as KonvaStage, Layer, Arrow, Rect } from "react-konva";
import Konva from "konva";

import Player from "./Player";
import { useSelector } from "react-redux";
import { SceneScale } from "../lib/state/features/scene/scaleSlice";
import type { RootState } from "../lib/state/store";
import { SceneState } from "../lib/state/features/sceneSlice";
import { fieldConfigForKey } from "../lib/Fields";
import TextItem from "./TextItem";
type PlayStageInput = {
  width?: number;
  height?: number;
  stageFrame?: string;
  sceneScale?: SceneScale;
  onStage?: (node: Konva.Stage) => void;
};

const Stage: React.FC<PlayStageInput> = ({
  onStage,
  stageFrame,
  sceneScale = {
    scale: 1,
  },
  width = window.innerWidth,
  height = window.innerHeight,
}) => {
  const sceneState = useSelector((state: RootState) => state.scene);
  const stageRef = useRef<Konva.Stage>();
  const rectRef = useRef<Konva.Rect>();
  const [intSceneScale, setScale] = useState(sceneScale);
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
      setScale({ scale: scaleValue });
      // dispatch(canvasReady());
    });
  }, [layer, sceneState.field]);

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
      <KonvaStage
        width={width}
        height={height}
        ref={stageCB}
        onWheel={() => {}}
        onClick={() => {}}
        onMouseMove={() => {}}
        scaleX={intSceneScale.scale}
        scaleY={intSceneScale.scale}
        onDragMove={() => {}}
        x={intSceneScale.x}
        y={intSceneScale.y}
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
            sceneState.frames[stageFrame || sceneState.props.currentFrame]
              .objects
          ).map((key) => {
            const obj =
              sceneState.frames[stageFrame || sceneState.props.currentFrame]
                .objects[key];
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
            sceneState.frames[stageFrame || sceneState.props.currentFrame]
              .notes! || {}
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
      </KonvaStage>
    </>
  );
};

export default Stage;
