export const SCROLL_FRAME_EVENT = "quantum-hub:scroll-frame";

export function emitScrollFrame() {
  window.dispatchEvent(new Event(SCROLL_FRAME_EVENT));
}
