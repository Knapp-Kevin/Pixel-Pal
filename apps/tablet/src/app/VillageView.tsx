import type { World } from '@pixel-pals/content-schema';
import {
  PalArtwork,
  SceneArtwork,
  WillowmereScene,
  type WillowmerePlayMarker
} from '@pixel-pals/renderer';
import type { FirstActivity } from '@pixel-pals/simulation';
import { completeFirstFriendshipCeremony } from '@pixel-pals/simulation/ceremony';
import { DayInvitationGrid } from './DayInvitationGrid';
import { activityOptions } from './options';
import { palAppearanceProps, type WorldScene } from './worldQueries';

type VillageViewProps = {
  world: World;
  scene: WorldScene;
  saving: boolean;
  runWorldAction: (action: () => World) => void;
  onStartActivity: (activity: FirstActivity) => void;
  onChooseDayInvitation: (invitationId: string) => void;
  onOpenJournal: () => void;
  onVisitHome: () => void;
};

type ActivityPresentation = {
  change: string;
  marker: WillowmerePlayMarker;
  description: string;
};

const activityPresentations: Record<FirstActivity, ActivityPresentation> = {
  'leaf-chase': {
    change: 'shared-play-leaf-garland',
    marker: 'leaves',
    description: 'The gathered leaf garland and friendship ribbons remain after the tablet closes.'
  },
  'garden-game': {
    change: 'shared-play-garden-blooms',
    marker: 'garden',
    description: 'The newly tended blooms and friendship ribbons remain after the tablet closes.'
  },
  'stone-stacking': {
    change: 'shared-play-stones',
    marker: 'stones',
    description: 'The play stones and friendship ribbons remain after the tablet closes.'
  }
};

function activityFromMemory(scene: WorldScene): FirstActivity | undefined {
  const activityId = scene.firstMemory?.activityId;
  if (activityId && activityId in activityPresentations) return activityId as FirstActivity;

  const summary = scene.firstMemory?.summary ?? '';
  if (summary.includes('chasing windblown leaves')) return 'leaf-chase';
  if (summary.includes('garden guessing game')) return 'garden-game';
  if (summary.includes('stacking smooth stones')) return 'stone-stacking';
  return undefined;
}

function resolveActivityPresentation(scene: WorldScene): ActivityPresentation | undefined {
  const memoryActivity = activityFromMemory(scene);
  if (memoryActivity) return activityPresentations[memoryActivity];

  return Object.values(activityPresentations).find((candidate) =>
    scene.village.visibleChanges.includes(candidate.change)
  );
}

function villageSceneVariant(scene: WorldScene, marker: WillowmerePlayMarker | undefined): string {
  const base = marker ?? 'base';
  return scene.ceremonyMemory ? `${base}-ceremony` : base;
}

function AdventureVillageMarkers({ scene }: { scene: WorldScene }) {
  const rainLanterns = scene.village.visibleChanges.includes('adventure-rain-lantern-path');
  const hummingBridge = scene.village.visibleChanges.includes('adventure-humming-bridge');
  if (!rainLanterns && !hummingBridge) return null;

  return (
    <div className="adventure-village-markers" aria-label="Changes left by shared adventures">
      {rainLanterns ? <span className="adventure-village-lanterns" title="The rain lantern path" /> : null}
      {hummingBridge ? <span className="adventure-village-bridge" title="The humming bridge">♪</span> : null}
    </div>
  );
}

function VillagePanel({ scene }: { scene: WorldScene }) {
  const { firstPal, firstNeighbor, village, firstMemory, ceremonyMemory, firstPreference, latestStory } = scene;
  const expression = firstMemory ? 'delighted' : 'curious';
  const pose = firstMemory ? 'playful' : 'standing';
  const playMarker = resolveActivityPresentation(scene)?.marker;
  const variant = villageSceneVariant(scene, playMarker);

  return (
    <section className="storybook-panel world-panel" aria-labelledby="welcome-title">
      <div className="storybook-art world-art">
        <SceneArtwork
          sceneId="willowmere-village"
          variant={variant}
          className="willowmere-scene"
          fallback={(
            <WillowmereScene
              className="willowmere-scene"
              playMarker={playMarker}
              showCeremonyMarker={Boolean(ceremonyMemory)}
            />
          )}
        />
        <AdventureVillageMarkers scene={scene} />
        <div className="pal-pair" aria-label={`${firstPal.name} and ${firstNeighbor.name} in ${village.name}`}>
          <PalArtwork className="scene-pal scene-pal-first" {...palAppearanceProps(firstPal)} expression={expression} pose={pose} />
          <PalArtwork
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
            <PalArtwork
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
  const changeDescription = resolveActivityPresentation(scene)?.description
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
  if (!props.scene.homeMemory) return <CelebrationGrid {...props} />;
  return (
    <DayInvitationGrid
      world={props.world}
      scene={props.scene}
      saving={props.saving}
      runWorldAction={props.runWorldAction}
      onChoose={props.onChooseDayInvitation}
    />
  );
}

export function VillageView(props: VillageViewProps) {
  return (
    <>
      <VillagePanel scene={props.scene} />
      <VillageActions {...props} />
    </>
  );
}
