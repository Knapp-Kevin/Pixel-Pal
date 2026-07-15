import type { World } from '@pixel-pals/content-schema';
import { PalPortrait, WillowmereScene, type WillowmerePlayMarker } from '@pixel-pals/renderer';
import type { FirstActivity } from '@pixel-pals/simulation';
import { completeFirstFriendshipCeremony } from '@pixel-pals/simulation/ceremony';
import { activityOptions } from './options';
import { palAppearanceProps, type WorldScene } from './worldQueries';

type VillageViewProps = {
  world: World;
  scene: WorldScene;
  saving: boolean;
  runWorldAction: (action: () => World) => void;
  onStartActivity: (activity: FirstActivity) => void;
  onOpenJournal: () => void;
  onVisitHome: () => void;
};

const playMarkers: Array<{
  change: string;
  marker: WillowmerePlayMarker;
  description: string;
}> = [
  {
    change: 'shared-play-leaf-garland',
    marker: 'leaves',
    description: 'The gathered leaf garland and friendship ribbons remain after the tablet closes.'
  },
  {
    change: 'shared-play-garden-blooms',
    marker: 'garden',
    description: 'The newly tended blooms and friendship ribbons remain after the tablet closes.'
  },
  {
    change: 'shared-play-stones',
    marker: 'stones',
    description: 'The play stones and friendship ribbons remain after the tablet closes.'
  }
];

function resolvePlayMarker(scene: WorldScene) {
  return playMarkers.find((candidate) => scene.village.visibleChanges.includes(candidate.change));
}

function VillagePanel({ scene }: { scene: WorldScene }) {
  const { firstPal, firstNeighbor, village, firstMemory, ceremonyMemory, firstPreference, latestStory } = scene;
  const expression = firstMemory ? 'delighted' : 'curious';
  const pose = firstMemory ? 'playful' : 'standing';
  const playMarker = resolvePlayMarker(scene)?.marker;

  return (
    <section className="storybook-panel world-panel" aria-labelledby="welcome-title">
      <div className="storybook-art world-art">
        <WillowmereScene className="willowmere-scene" playMarker={playMarker} showCeremonyMarker={Boolean(ceremonyMemory)} />
        <div className="pal-pair" aria-label={`${firstPal.name} and ${firstNeighbor.name} in ${village.name}`}>
          <PalPortrait className="scene-pal scene-pal-first" {...palAppearanceProps(firstPal)} expression={expression} pose={pose} />
          <PalPortrait
            className="scene-pal scene-pal-fern"
            {...palAppearanceProps(firstNeighbor)}
            expression={firstMemory ? 'delighted' : 'content'}
            pose={pose}
          />
        </div>
      </div>

      <div className="welcome-copy world-copy">
        <p className="eyebrow">Welcome to {village.name}</p>
        <h1 id="welcome-title">{firstPal.name}</h1>
        <p className="tagline">Where every friendship changes the world.</p>
        <p className="intro">{latestStory}</p>
        {firstPreference?.discovered ? <p className="discovery"><strong>Discovered:</strong> {firstPreference.label}</p> : null}
      </div>
    </section>
  );
}

function ActivityGrid({ scene, saving, onStartActivity }: VillageViewProps) {
  return (
    <section className="action-grid" aria-label="Choose a first shared activity">
      {activityOptions.map((activity) => (
        <button
          className="action-card activity-card"
          type="button"
          disabled={saving || !activity.playable}
          key={activity.id}
          onClick={() => onStartActivity(activity.id)}
        >
          <span className="activity-portrait" aria-hidden="true">
            <PalPortrait
              {...palAppearanceProps(scene.firstPal)}
              expression={activity.expression}
              pose={activity.id === 'leaf-chase' ? 'playful' : 'standing'}
            />
          </span>
          <span className="action-title">{activity.title}</span>
          <span className="action-description">{activity.description}</span>
        </button>
      ))}
    </section>
  );
}

function CeremonyGrid({ world, scene, saving, runWorldAction, onOpenJournal }: VillageViewProps) {
  return (
    <section className="action-grid" aria-label="Friendship ready for recognition">
      <button className="action-card action-sun memory-card" type="button" disabled={saving} onClick={onOpenJournal}>
        <span className="action-title">Read the New Memory</span>
        <span className="action-description">{scene.firstMemory?.title}</span>
      </button>
      <article className="action-card action-leaf memory-card">
        <span className="action-title">A Friendship Began</span>
        <span className="action-description">{scene.firstNeighbor.name} is now part of this world’s growing legacy.</span>
      </article>
      <button
        className="action-card action-clay ceremony-button"
        type="button"
        disabled={saving}
        onClick={() => runWorldAction(() => completeFirstFriendshipCeremony(world))}
      >
        <span className="action-title">Visit the Great Tree</span>
        <span className="action-description">Let {scene.village.name} recognize the friendship they have begun.</span>
      </button>
    </section>
  );
}

function CelebrationGrid({ scene, saving, onOpenJournal, onVisitHome }: VillageViewProps) {
  const changeDescription = resolvePlayMarker(scene)?.description
    ?? 'Their first shared activity and friendship ribbons remain after the tablet closes.';

  return (
    <section className="action-grid" aria-label="First friendship ceremony complete">
      <button className="action-card action-sun memory-card" type="button" disabled={saving} onClick={onOpenJournal}>
        <span className="action-title">Open the Journal</span>
        <span className="action-description">Read the moments {scene.village.name} already remembers.</span>
      </button>
      <button className="action-card action-leaf memory-card" type="button" disabled={saving} onClick={onVisitHome}>
        <span className="action-title">Visit {scene.firstPal.name}’s Home</span>
        <span className="action-description">Choose the first object that will make it feel personal.</span>
      </button>
      <article className="action-card action-clay memory-card">
        <span className="action-title">The World Changed</span>
        <span className="action-description">{changeDescription}</span>
      </article>
    </section>
  );
}

function VillageActions(props: VillageViewProps) {
  if (!props.scene.firstMemory) return <ActivityGrid {...props} />;
  if (!props.scene.ceremonyMemory) return <CeremonyGrid {...props} />;
  return <CelebrationGrid {...props} />;
}

export function VillageView(props: VillageViewProps) {
  return (
    <>
      <VillagePanel scene={props.scene} />
      <VillageActions {...props} />
    </>
  );
}
