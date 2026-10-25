import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  computeProgress,
  dashOffset,
  maxScrollFromMetrics,
  nextDirection,
  progressToY,
  shouldEmitPuffs,
  stepToward,
  tiltFromVelocity,
  yToProgress,
  type ScrollDirection,
} from "./scrollCarMath";

export const SCROLL_CAR_HEIGHT = 26;
export const SCROLL_CAR_TOP_GAP = 64;
export const SCROLL_CAR_BOTTOM_GAP = 16;
const DASH_PERIOD = 24;
const PUFF_THRESHOLD = 80;
const STIFFNESS = 16;

export type ScrollCarRefs = {
  root: HTMLDivElement | null;
  road: HTMLDivElement | null;
  dash: HTMLDivElement | null;
  car: HTMLDivElement | null;
  carInner: HTMLDivElement | null;
  puffs: HTMLDivElement | null;
  flag: HTMLDivElement | null;
};

export function applyHasScrollCarClass(active: boolean): void {
  document.documentElement.classList.toggle("has-scroll-car", active);
}

export function isScrollCarEnvironmentVisible(
  scrollHeight: number,
  innerHeight: number,
  minWidthMatches: boolean,
  scrollLocked: boolean,
): boolean {
  const maxScroll = maxScrollFromMetrics(scrollHeight, innerHeight);
  return maxScroll > 1 && minWidthMatches && !scrollLocked;
}

