import Konva from "konva";
import { useImmerReducer } from "use-immer";

export type ContextMenuState = {
  id: string;
  display: boolean;
  x: string;
  y: string;
  canvasReady: boolean;
  stage?: Konva.Stage;
  rendered: boolean;
};

type Display = {
  type: "DISPLAY";
  id: string;
  x: string;
  y: string;
};

type Hide = {
  type: "HIDE";
};

type CanvasReady = {
  type: "CANVAS_READY";
};

type CanvasNotReady = {
  type: "CANVAS_NOT_READY";
};

type GotStage = {
  type: "GOT_STAGE";
  stage: Konva.Stage;
};

type ToggleRender = {
  type: "TOGGLE_RENDER";
  rendered: boolean;
};

type ResetStage = {
  type: "RESET_STAGE";
};

export type ContextMenuAction =
  | Display
  | Hide
  | CanvasReady
  | CanvasNotReady
  | GotStage
  | ToggleRender
  | ResetStage;

function reducer(draft: ContextMenuState, action: ContextMenuAction) {
  switch (action.type) {
    case "DISPLAY":
      draft.id = action.id;
      draft.display = true;
      draft.x = action.x;
      draft.y = action.y;
      return;
    case "HIDE":
      draft.display = false;
      return;
    case "CANVAS_READY":
      draft.canvasReady = true;
      return;
    case "CANVAS_NOT_READY":
      draft.canvasReady = false;
      return;
    case "GOT_STAGE":
      draft.stage = action.stage;
      return;
    case "TOGGLE_RENDER":
      draft.rendered = action.rendered;
      return;
    case "RESET_STAGE":
      draft.canvasReady = false;
      draft.stage = undefined;
      draft.rendered = false;
      return;
  }
}

const useContextMenuState = () => {
  return useImmerReducer(reducer, {
    id: "",
    display: false,
    x: "",
    y: "",
    canvasReady: false,
    stage: undefined,
    rendered: false,
  });
};

export default useContextMenuState;
