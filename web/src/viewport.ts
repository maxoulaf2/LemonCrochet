// Pure sizing logic, kept apart from Three.js and the DOM so Vitest can test it in Node.

export interface Viewport {
  width: number;
  height: number;
  aspect: number;
}

// A collapsed panel (0 × 0, e.g. before layout) must not yield a NaN or Infinity
// aspect ratio, which would corrupt the camera's projection matrix.
export function viewportOf(width: number, height: number): Viewport {
  const w = Math.max(0, Math.floor(width));
  const h = Math.max(0, Math.floor(height));
  return { width: w, height: h, aspect: h > 0 ? w / h : 1 };
}
