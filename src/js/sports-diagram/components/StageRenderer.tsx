import React, { useRef } from "react";
import type { RootState } from '../lib/store/store'
import { useSelector, useDispatch } from 'react-redux'
import { addChild, CirclePropsCreate } from '../lib/store/features/stage/stageSlice'
import Circle from "./Shapes/Circle";
import X from "./Shapes/X";


const SVG_DEFAULTS = {
    xmlns: "http://www.w3.org/2000/svg",
    height: "100%",
    width: "100%",
}

export default function Stage(props: React.PropsWithChildren<StageProps>) {
    const {onClick, ...iprops} = props;
    const svge  = useRef<SVGSVGElement | null>(null);
    const stage = useSelector((state: RootState) => state.stage)
    // const dispatch = useDispatch()
    const handleClick: React.MouseEventHandler<SVGSVGElement> = (event) => {
        if (svge.current === null) {
            return;
        }

        if (stage.dragging) {
            return;
        }

        let pt = svge.current.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        let svg = svge.current!
        let m = svg!.getScreenCTM()!
        var cursorpt =  pt.matrixTransform(m.inverse());
        console.log("(" + cursorpt.x + ", " + cursorpt.y + ")", event.clientX, event.clientY);

        props.onClick({
            x: cursorpt.x,
            y: cursorpt.y,
            clientX: event.clientX,
            clientY: event.clientY,
        })
    }
    return <svg onClick={handleClick} ref={svge} {...{...SVG_DEFAULTS, ...iprops}}>
        {stage.children.map((c) => {
            switch(c.kind) {
                case "circle":
                    return (<Circle {...c}></Circle>)
                case "x":
                    return (<X {...c}></X>)
                default:
                    const _exhaustiveCheck: never = c;
                    return _exhaustiveCheck;
            }
        })}
    </svg>;
}
