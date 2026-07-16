import type { AdventureDefinition, AdventureStage } from '@pixel-pals/simulation';
import { PalArtwork, SceneArtwork } from '@pixel-pals/renderer';
import type { WorldScene } from './app/worldQueries';
import { palAppearanceProps } from './app/worldQueries';

type AdventureIllustrationProps = {
  definition: AdventureDefinition;
  stage: AdventureStage;
  scene: WorldScene;
};

function LanternEnvironmentFallback({ variant }: { variant: string }) {
  return (
    <div className={`adventure-fallback adventure-lantern-fallback adventure-variant-${variant}`} aria-hidden="true">
      <span className="adventure-cloud adventure-cloud-one" />
      <span className="adventure-cloud adventure-cloud-two" />
      <span className="adventure-rain" />
      <span className="adventure-path" />
      <span className="adventure-lantern adventure-lantern-one" />
      <span className="adventure-lantern adventure-lantern-two" />
      <span className="adventure-lantern adventure-lantern-three" />
    </div>
  );
}

function BridgeEnvironmentFallback({ variant }: { variant: string }) {
  return (
    <div className={`adventure-fallback adventure-bridge-fallback adventure-variant-${variant}`} aria-hidden="true">
      <span className="adventure-hill adventure-hill-back" />
      <span className="adventure-hill adventure-hill-front" />
      <span className="adventure-stream" />
      <span className="adventure-bridge" />
      <span className="adventure-note adventure-note-one">♪</span>
      <span className="adventure-note adventure-note-two">·</span>
      <span className="adventure-note adventure-note-three">♫</span>
    </div>
  );
}

function AdventurePals({ scene }: { scene: WorldScene }) {
  return (
    <div className="adventure-pal-pair" data-adventure-live-pal-overlay>
      <PalArtwork
        className="adventure-pal adventure-pal-first"
        {...palAppearanceProps(scene.firstPal)}
        expression="curious"
        pose="standing"
      />
      <PalArtwork
        className="adventure-pal adventure-pal-fern"
        {...palAppearanceProps(scene.firstNeighbor)}
        expression="thoughtful"
        pose="standing"
      />
    </div>
  );
}

export function AdventureIllustration({ definition, stage, scene }: AdventureIllustrationProps) {
  const environmentFallback = definition.id === 'lanterns-in-the-rain'
    ? <LanternEnvironmentFallback variant={stage.illustrationVariant} />
    : <BridgeEnvironmentFallback variant={stage.illustrationVariant} />;

  return (
    <div className="adventure-illustration" aria-label={`${scene.firstPal.name} and ${scene.firstNeighbor.name}: ${stage.title}`}>
      <SceneArtwork
        sceneId={definition.sceneId}
        variant={stage.illustrationVariant}
        className="adventure-production-scene"
        fallback={environmentFallback}
      />
      <AdventurePals scene={scene} />
    </div>
  );
}
