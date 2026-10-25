import { describe, expect, it } from "vitest";
import {
  computeProgress,
  dashOffset,
  nextDirection,
  progressToY,
  shouldEmitPuffs,
  stepToward,
  tiltFromVelocity,
  yToProgress,
} from "./scrollCarMath";

describe("scrollCarMath", () => {
  it("computeProgress clamps and handles zero range", () => {
    expect(computeProgress(50, 100)).toBe(0.5);
    expect(computeProgress(0, 0)).toBe(0);
    expect(computeProgress(200, 100)).toBe(1);
    expect(computeProgress(-10, 100)).toBe(0);
  });

  it("maps progress to car Y and back from pointer", () => {
    expect(progressToY(0, 400, 26)).toBe(0);
    expect(progressToY(1, 400, 26)).toBe(374);
    expect(yToProgress(0, 100, 400, 26)).toBe(0);
    expect(yToProgress(100 + 374 + 13, 100, 400, 26)).toBeCloseTo(1, 5);
    expect(yToProgress(50, 100, 400, 26)).toBe(0);
    expect(yToProgress(9999, 100, 400, 26)).toBe(1);
  });

  it("nextDirection keeps previous direction for tiny deltas", () => {
    expect(nextDirection("down", 0.2)).toBe("down");
    expect(nextDirection(null, 2)).toBe("down");
    expect(nextDirection("down", -3)).toBe("up");
  });

  it("tiltFromVelocity clamps", () => {
    expect(tiltFromVelocity(0, 10)).toBe(0);
    expect(tiltFromVelocity(100, 10)).toBe(10);
    expect(tiltFromVelocity(-100, 10)).toBe(-10);
  });

  it("stepToward settles on target", () => {
    let value = 0;
    for (let i = 0; i < 120; i += 1) {
      value = stepToward(value, 100, 8, 1 / 60);
    }
    expect(value).toBe(100);
  });

  it("shouldEmitPuffs respects threshold", () => {
    expect(shouldEmitPuffs(0.4, 0.5)).toBe(false);
    expect(shouldEmitPuffs(0.6, 0.5)).toBe(true);
  });

  it("dashOffset wraps by period", () => {
    expect(dashOffset(0.5, 200, 40)).toBe(20);
    expect(dashOffset(1, 200, 40)).toBe(0);
  });
});
