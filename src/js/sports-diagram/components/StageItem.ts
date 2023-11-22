import { PointResolve } from "./StageTypes"

export interface StageItem {
    id: string
    onClick?: (event: React.MouseEvent<Element, MouseEvent>) => void;
    onMouseMove?: (event: React.MouseEvent<Element, MouseEvent>) => void;
    onMouseEnter?: (event: React.MouseEvent<Element, MouseEvent>) => void;
    onMouseLeave?: (event: React.MouseEvent<Element, MouseEvent>) => void;
    onMouseDown?: (event: React.MouseEvent<Element, MouseEvent>) => void;
    onMouseUp?: (event: React.MouseEvent<Element, MouseEvent>) => void;
}