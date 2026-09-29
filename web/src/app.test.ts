import { describe, expect, it } from 'vitest';
import { appTitle } from './app';

describe('appTitle', () => {
  it('returns the application name', () => {
    expect(appTitle()).toBe('LemonCrochet');
  });
});
