import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { moveFrame } from "../lib/state/features/sceneSlice";
import type { RootState } from "../lib/state/store";

import OffscreenPlayInterface from "./OffscreenPlayInterface";
import Konva from "konva";

type PlayInterfaceInput = {
  onData: (dataURLS: Array<string>, blobs: Array<Blob>) => void;
};

const Snapshotter: React.FC<PlayInterfaceInput> = ({ onData }) => {
  const sceneState = useSelector((state: RootState) => state.scene);
  const navigationState = useSelector((state: RootState) => state.navigation);

  const [stage, setStage] = useState<Konva.Stage>();
  const [dataUrls, setDataUrls] = useState([] as Array<string>);
  const [blobs, setBlobs] = useState([] as Array<Blob>);

  const dispatch = useDispatch();
  const stageRef = useCallback((stage: Konva.Stage) => {
    return setStage(stage);
  }, []);

  useEffect(() => {
    if (!stage) {
      console.log("stage not ready");
      return;
    }

    if (!navigationState.rendered || !navigationState.canvasReady) {
      console.log("rendering not ready");
      return;
    }
    const indexOfCurrentFrame = sceneState.frameOrder.indexOf(
      sceneState.props.currentFrame
    );
    const numFrames = sceneState.frameOrder.length;
    stage.draw();
    const url = stage.toDataURL({
      pixelRatio: 2, // or other value you need
    });
    dataUrls.push(url);
    setDataUrls(dataUrls);
    stage
      .toBlob({
        pixelRatio: 2, // or other value you need
      })
      .then((blob: Blob) => {
        blobs.push(blob);
        setBlobs(blobs);
        dispatch(moveFrame(1));
        if (indexOfCurrentFrame === numFrames - 1) {
          onData(dataUrls, blobs);
        } else {
          dispatch(moveFrame(1));
        }
      });
  }, [
    stage,
    navigationState.rendered,
    navigationState.canvasReady,
    sceneState.props.currentFrame,
  ]);
  return <OffscreenPlayInterface onStage={stageRef}></OffscreenPlayInterface>;
};

export default Snapshotter;
