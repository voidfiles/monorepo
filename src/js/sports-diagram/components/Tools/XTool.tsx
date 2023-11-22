import { StageItemForCreate } from "../../lib/store/features/stage/stageSlice";
import { PlayerTool } from "./Player";
import { StageEvent } from "./Tool";


export class XTool extends PlayerTool {
    mode = "x";

    childObject = (e: StageEvent): StageItemForCreate => {
        return {
            kind: "x",
            x: e.x,
            y: e.y,
        }
    };
}
