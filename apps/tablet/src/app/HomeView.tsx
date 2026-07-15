import type { World } from '@pixel-pals/content-schema';
import { HomeScene, PalPortrait } from '@pixel-pals/renderer';
import { chooseFirstHomeObject } from '@pixel-pals/simulation/home';
import { homeObjectOptions, homeObjectSymbols, type HomeView as HomeViewMode } from './options';
import { palAppearanceProps, type WorldScene } from './worldQueries';

type HomeViewProps = {
  world: World;
  scene: WorldScene;
  firstHome: NonNullable<WorldScene['firstHome']>;
  saving: boolean;
  homeView: HomeViewMode;
  setHomeView: (view: HomeViewMode) => void;
  runWorldAction: (action: () => World) => void;
  onOpenJournal: () => void;
  onReturnVillage: () => void;
};

function HomePanel({ scene, firstHome, saving, homeView, setHomeView }: HomeViewProps) {
  const { firstPal, village, homeMemory } = scene;
  const interiorIntro = homeMemory?.summary
    ?? 'Choose one object that feels right. There is no best choice, only the beginning of a home.';

  return (
    <section className="storybook-panel home-panel" aria-labelledby="home-title">
      <div className="storybook-art home-art">
        <HomeScene className="home-scene" view={homeView} chosenObjectId={firstHome.chosenObjectId} />
        {homeView === 'interior' ? (
          <PalPortrait
            className="home-pal"
            {...palAppearanceProps(firstPal)}
            expression={firstHome.chosenObjectId ? 'content' : 'curious'}
          />
        ) : null}
      </div>
      <div className="welcome-copy home-copy">
        <p className="eyebrow">A place in {village.name}</p>
        <h1 id="home-title">{firstPal.name}’s Home</h1>
        <p className="intro">
          {homeView === 'exterior'
            ? 'A quiet roundhouse waits beside the village path. The inside is simple, warm, and ready to become personal.'
            : interiorIntro}
        </p>
        <button className="inline-action" type="button" disabled={saving} onClick={() => setHomeView(homeView === 'exterior' ? 'interior' : 'exterior')}>
          {homeView === 'exterior' ? 'Go inside' : 'Step outside'}
        </button>
      </div>
    </section>
  );
}

function HomeObjectGrid({ world, saving, runWorldAction }: HomeViewProps) {
  return (
    <section className="action-grid" aria-label="Choose the first home object">
      {homeObjectOptions.map((option) => (
        <button className="action-card home-object-card" type="button" disabled={saving} key={option.id} onClick={() => runWorldAction(() => chooseFirstHomeObject(world, option.id))}>
          <span className="home-object-symbol" aria-hidden="true">{homeObjectSymbols[option.id]}</span>
          <span className="action-title">{option.title}</span>
          <span className="action-description">{option.description}</span>
        </button>
      ))}
    </section>
  );
}

function HomeChosenGrid({ scene, saving, onOpenJournal, onReturnVillage }: HomeViewProps) {
  return (
    <section className="action-grid" aria-label="Home object chosen">
      <article className="action-card action-sun memory-card">
        <span className="action-title">It Feels Like Home</span>
        <span className="action-description">The chosen object will remain here as this household grows.</span>
      </article>
      <button className="action-card action-leaf memory-card" type="button" disabled={saving} onClick={onOpenJournal}>
        <span className="action-title">Read the New Memory</span>
        <span className="action-description">The journal now remembers this first personal choice.</span>
      </button>
      <button className="action-card action-clay memory-card" type="button" disabled={saving} onClick={onReturnVillage}>
        <span className="action-title">Return to {scene.village.name}</span>
        <span className="action-description">The house will be waiting exactly as it is.</span>
      </button>
    </section>
  );
}

export function HomeView(props: HomeViewProps) {
  const { firstHome, homeView } = props;

  return (
    <>
      <HomePanel {...props} />
      {homeView === 'interior' && !firstHome.chosenObjectId ? <HomeObjectGrid {...props} /> : null}
      {homeView === 'interior' && firstHome.chosenObjectId ? <HomeChosenGrid {...props} /> : null}
    </>
  );
}
