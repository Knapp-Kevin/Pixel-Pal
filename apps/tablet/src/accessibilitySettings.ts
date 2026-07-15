export const ACCESSIBILITY_SETTINGS_KEY = 'pixel-pals-accessibility-v1';

export type MotionPreference = 'system' | 'reduced' | 'full';
export type TextSizePreference = 'standard' | 'large';
export type ContrastPreference = 'standard' | 'strong';

export type AccessibilitySettings = {
  motion: MotionPreference;
  textSize: TextSizePreference;
  contrast: ContrastPreference;
};

export type SettingsStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  motion: 'system',
  textSize: 'standard',
  contrast: 'standard'
};

const MOTION_VALUES: readonly MotionPreference[] = ['system', 'reduced', 'full'];
const TEXT_SIZE_VALUES: readonly TextSizePreference[] = ['standard', 'large'];
const CONTRAST_VALUES: readonly ContrastPreference[] = ['standard', 'strong'];

function includes<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && values.includes(value as T);
}

export function parseAccessibilitySettings(value: unknown): AccessibilitySettings {
  if (!value || typeof value !== 'object') return { ...DEFAULT_ACCESSIBILITY_SETTINGS };
  const candidate = value as Partial<AccessibilitySettings>;
  return {
    motion: includes(MOTION_VALUES, candidate.motion) ? candidate.motion : DEFAULT_ACCESSIBILITY_SETTINGS.motion,
    textSize: includes(TEXT_SIZE_VALUES, candidate.textSize) ? candidate.textSize : DEFAULT_ACCESSIBILITY_SETTINGS.textSize,
    contrast: includes(CONTRAST_VALUES, candidate.contrast) ? candidate.contrast : DEFAULT_ACCESSIBILITY_SETTINGS.contrast
  };
}

function browserStorage(): SettingsStorage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function loadAccessibilitySettings(storage: SettingsStorage | undefined = browserStorage()): AccessibilitySettings {
  if (!storage) return { ...DEFAULT_ACCESSIBILITY_SETTINGS };
  try {
    const raw = storage.getItem(ACCESSIBILITY_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_ACCESSIBILITY_SETTINGS };
    return parseAccessibilitySettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_ACCESSIBILITY_SETTINGS };
  }
}

export function saveAccessibilitySettings(
  settings: AccessibilitySettings,
  storage: SettingsStorage | undefined = browserStorage()
): AccessibilitySettings {
  const parsed = parseAccessibilitySettings(settings);
  if (!storage) return parsed;
  try {
    storage.setItem(ACCESSIBILITY_SETTINGS_KEY, JSON.stringify(parsed));
  } catch {
    // The current session can still use the preference when storage is unavailable.
  }
  return parsed;
}

export function clearAccessibilitySettings(storage: SettingsStorage | undefined = browserStorage()): void {
  try {
    storage?.removeItem(ACCESSIBILITY_SETTINGS_KEY);
  } catch {
    // Clearing preferences is best effort on constrained devices.
  }
}
