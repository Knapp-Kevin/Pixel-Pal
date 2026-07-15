import type { World } from '@pixel-pals/content-schema';
import { currentOfferedDay, offerNextWorldDay, type WorldDayInvitation } from '@pixel-pals/simulation';
import type { WorldScene } from './worldQueries';

type DayInvitationGridProps = {
  world: World;
  scene: WorldScene;
  saving: boolean;
  runWorldAction: (action: () => World) => void;
  onChoose: (invitationId: string) => void;
};

const KIND_LABELS: Record<WorldDayInvitation['kind'], string> = {
  active: 'Play together',
  quiet: 'A quiet visit',
  home: 'Spend time at home',
  helping: 'Care for Willowmere'
};

function InvitationCards({ world, saving, onChoose }: DayInvitationGridProps) {
  const offered = currentOfferedDay(world);
  if (!offered) return null;

  return (
    <section className="action-grid day-invitation-grid" aria-label={`Choose how to spend world day ${offered.day}`}>
      {offered.invitations.map((invitation) => (
        <button
          className={`action-card day-invitation-card day-invitation-${invitation.kind}`}
          type="button"
          disabled={saving}
          key={invitation.id}
          onClick={() => onChoose(invitation.id)}
        >
          <span className="day-invitation-kind">{KIND_LABELS[invitation.kind]}</span>
          <span className="action-title">{invitation.title}</span>
          <span className="action-description">{invitation.summary}</span>
        </button>
      ))}
    </section>
  );
}

function DayReadyCard({ world, scene, saving, runWorldAction }: DayInvitationGridProps) {
  const latest = [...world.daySessions].reverse().find((session) => session.status === 'completed');
  const nextDay = world.worldDay + 1;

  return (
    <section className="action-grid day-ready-grid" aria-label="Continue the living world">
      {latest?.summary ? (
        <article className="action-card action-leaf day-summary-card">
          <span className="day-invitation-kind">The day is remembered</span>
          <span className="action-title">{latest.summary.title}</span>
          <span className="action-description">{latest.summary.summary}</span>
        </article>
      ) : (
        <article className="action-card action-leaf day-summary-card">
          <span className="day-invitation-kind">A life together is beginning</span>
          <span className="action-title">The first afternoon is complete</span>
          <span className="action-description">{scene.firstPal.name} has a friend, a home, and a world ready to keep changing.</span>
        </article>
      )}

      <button
        className="action-card action-sun open-day-button"
        type="button"
        disabled={saving}
        onClick={() => runWorldAction(() => offerNextWorldDay(world))}
      >
        <span className="day-invitation-kind">World day {nextDay}</span>
        <span className="action-title">See What Willowmere Offers</span>
        <span className="action-description">Open a new set of invitations. Nothing changes until one is completed.</span>
      </button>

      <article className="action-card action-clay day-summary-card">
        <span className="day-invitation-kind">No schedule to keep</span>
        <span className="action-title">The world waits calmly</span>
        <span className="action-description">Return today or much later. No Pal is punished and no relationship is lost.</span>
      </article>
    </section>
  );
}

export function DayInvitationGrid(props: DayInvitationGridProps) {
  return currentOfferedDay(props.world) ? <InvitationCards {...props} /> : <DayReadyCard {...props} />;
}
