import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  clearAccessibilitySettings,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  loadAccessibilitySettings,
  saveAccessibilitySettings,
  type AccessibilitySettings
} from './accessibilitySettings';

type AccessibilitySettingsContextValue = {
  settings: AccessibilitySettings;
  updateSettings: (next: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
};

const AccessibilitySettingsContext = createContext<AccessibilitySettingsContextValue | null>(null);

function applySettings(settings: AccessibilitySettings): void {
  const root = document.documentElement;
  root.dataset.motion = settings.motion;
  root.dataset.textSize = settings.textSize;
  root.dataset.contrast = settings.contrast;
}

export function AccessibilitySettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => loadAccessibilitySettings());

  useEffect(() => {
    applySettings(settings);
    saveAccessibilitySettings(settings);
  }, [settings]);

  const value = useMemo<AccessibilitySettingsContextValue>(() => ({
    settings,
    updateSettings: (next) => setSettings((current) => ({ ...current, ...next })),
    resetSettings: () => {
      clearAccessibilitySettings();
      setSettings({ ...DEFAULT_ACCESSIBILITY_SETTINGS });
    }
  }), [settings]);

  return (
    <AccessibilitySettingsContext.Provider value={value}>
      {children}
    </AccessibilitySettingsContext.Provider>
  );
}

export function useAccessibilitySettings(): AccessibilitySettingsContextValue {
  const value = useContext(AccessibilitySettingsContext);
  if (!value) throw new Error('Accessibility settings must be used inside AccessibilitySettingsProvider.');
  return value;
}
