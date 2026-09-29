import { describe, expect, it } from 'vitest';
import { viewportOf } from './viewport';

describe('viewportOf', () => {
  it('computes the aspect ratio of the panel', () => {
    expect(viewportOf(800, 400)).toEqual({ width: 800, height: 400, aspect: 2 });
  });

  it('rounds fractional CSS sizes down to whole pixels', () => {
    expect(viewportOf(640.7, 480.2)).toEqual({ width: 640, height: 480, aspect: 640 / 480 });
  });

  it('falls back to a 1:1 ratio for a collapsed panel', () => {
    expect(viewportOf(0, 0)).toEqual({ width: 0, height: 0, aspect: 1 });
    expect(viewportOf(300, 0).aspect).toBe(1);
  });
});
