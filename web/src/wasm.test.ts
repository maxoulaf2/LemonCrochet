import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { count_lines, initSync, version } from './wasm/crochet_wasm';
import { SAMPLE_PATTERN } from './sample-pattern';

// Loads the real .wasm produced by `pnpm wasm` (in CI: the artifact of the `wasm` job).
// In Node there is no fetch of a bundled URL, so the bytes are read from disk and
// instantiated synchronously.
beforeAll(() => {
  const bytes = readFileSync(new URL('./wasm/crochet_wasm_bg.wasm', import.meta.url));
  initSync({ module: bytes });
});

describe('crochet-wasm module', () => {
  it('exposes its version', () => {
    expect(version()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('counts the lines of a text passed from JS', () => {
    expect(count_lines('')).toBe(0);
    expect(count_lines('T1: CM 6')).toBe(1);
    expect(count_lines('a\nb\n')).toBe(2);
  });

  it('counts the lines of the sample pattern', () => {
    expect(count_lines(SAMPLE_PATTERN)).toBe(10);
  });

  it('handles non-ASCII text (UTF-16 in JS, UTF-8 in Rust)', () => {
    expect(count_lines('tête\nœil\n')).toBe(2);
  });
});
