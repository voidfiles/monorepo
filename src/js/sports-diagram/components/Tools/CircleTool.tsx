import Tool, {StageEvent } from "./Tool";
import { StageItemForCreate } from "../../lib/store/features/stage/stageSlice";
import { PlayerTool } from "./Player";


export class CircleTool extends PlayerTool {
    mode = "circle";

    childObject = (e: StageEvent): StageItemForCreate => {
        return {
            kind: "circle",
            x: e.x,
            y: e.y,
        }
    };
}
