export interface Point {
    x: number;
    y: number;
}

export type PointResolve = (point: Point) => Point