import type { WorldSummary } from '@pixel-pals/persistence';

type WorldManagementSectionProps = {
  worlds: WorldSummary[];
  onStartNewWorld: () => void;
};

export function WorldManagementSection({ worlds, onStartNewWorld }: WorldManagementSectionProps) {
  return (
    <section className="world-management-section" aria-labelledby="local-worlds-title">
      <h2 id="local-worlds-title">Local worlds</h2>
      <p>
        This tablet currently holds {worlds.length} local world{worlds.length === 1 ? '' : 's'}. Each one keeps a separate Pal history and recovery checkpoint.
      </p>
      <button className="adult-action" type="button" onClick={onStartNewWorld}>
        Begin another local world
      </button>
      <p className="tool-note">No account, cloud profile, email address, or network connection is required.</p>
    </section>
  );
}
