import { useAccessibilitySettings } from '../AccessibilitySettingsProvider';
import type {
  ContrastPreference,
  MotionPreference,
  TextSizePreference
} from '../accessibilitySettings';

type AccessibilitySectionProps = {
  onStatus: (message: string) => void;
};

type Option<T extends string> = {
  value: T;
  label: string;
  description: string;
};

const MOTION_OPTIONS: readonly Option<MotionPreference>[] = [
  {
    value: 'system',
    label: 'Follow this device',
    description: 'Use the tablet’s own reduced-motion preference.'
  },
  {
    value: 'reduced',
    label: 'Reduce movement',
    description: 'Remove nonessential animation while keeping clear interaction feedback.'
  },
  {
    value: 'full',
    label: 'Allow movement',
    description: 'Use the normal motion presentation even when the device requests less movement.'
  }
];

const TEXT_OPTIONS: readonly Option<TextSizePreference>[] = [
  {
    value: 'standard',
    label: 'Standard text',
    description: 'Use the normal tablet text scale.'
  },
  {
    value: 'large',
    label: 'Larger text',
    description: 'Increase reading text and controls while preserving the fixed tablet stage.'
  }
];

const CONTRAST_OPTIONS: readonly Option<ContrastPreference>[] = [
  {
    value: 'standard',
    label: 'Standard contrast',
    description: 'Use the normal storybook palette.'
  },
  {
    value: 'strong',
    label: 'Stronger contrast',
    description: 'Strengthen text, controls, borders, and focus without removing scene color.'
  }
];

function PreferenceGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange
}: {
  legend: string;
  name: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="accessibility-preference-group">
      <legend>{legend}</legend>
      <div className="accessibility-option-grid">
        {options.map((option) => (
          <label className={value === option.value ? 'accessibility-option selected' : 'accessibility-option'} key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function AccessibilitySection({ onStatus }: AccessibilitySectionProps) {
  const { settings, updateSettings, resetSettings } = useAccessibilitySettings();

  function update<K extends keyof typeof settings>(key: K, value: (typeof settings)[K]): void {
    updateSettings({ [key]: value });
    onStatus('Accessibility preference saved for this tablet.');
  }

  return (
    <section className="accessibility-settings-section" aria-labelledby="accessibility-settings-title">
      <h2 id="accessibility-settings-title">Accessibility</h2>
      <p>These settings stay on this tablet and do not alter or travel with a Pal world backup.</p>

      <PreferenceGroup
        legend="Movement"
        name="accessibility-motion"
        value={settings.motion}
        options={MOTION_OPTIONS}
        onChange={(value) => update('motion', value)}
      />
      <PreferenceGroup
        legend="Text size"
        name="accessibility-text-size"
        value={settings.textSize}
        options={TEXT_OPTIONS}
        onChange={(value) => update('textSize', value)}
      />
      <PreferenceGroup
        legend="Contrast"
        name="accessibility-contrast"
        value={settings.contrast}
        options={CONTRAST_OPTIONS}
        onChange={(value) => update('contrast', value)}
      />

      <button
        className="adult-action secondary-adult-action"
        type="button"
        onClick={() => {
          resetSettings();
          onStatus('Accessibility preferences returned to their tablet defaults.');
        }}
      >
        Reset accessibility preferences
      </button>
    </section>
  );
}
