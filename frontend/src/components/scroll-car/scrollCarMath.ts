export type ScrollDirection = "down" | "up";

export const DIRECTION_DELTA_EPSILON = 0.5;

export function computeProgress(scrollY: number, maxScroll: number): number {
  if (maxScroll <= 0) return 0;
  return Math.min(1, Math.max(0, scrollY / maxScroll));
}

export function progressToY(
  progress: number,
  roadHeight: number,
  carHeight: number,
): number {
  const travel = Math.max(0, roadHeight - carHeight);
  const clamped = Math.min(1, Math.max(0, progress));
  return clamped * travel;
}

export function yToProgress(
  pointerY: number,
  roadTop: number,
  roadHeight: number,
  carHeight: number,
): number {
  const travel = Math.max(0, roadHeight - carHeight);
  if (travel <= 0) return 0;
  const localY = pointerY - roadTop - carHeight / 2;
  return Math.min(1, Math.max(0, localY / travel));
}

export function nextDirection(
  previous: ScrollDirection | null,
  delta: number,
  epsilon = DIRECTION_DELTA_EPSILON,
): ScrollDirection | null {
  if (Math.abs(delta) < epsilon) return previous;
  return delta > 0 ? "down" : "up";
}

export function tiltFromVelocity(velocity: number, maxDeg: number): number {
  const raw = velocity * 0.12;
  return Math.max(-maxDeg, Math.min(maxDeg, raw));
}

export function stepToward(
  current: number,
  target: number,
  stiffness: number,
  dt: number,
  epsilon = 0.05,
): number {
  if (Math.abs(target - current) <= epsilon) return target;
  const factor = Math.min(1, stiffness * dt);
  const next = current + (target - current) * factor;
  if (Math.abs(target - next) <= epsilon) return target;
  return next;
}

export function shouldEmitPuffs(velocity: number, threshold: number): boolean {
  return Math.abs(velocity) > threshold;
}

export function dashOffset(progress: number, roadLength: number, period: number): number {
  if (period <= 0) return 0;
  return (progress * roadLength) % period;
}

export function maxScrollFromMetrics(scrollHeight: number, innerHeight: number): number {
  return Math.max(0, scrollHeight - innerHeight);
}

export function scrollYFromProgress(progress: number, maxScroll: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  return clamped * maxScroll;
}
