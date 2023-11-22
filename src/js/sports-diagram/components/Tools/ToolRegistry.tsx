import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import Tool, { StageEvent } from "./Tool";
import { StageState, changeMode } from "../../lib/store/features/stage/stageSlice";
import { Point } from "../StageTypes";

interface ToolIndex {
    [index: string]: Tool;
}

type PointResolver = (point: Point) => Point;

class ToolRegister {
    mode: string = "";
    tools: ToolIndex = {};
    dispatch: Dispatch;
    pointResolver: PointResolver;
    ready: boolean = false;
    stage: StageState;

    register(tool: Tool) {
        this.tools[tool.mode] = tool
        const t = this;
        tool.onRegister((action: AnyAction) => {
            return t.dispatcher(action);
        }, this.setMode);
    }

    dispatcher(action: AnyAction) {
        this.dispatch(action);
    }

    setDispatch(dispatch: Dispatch) {
        this.dispatch = dispatch;
    }

    setStageState(state: StageState) {
        this.stage = state;
    }

    updateModeFromState(mode: string) {
        if(!this.tools[mode]) {
            throw(mode + " not in the available modes");
        }

        this.mode = mode;
    }

    setMode = (mode: string, event?: StageEvent, fromMode?: string) => {
        console.table({
            msg: "setMode",
            mode: mode,
            fromMode: fromMode,
        })
        this.dispatch ? this.dispatch(changeMode(mode)) : null;

        if(!this.tools[mode]) {
            throw(mode + " not in the available modes");
        }

        this.mode = mode

        if (event) {
            this.executeEvent(event);
        }

        if (fromMode) {
            this.setMode(fromMode);
        }
    }

    setPointResolver(svg: SVGSVGElement) {
        this.pointResolver = (point: Point) => {
            const domPoint = svg.createSVGPoint();
            domPoint.x = point.x;
            domPoint.y = point.y;
            const m = svg.getScreenCTM()!
            var cursorpt =  domPoint.matrixTransform(m.inverse());
    
            const p: Point = {
                x: cursorpt.x,
                y: cursorpt.y,
            }
    
            return p
        };
        this.ready = true;
    }

    resolveReactEventToStageEvent(event: React.MouseEvent, method: string): StageEvent {
        const p = this.pointResolver({
            x: event.clientX,
            y: event.clientY,
        })

        const e: StageEvent = {
            target: event.target['id'],
            method: method,
            x: p.x,
            y: p.y,
            clientX: event.clientX,
            clientY: event.clientY,
            state: this.stage,
        }

        return e;
    }

    executeEvent(e: StageEvent): void {
        return this.tools[this.mode][e.method](e);
    }

    buildEventHandler(method: string): (event: React.MouseEvent) => void {
        const t = this;
        return (event: React.MouseEvent) => {
            if (!this.ready) {
                return;
            }
            const e = t.resolveReactEventToStageEvent(event, method);
            // console.count(method)
            if (method != 'onMouseMove') {
                console.log(`dispatching ${e.target} ${t.mode} ${method}`, e)
            }
            return t.executeEvent(e);
        }
    }
}

export default function BuildToolRegistry(): ToolRegister {
    return new ToolRegister();
}
