type ChoiceGroupProps<T extends string> = {
  legend: string;
  options: Array<{ id: T; label: string }>;
  selected: T | null;
  onSelect: (value: T) => void;
  disabled?: boolean;
};

export function ChoiceGroup<T extends string>({ legend, options, selected, onSelect, disabled = false }: ChoiceGroupProps<T>) {
  return (
    <fieldset className="choice-group" disabled={disabled}>
      <legend className="action-title">{legend}</legend>
      <div className="choice-row">
        {options.map((option) => (
          <button key={option.id} type="button" className="choice-button" aria-pressed={selected === option.id} disabled={disabled} onClick={() => onSelect(option.id)}>
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
