import { consoleSandbox } from "@sentry/utils";

function round(num: number, percision: number = 2): number {
  const multi = Math.pow(10, percision);

  return Math.round(num * multi) / multi;
}

export function getDistance(pointA: Point, pointB: Point): number {
  let y = pointB.x - pointA.x;
  let x = pointB.y - pointA.y;

  return round(Math.sqrt(x * x + y * y));
}

export function pointOnLine(
  pointA: Point,
  pointB: Point,
  distance: number
): Point {
  const t = distance / getDistance(pointA, pointB);
  const x = round((1 - t) * pointA.x + t * pointB.x);
  const y = round((1 - t) * pointA.y + t * pointB.y);

  return {
    x: x,
    y: y,
  };
}

function pairWise(path: Path): Array<Line> {
  const points: Array<Point> = [];
  for (let index = 0; index < path.length; index += 2) {
    const x = path[index];
    const y = path[index + 1];

    points.push({ x, y });
  }
  const resultPath: Array<Line> = [];
  for (let index = 0; index < points.length; index++) {
    const a = points[index];
    const b = points[index + 1];

    if (!b) {
      continue;
    }

    resultPath.push({ a, b });
  }

  return resultPath;
}

export function totalDistanceOfPath(path: Path): number {
  return pairWise(path)
    .map((line) => {
      return getDistance(line.a, line.b);
    })
    .reduce((a, b) => {
      return a + b;
    });
}

export function pointOnSeriesOfLines(path: Path, distance: number): Point {
  const totalDistance = totalDistanceOfPath(path);
  if (distance > totalDistance) {
    throw "Invalid distance";
  }
  let currentDistance = 0;
  const lineByDistance = pairWise(path).map((line) => {
    const previousDistance = currentDistance;
    currentDistance += getDistance(line.a, line.b);
    return { totalDistance: currentDistance, previousDistance, line };
  });
  const val = lineByDistance.find(({ totalDistance }) => {
    return distance <= totalDistance;
  });

  if (!val) {
    throw "Invalid distance";
  }

  const delta = distance - val.previousDistance;

  return pointOnLine(val.line.a, val.line.b, delta);
}

export function pointsOverTimeOnPath(path: Path, frames: number): Array<Point> {
  const totalDistance = totalDistanceOfPath(path);
  const increments = totalDistance / frames;
  const points: Array<Point> = [];
  for (let index = 1; index < frames; index++) {
    if (totalDistance === 0) {
      points.push({
        x: path[0],
        y: path[1],
      });
      continue;
    }
    const distance = increments * index;
    const point = pointOnSeriesOfLines(path, distance);

    points.push(point);
  }

  points.push({
    x: path[2],
    y: path[3],
  });

  return points;
}

export type Path = Array<number>;

export type Line = {
  a: Point;
  b: Point;
};

export type Point = {
  x: number;
  y: number;
};
