import { describe, expect, it } from 'vitest';
import { SAMPLE_PATTERN } from './sample-pattern';

describe('SAMPLE_PATTERN', () => {
  it('declares its terminology first, as the DSL requires for ambiguous abbreviations', () => {
    expect(SAMPLE_PATTERN.startsWith('terms: fr\n')).toBe(true);
  });

  it('describes the closed sphere-shaped head', () => {
    expect(SAMPLE_PATTERN).toContain('piece tete');
    expect(SAMPLE_PATTERN).toContain('T10: dim x6 (6)');
    expect(SAMPLE_PATTERN.trimEnd().endsWith('fermer')).toBe(true);
  });
});