export function useScrollCar() {
  const refs = useRef<ScrollCarRefs>({
    root: null,
    road: null,
    dash: null,
    car: null,
    carInner: null,
    puffs: null,
    flag: null,
  });
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const rafRef = useRef(0);
  const rafFramesRef = useRef(0);
  const metricsRef = useRef({ scrollHeight: 0, innerHeight: 0, roadHeight: 0 });
  const motionRef = useRef({
    carY: 0,
    lastCarY: 0,
    velocity: 0,
    direction: "down" as ScrollDirection,
    lastScrollY: 0,
    dragging: false,
    dragMoved: false,
    pointerDownY: 0,
    reducedMotion: false,
    facingDown: true,
    wasMoving: false,
    tailPulseTimer: 0,
    lastFrame: 0,
  });

  function readReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function readMetrics() {
    metricsRef.current.scrollHeight = document.documentElement.scrollHeight;
    metricsRef.current.innerHeight = window.innerHeight;
    const road = refs.current.road;
    metricsRef.current.roadHeight = road?.getBoundingClientRect().height ?? 0;
  }

  function syncVisibility() {
    readMetrics();
    const next = isScrollCarEnvironmentVisible(
      metricsRef.current.scrollHeight,
      metricsRef.current.innerHeight,
      window.matchMedia("(min-width: 640px)").matches,
      document.documentElement.hasAttribute("data-scroll-locked"),
    );
    if (next !== visibleRef.current) {
      visibleRef.current = next;
      setVisible(next);
      applyHasScrollCarClass(next);
      if (refs.current.root) {
        refs.current.root.style.display = next ? "" : "none";
      }
    }
  }

  function setRoadOpacity(alpha: number) {
    if (refs.current.root) refs.current.root.style.opacity = String(alpha);
  }

  function stopLoop() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (refs.current.car) refs.current.car.style.willChange = "";
    if (refs.current.dash) refs.current.dash.style.willChange = "";
  }

  function paintFrame() {
    const { car, dash, carInner, puffs, flag } = refs.current;
    const motion = motionRef.current;
    const maxScroll = maxScrollFromMetrics(
      metricsRef.current.scrollHeight,
      metricsRef.current.innerHeight,
    );
    const progress = computeProgress(window.scrollY, maxScroll);
    const targetY = progressToY(
      progress,
      metricsRef.current.roadHeight,
      SCROLL_CAR_HEIGHT,
    );

    if (motion.reducedMotion) {
      motion.carY = targetY;
      motion.velocity = 0;
    } else {
      const dt = 1 / 60;
      motion.lastCarY = motion.carY;
      motion.carY = stepToward(motion.carY, targetY, STIFFNESS, dt);
      motion.velocity = (motion.carY - motion.lastCarY) / dt;
    }

    if (car) {
      car.style.transform = `translate3d(0, ${motion.carY}px, 0)`;
    }
    if (carInner) {
      const rotate = motion.facingDown ? 0 : 180;
      const tilt = motion.reducedMotion ? 0 : tiltFromVelocity(motion.velocity, 10);
      carInner.style.transform = `rotate(${rotate}deg) rotate(${tilt}deg)`;
    }
    if (dash) {
      const offset = dashOffset(progress, metricsRef.current.roadHeight, DASH_PERIOD);
      dash.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
    if (flag) {
      flag.style.opacity = progress >= 0.995 ? "1" : "0";
    }
    if (puffs) {
      const show =
        !motion.reducedMotion && shouldEmitPuffs(motion.velocity, PUFF_THRESHOLD);
      puffs.style.opacity = show ? "1" : "0";
    }

    const moving =
      motion.dragging ||
      Math.abs(motion.carY - targetY) > 0.08 ||
      Math.abs(motion.velocity) > 1;
    if (motion.wasMoving && !moving && !motion.reducedMotion && !motion.dragging) {
      carInner?.classList.add("scroll-car-tail-pulse");
      window.clearTimeout(motion.tailPulseTimer);
      motion.tailPulseTimer = window.setTimeout(() => {
        carInner?.classList.remove("scroll-car-tail-pulse");
      }, 400);
    }
    motion.wasMoving = moving;
  }

  function frame(now: number) {
    if (document.hidden) {
      stopLoop();
      return;
    }
    motionRef.current.lastFrame = now;
    if (!motionRef.current.reducedMotion) {
      rafFramesRef.current += 1;
    }
    paintFrame();

    const motion = motionRef.current;
    const maxScroll = maxScrollFromMetrics(
      metricsRef.current.scrollHeight,
      metricsRef.current.innerHeight,
    );
    const progress = computeProgress(window.scrollY, maxScroll);
    const targetY = progressToY(
      progress,
      metricsRef.current.roadHeight,
      SCROLL_CAR_HEIGHT,
    );
    const stillMoving =
      motion.dragging ||
      Math.abs(motion.carY - targetY) > 0.08 ||
      Math.abs(motion.velocity) > 1;

    if (stillMoving && visibleRef.current && !motion.reducedMotion) {
      rafRef.current = requestAnimationFrame(frame);
    } else {
      stopLoop();
    }
  }

  function wakeLoop() {
    paintFrame();
    if (!visibleRef.current || motionRef.current.reducedMotion) return;
    if (rafRef.current) return;
    if (refs.current.car) refs.current.car.style.willChange = "transform";
    if (refs.current.dash) refs.current.dash.style.willChange = "transform";
    rafRef.current = requestAnimationFrame(frame);
  }

  useEffect(() => {
    motionRef.current.reducedMotion = readReducedMotion();
    motionRef.current.lastScrollY = window.scrollY;
    syncVisibility();
    setRoadOpacity(0.45);
    paintFrame();

    let idleTimer = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - motionRef.current.lastScrollY;
      const dir = nextDirection(motionRef.current.direction, delta);
      if (dir) {
        motionRef.current.direction = dir;
        motionRef.current.facingDown = dir === "down";
      }
      motionRef.current.lastScrollY = y;

      window.clearTimeout(idleTimer);
      setRoadOpacity(1);
      idleTimer = window.setTimeout(() => setRoadOpacity(0.45), 900);
      wakeLoop();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncVisibility);

    const ro = new ResizeObserver(() => {
      syncVisibility();
      readMetrics();
      wakeLoop();
    });
    ro.observe(document.body);

    const mq = window.matchMedia("(min-width: 640px)");
    mq.addEventListener("change", syncVisibility);

    const lockObserver = new MutationObserver(syncVisibility);
    lockObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-scroll-locked"],
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopLoop();
      else syncVisibility();
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncVisibility);
      mq.removeEventListener("change", syncVisibility);
      lockObserver.disconnect();
      ro.disconnect();
      window.clearTimeout(idleTimer);
      window.clearTimeout(motionRef.current.tailPulseTimer);
      stopLoop();
      applyHasScrollCarClass(false);
    };
  }, []);

  useEffect(() => {
    const road = refs.current.road;
    if (!road) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      motionRef.current.dragging = true;
      motionRef.current.dragMoved = false;
      motionRef.current.pointerDownY = event.clientY;
      road.setPointerCapture(event.pointerId);
      setRoadOpacity(1);
      wakeLoop();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!motionRef.current.dragging) return;
      if (Math.abs(event.clientY - motionRef.current.pointerDownY) > 4) {
        motionRef.current.dragMoved = true;
      }
      readMetrics();
      const rect = road.getBoundingClientRect();
      const progress = yToProgress(
        event.clientY,
        rect.top,
        rect.height,
        SCROLL_CAR_HEIGHT,
      );
      const maxScroll = maxScrollFromMetrics(
        metricsRef.current.scrollHeight,
        metricsRef.current.innerHeight,
      );
      window.scrollTo({ top: progress * maxScroll, behavior: "auto" });
    };
    const endDrag = (event: PointerEvent) => {
      if (!motionRef.current.dragging) return;
      const wasClick = !motionRef.current.dragMoved;
      motionRef.current.dragging = false;
      try {
        road.releasePointerCapture(event.pointerId);
      } catch {
        /* lost capture */
      }
      if (wasClick) {
        readMetrics();
        const rect = road.getBoundingClientRect();
        const progress = yToProgress(
          event.clientY,
          rect.top,
          rect.height,
          SCROLL_CAR_HEIGHT,
        );
        const maxScroll = maxScrollFromMetrics(
          metricsRef.current.scrollHeight,
          metricsRef.current.innerHeight,
        );
        const behavior = readReducedMotion() ? "auto" : "smooth";
        window.scrollTo({ top: progress * maxScroll, behavior });
      }
      wakeLoop();
    };

    road.addEventListener("pointerdown", onPointerDown);
    road.addEventListener("pointermove", onPointerMove);
    road.addEventListener("pointerup", endDrag);
    road.addEventListener("pointercancel", endDrag);
    road.addEventListener("lostpointercapture", endDrag);

    return () => {
      road.removeEventListener("pointerdown", onPointerDown);
      road.removeEventListener("pointermove", onPointerMove);
      road.removeEventListener("pointerup", endDrag);
      road.removeEventListener("pointercancel", endDrag);
      road.removeEventListener("lostpointercapture", endDrag);
    };
  }, [visible]);

  useEffect(() => {
    motionRef.current.carY = 0;
    motionRef.current.lastScrollY = window.scrollY;
    readMetrics();
    wakeLoop();
  }, [location.pathname]);

  return { refs, visible, rafFramesRef };
}
