import React from "react";
import {StageItem} from "../StageItem";

export interface LineProps extends StageItem {
    kind: "line";
    x: number;
    y: number;
    points: Array<[number, number]>;
    active?: boolean;
}

const DEFAULTS = {
    points: [],
    mode: 'line',
    strokeWidth: 4,
    stroke: 'black',
    active: false,
}

export default function Line(props: React.PropsWithChildren<LineProps>) {
    let {points, x, y, active, ...iprops} = {...DEFAULTS, ...props}
    let joinedPoints = [[x, y], ...points].map((p) => p.join(",")).join(" ")

    return (<polyline
        key={props.id}
        points={joinedPoints}
        {...iprops}
    />);
}
