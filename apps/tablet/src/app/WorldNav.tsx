import type { AppView } from './options';

type WorldNavProps = {
  view: AppView;
  hasHome: boolean;
  hasAdventures: boolean;
  hasJournal: boolean;
  disabled?: boolean;
  onChange: (view: AppView) => void;
};

export function WorldNav({ view, hasHome, hasAdventures, hasJournal, disabled = false, onChange }: WorldNavProps) {
  return (
    <nav className="world-nav" aria-label="World places">
      <button type="button" aria-pressed={view === 'village'} disabled={disabled} onClick={() => onChange('village')}>Village</button>
      <button type="button" aria-pressed={view === 'home'} disabled={disabled || !hasHome} onClick={() => onChange('home')}>Home</button>
      <button type="button" aria-pressed={view === 'adventures'} disabled={disabled || !hasAdventures} onClick={() => onChange('adventures')}>Adventures</button>
      <button type="button" aria-pressed={view === 'journal'} disabled={disabled || !hasJournal} onClick={() => onChange('journal')}>Journal</button>
    </nav>
  );
}
