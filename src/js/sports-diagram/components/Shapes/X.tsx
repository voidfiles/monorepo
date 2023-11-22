import React from "react";
import {StageItem} from "../StageItem";

export interface XProps extends StageItem {
    kind: "x";
    x: number;
    y: number;
    active?: boolean;
}

const XSIZE = 25;
const HALF_XSIZE = XSIZE / 2;
const X_DEFAULTS = {
    // height: 100,
    // width: 100,
    stoke: "black",
    className: "cursor-grab",
    strokeWidth: 4,
    mode: "x",
    active: false,
}

export default function X(props: React.PropsWithChildren<XProps>) {
    const {x, y, id, active, stroke = "black", ...iprops} = {...X_DEFAULTS, ...props}
    const transform = `translate(${x}, ${y})`
    const activeStroke = active ? "red" : "black";
    return (<g 
        transform={transform}
        key={id}
        id={id}
        stroke={activeStroke}
        {...iprops}
        >
            <rect
                key={1}
                id={id}
                width={XSIZE + 10}
                height={XSIZE + 10}
                x={-HALF_XSIZE-5}
                y={-HALF_XSIZE-5}
                fillOpacity={0}
                strokeOpacity={0}
            />
            <line
                key={2}
                id={id}
                x1={-HALF_XSIZE}
                y1={-HALF_XSIZE}
                x2={HALF_XSIZE}
                y2={HALF_XSIZE}
            />
            <line
                key={3}
                id={id}
                x1={HALF_XSIZE}
                y1={-HALF_XSIZE}
                x2={-HALF_XSIZE}
                y2={HALF_XSIZE}
            />
        </g>
    )
}
