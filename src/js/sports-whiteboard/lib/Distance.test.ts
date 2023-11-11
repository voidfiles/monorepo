import { pointsOverTimeOnPath, getDistance, pointOnLine } from "./Distance";

describe("Distance", () => {
  describe("getDistance", () => {
    it("computes distance between 2 points", () => {
      expect(getDistance({ x: 1, y: 1 }, { x: 3, y: 3 })).toEqual(2.83);
      expect(getDistance({ x: 1, y: 1 }, { x: 1, y: 2 })).toEqual(1);
      expect(getDistance({ x: 1, y: 1 }, { x: 2, y: 1 })).toEqual(1);
    });
  });

  describe("pointOnLine", () => {
    it("finds point on a line", () => {
      expect(pointOnLine({ x: 1, y: 1 }, { x: 3, y: 3 }, 1)).toEqual({
        x: 1.71,
        y: 1.71,
      });
      expect(pointOnLine({ x: 3, y: 3 }, { x: 0, y: 0 }, 1)).toEqual({
        x: 2.29,
        y: 2.29,
      });
    });
  });

  describe("pointsOverTimeOnPath", () => {
    it("finds points over time", () => {
      const points = pointsOverTimeOnPath([0, 0, 3, 3, 4, 5, 10, 10], 10);
      expect(points).toEqual([
        { x: 1.01, y: 1.01 },
        { x: 2.02, y: 2.02 },
        { x: 3.02, y: 3.04 },
        { x: 3.66, y: 4.32 },
        { x: 4.51, y: 5.43 },
        { x: 5.61, y: 6.34 },
        { x: 6.71, y: 7.26 },
        { x: 7.8, y: 8.17 },
        { x: 8.9, y: 9.09 },
      ]);
    });
  });
});
