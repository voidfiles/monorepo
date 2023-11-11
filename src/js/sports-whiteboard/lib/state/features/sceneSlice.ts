import { v4 as uuidv4 } from "uuid";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ValidFields } from "../../Fields";

export enum PlayerSide {
  Offense = "OFFENSE",
  Deffense = "DEFENSE",
}

export type PlayerObjectMetadata = {
  kind: "PLAYER";
};

export type PlayerObject = {
  type: "PLAYER_OBJECT";
  id: string;
  side: PlayerSide;
  x: number;
  y: number;
  movement: Movement | null;
  metadata: PlayerObjectMetadata;
  hasBall: boolean;
  receiveBallFrom?: string;
};

export type Note = {
  type: "NOTE";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  text: string;
};

export type Movement = {
  type: "PLAYER_MOVEMENT";
  id: string;
  points: Array<number>;
};

export type PlacedObject = PlayerObject;
export type FrameObjects = {
  [id: string]: PlacedObject;
};
export type FrameNotes = {
  [id: string]: Note;
};
export interface Frame {
  readonly id: string;
  objects: FrameObjects;
  notes: FrameNotes;
}

interface InProgressLine {
  id: string;
  readonly points: Array<number>;
}

type Frames = {
  [id: string]: Frame;
};

type Props = {
  [name: string]: string;
};

export interface Stage {
  scale: number;
  x?: number;
  y?: number;
}

export interface SceneState {
  frames: Frames;
  frameOrder: Array<string>;
  props: Props;
  line: InProgressLine;
  stage: Stage;
  field: ValidFields;
}

export const freshScene = () => {
  const firstFrameID = uuidv4();
  const frames: Frames = {};
  frames[firstFrameID] = {
    id: firstFrameID,
    objects: {},
    notes: {},
  };
  const scene: SceneState = {
    frames: frames,
    frameOrder: [firstFrameID],
    props: {
      id: "",
      currentFrame: firstFrameID,
      mode: "move",
      playName: "Unamed Play",
      firstFrame: "true",
      lastFrame: "false",
    },
    line: {
      id: "",
      points: [],
    },
    stage: {
      scale: 1,
    },
    field: ValidFields.FINA_HALF_PRE_2022,
  };

  return scene;
};

const setFrameState = (draft: SceneState, frameID: string) => {
  const indexOf = draft.frameOrder.indexOf(frameID);
  if (indexOf == draft.frameOrder.length - 1) {
    draft.props.firstFrame = "false";
    draft.props.lastFrame = "true";
  }

  if (indexOf == 0) {
    draft.props.firstFrame = "true";
    draft.props.lastFrame = "false";
  }

  if (draft.frameOrder.length == 1) {
    draft.props.firstFrame = "true";
    draft.props.lastFrame = "true";
  }
};

const initialState: SceneState = freshScene();

