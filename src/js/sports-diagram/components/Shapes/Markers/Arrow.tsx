import React from "react";


export default function Arrow() {
    return (<marker
        id="arrow"
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" />
    </marker>);
}
