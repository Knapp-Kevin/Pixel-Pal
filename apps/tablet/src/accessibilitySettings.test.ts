import { describe, expect, it } from 'vitest';
import {
  ACCESSIBILITY_SETTINGS_KEY,
  clearAccessibilitySettings,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  loadAccessibilitySettings,
  parseAccessibilitySettings,
  saveAccessibilitySettings,
  type SettingsStorage
} from './accessibilitySettings';

function memoryStorage(initial: Record<string, string> = {}): SettingsStorage & { entries: Map<string, string> } {
  const entries = new Map(Object.entries(initial));
  return {
    entries,
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key)
  };
}

describe('device accessibility settings', () => {
  it('uses documented defaults when no settings exist', () => {
    expect(loadAccessibilitySettings(memoryStorage())).toEqual(DEFAULT_ACCESSIBILITY_SETTINGS);
  });

  it('recovers safely from invalid JSON', () => {
    const storage = memoryStorage({ [ACCESSIBILITY_SETTINGS_KEY]: '{not-json' });
    expect(loadAccessibilitySettings(storage)).toEqual(DEFAULT_ACCESSIBILITY_SETTINGS);
  });

  it('keeps valid fields and repairs invalid fields', () => {
    expect(parseAccessibilitySettings({
      motion: 'reduced',
      textSize: 'enormous',
      contrast: 'strong'
    })).toEqual({
      motion: 'reduced',
      textSize: 'standard',
      contrast: 'strong'
    });
  });

  it('persists and reloads a complete preference set', () => {
    const storage = memoryStorage();
    const saved = saveAccessibilitySettings({
      motion: 'full',
      textSize: 'large',
      contrast: 'strong'
    }, storage);

    expect(saved).toEqual({ motion: 'full', textSize: 'large', contrast: 'strong' });
    expect(loadAccessibilitySettings(storage)).toEqual(saved);
  });

  it('clears only the accessibility record', () => {
    const storage = memoryStorage({
      [ACCESSIBILITY_SETTINGS_KEY]: JSON.stringify({ motion: 'reduced', textSize: 'large', contrast: 'strong' }),
      'pixel-pals-unrelated-world-data': 'preserve-me'
    });

    clearAccessibilitySettings(storage);

    expect(storage.entries.has(ACCESSIBILITY_SETTINGS_KEY)).toBe(false);
    expect(storage.entries.get('pixel-pals-unrelated-world-data')).toBe('preserve-me');
  });

  it('does not throw when browser storage is unavailable', () => {
    expect(saveAccessibilitySettings({
      motion: 'reduced',
      textSize: 'large',
      contrast: 'strong'
    }, undefined)).toEqual({ motion: 'reduced', textSize: 'large', contrast: 'strong' });
    expect(loadAccessibilitySettings(undefined)).toEqual(DEFAULT_ACCESSIBILITY_SETTINGS);
  });
});
