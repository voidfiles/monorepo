import Tool, { StageEvent } from "./Tool";
import { addChild, updatePosition } from "../../lib/store/features/stage/stageSlice";

export class LineTool extends Tool {
    mode = "line";

    onClick (event: StageEvent): void {
        this.dispatch(addChild({
            kind: "line",
            x: event.x,
            y: event.y,
            points: [],
        }));
    }

    onMouseMove (event: StageEvent): void {
        if (event.state.dragging) {
            this.setMode('hand', event, 'line');
        }
    }
}
