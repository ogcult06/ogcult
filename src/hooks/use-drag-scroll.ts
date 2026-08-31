import { useRef, type RefObject } from "react";

/**
 * Adds mouse/trackpad drag-to-swipe on a horizontally scrollable container.
 * Touch swipe is already native. Returns handlers to spread on the container.
 */
export function useDragScroll(ref: RefObject<HTMLDivElement | null>) {
  const state = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    state.current = { down: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !state.current.down) return;
    const dx = e.clientX - state.current.startX;
    if (Math.abs(dx) > 4) state.current.moved = true;
    el.scrollLeft = state.current.startScroll - dx;
  };

  const endDrag = () => {
    const el = ref.current;
    state.current.down = false;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const didDrag = () => state.current.moved;

  return {
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerLeave: endDrag,
      onPointerCancel: endDrag,
    },
    didDrag,
  };
}
