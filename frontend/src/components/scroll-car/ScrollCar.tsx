import { ScrollCarDoodle, FinishFlagDoodle } from "./ScrollCarDoodle";
import {
  SCROLL_CAR_BOTTOM_GAP,
  SCROLL_CAR_TOP_GAP,
  useScrollCar,
} from "./useScrollCar";

export function ScrollCar() {
  const { refs, visible } = useScrollCar();

  return (
    <div
      ref={(node) => {
        refs.current.root = node;
      }}
      className="scroll-car-root"
      aria-hidden="true"
      style={{ display: visible ? undefined : "none" }}
      data-testid="scroll-car"
    >
      <div
        ref={(node) => {
          refs.current.road = node;
        }}
        className="scroll-car-road"
        style={{
          top: SCROLL_CAR_TOP_GAP,
          bottom: SCROLL_CAR_BOTTOM_GAP,
        }}
      >
        <div className="scroll-car-road-visual">
          <div
            ref={(node) => {
              refs.current.dash = node;
            }}
            className="scroll-car-dash"
          />
          <div
            ref={(node) => {
              refs.current.flag = node;
            }}
            className="scroll-car-flag"
          >
            <FinishFlagDoodle />
          </div>
          <div
            ref={(node) => {
              refs.current.car = node;
            }}
            className="scroll-car-car"
          >
            <div
              ref={(node) => {
                refs.current.puffs = node;
              }}
              className="scroll-car-puffs"
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
            </div>
            <div
              ref={(node) => {
                refs.current.carInner = node;
              }}
              className="scroll-car-car-inner"
            >
              <ScrollCarDoodle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