export const sceneSlice = createSlice({
  name: "scene",
  initialState,
  reducers: {
    setStageScale: (state, action: PayloadAction<Stage>) => {
      state.stage.scale = action.payload.scale;
      state.stage.x = action.payload.x;
      state.stage.y = action.payload.y;
    },
    addPlayer: (
      state,
      action: PayloadAction<{
        side: PlayerSide;
        x: number;
        y: number;
      }>
    ) => {
      const playerID = uuidv4();
      state.frames[state.props.currentFrame].objects[playerID] = {
        type: "PLAYER_OBJECT",
        id: playerID,
        side: action.payload.side,
        x: action.payload.x,
        y: action.payload.y,
        movement: null,
        hasBall: false,
        metadata: {
          kind: "PLAYER",
        },
      };
      state.props.mode = "move";
    },
    addNote: (
      state,
      action: PayloadAction<{
        x: number;
        y: number;
      }>
    ) => {
      const noteID = uuidv4();
      state.frames[state.props.currentFrame].notes[noteID] = {
        type: "NOTE",
        id: noteID,
        x: action.payload.x,
        y: action.payload.y,
        width: 100,
        height: 100,
        scaleX: 1,
        scaleY: 1,
        text: "",
      };
      state.props.mode = "move";
    },
    removePlayer: (state, action: PayloadAction<string>) => {
      delete state.frames[state.props.currentFrame].objects[action.payload];
      state.props.mode = "move";
    },
    changeMode: (state, action: PayloadAction<string>) => {
      state.props.mode = action.payload;
    },
    addFrame: (state) => {
      const frameID = uuidv4();
      const objs = state.frames[state.props.currentFrame].objects;
      const frame = {
        id: frameID,
        objects: {
          ...Object.fromEntries(
            Object.keys(objs).map((key) => {
              const val = { ...objs[key] };

              if (val.movement) {
                const ps: Array<number> = val.movement.points
                  .map((e) => {
                    return e;
                  })
                  .slice(-2);
                val.x = ps[0] - 20;
                val.y = ps[1] - 20;
                val.movement = null;
              }
              return [key, val];
            })
          ),
        },
        notes: {},
      };
      state.frames[frameID] = frame;
      state.frameOrder.push(frameID);
      state.props.currentFrame = frameID;
      state.props.firstFrame = "false";
      state.props.lastFrame = "true";
    },
    setFrame: (state, action: PayloadAction<string>) => {
      state.props.currentFrame = action.payload;
      setFrameState(state, action.payload);
    },
    updatePlayName: (state, action: PayloadAction<string>) => {
      state.props.playName = action.payload;
    },
    startLine: (
      state,
      action: PayloadAction<{ id: string; x: number; y: number }>
    ) => {
      state.line.id = action.payload.id;
      state.line.points.push(
        ...[
          action.payload.x,
          action.payload.y,
          action.payload.x,
          action.payload.y,
        ]
      );
      state.props.mode = "drawing-line";
    },
    updateLine: (state, action: PayloadAction<{ x: number; y: number }>) => {
      if (state.line.points.length == 0) {
        return;
      }
      state.line.points.splice(-2, 2, ...[action.payload.x, action.payload.y]);
    },
    addLinePoint: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.line.points.splice(-2, 0, ...[action.payload.x, action.payload.y]);
    },
    finishLine: (state) => {
      if (state.line.points.length == 0) {
        return;
      }
      state.line.points.splice(-2, 2, ...[]);
      const lineid = uuidv4();
      state.frames[state.props.currentFrame].objects[state.line.id].movement = {
        type: "PLAYER_MOVEMENT",
        id: lineid,
        points: [...state.line.points],
      };
      state.line.points.splice(0, state.line.points.length);
      state.props.mode = "move";
    },
    movePlayer: (
      state,
      action: PayloadAction<{
        id: string;
        x: number;
        y: number;
        points: Array<number>;
      }>
    ) => {
      const p =
        state.frames[state.props.currentFrame].objects[action.payload.id];
      if (p.movement) {
        p.x = action.payload.x;
        p.y = action.payload.y;
        action.payload.points.forEach((x, i) => {
          p.movement!.points[i] = x;
        });
      } else {
        p.x = action.payload.x;
        p.y = action.payload.y;
      }
    },
    moveNote: (
      state,
      action: PayloadAction<{
        id: string;
        x: number;
        y: number;
      }>
    ) => {
      const n = state.frames[state.props.currentFrame].notes[action.payload.id];
      n.x = action.payload.x;
      n.y = action.payload.y;
    },
    resizeNote: (
      state,
      action: PayloadAction<{
        id: string;
        width: number;
        height: number;
        x: number;
        y: number;
      }>
    ) => {
      const n = state.frames[state.props.currentFrame].notes[action.payload.id];
      n.width = action.payload.width;
      n.height = action.payload.height;
      n.x = action.payload.x;
      n.y = action.payload.y;
    },
    setNoteText: (
      state,
      action: PayloadAction<{
        id: string;
        text: string;
      }>
    ) => {
      const n = state.frames[state.props.currentFrame].notes[action.payload.id];
      n.text = action.payload.text;
    },
    moveFrame: (state, action: PayloadAction<number>) => {
      const indexOfCurrentFrame = state.frameOrder.indexOf(
        state.props.currentFrame
      );
      const nextFrameIndex = Math.max(indexOfCurrentFrame + action.payload, 0);
      if (state.frameOrder[nextFrameIndex]) {
        state.props.currentFrame = state.frameOrder[nextFrameIndex];
      }
      setFrameState(state, state.frameOrder[nextFrameIndex]);
      console.log("moving", action.payload, "nextFrameID", indexOfCurrentFrame);
    },
    deleteFrame: (state, action: PayloadAction<string | undefined>) => {
      console.log("Delete frame has not been implmented", action.payload);
      throw "delete frame has not been implemented";
    },
    resetScene: (state) => {
      const scene = freshScene();
      scene.stage = {
        ...scene.stage,
        ...state.stage,
      };

      return scene;
    },
    updateSceneId: (
      state,
      action: PayloadAction<{ id: string; parent: string }>
    ) => {
      state.props.id = action.payload.id;
      if (action.payload.parent) {
        state.props.parent = action.payload.parent;
      }
    },
    markPlayerWithBall: (state, action: PayloadAction<string>) => {
      let playerIDHadBall = undefined;
      Object.values(state.frames[state.props.currentFrame].objects).forEach(
        (obj) => {
          if (obj.hasBall) {
            playerIDHadBall = obj.id;
          }
          obj.hasBall = false;
          obj.receiveBallFrom = undefined;
        }
      );
      console.log("payload", action);
      state.frames[state.props.currentFrame].objects[action.payload].hasBall =
        true;
      state.frames[state.props.currentFrame].objects[
        action.payload
      ].receiveBallFrom = playerIDHadBall;
    },
    setField: (state, action: PayloadAction<ValidFields>) => {
      state.field = action.payload;
    },
    loadScene: (_state, action: PayloadAction<SceneState>) => {
      return action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setStageScale,
  addPlayer,
  removePlayer,
  changeMode,
  addFrame,
  setFrame,
  updatePlayName,
  startLine,
  updateLine,
  addLinePoint,
  finishLine,
  movePlayer,
  moveFrame,
  deleteFrame,
  resetScene,
  updateSceneId,
  markPlayerWithBall,
  setField,
  loadScene,
  addNote,
  moveNote,
  resizeNote,
  setNoteText,
} = sceneSlice.actions;

export default sceneSlice.reducer;
