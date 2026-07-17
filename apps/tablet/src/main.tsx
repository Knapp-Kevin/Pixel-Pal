import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProductionArtProvider, type ProductionArtFallbackPolicy } from '@pixel-pals/renderer';
import { registerSW } from 'virtual:pwa-register';
import { AccessibilitySettingsProvider } from './AccessibilitySettingsProvider';
import { App } from './App';
import { ErrorBoundary } from './ErrorBoundary';
import { ServiceWorkerUpdateNotice } from './ServiceWorkerUpdateNotice';
import { TabletProfileBoundary } from './TabletProfileBoundary';
import {
  productionArtMinimumStatus,
  productionArtRegistry,
  productionArtRelease
} from './productionArtRegistry';
import { setPendingServiceWorkerUpdate } from './serviceWorkerUpdate';
import './styles.css';
import './starter-choice.css';
import './playtest.css';
import './parent-access.css';
import './accessibility-settings.css';
import './world-catalog.css';
import './adventures.css';
import './compatibility.css';
import './update-notice.css';
import './viewport-layout.css';
import './stone-stacking.css';
import './leaf-chase.css';
import './garden-game.css';
import './day-cycle.css';
import './home-day.css';
import './adventures-compact.css';
import './production-art.css';
import './traits-lab.css';
import './family-map.css';

const updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh: () => {
    setPendingServiceWorkerUpdate(() => updateServiceWorker(true));
  }
});

const root = document.getElementById('root');

if (!root) {
  throw new Error('Pixel Pals could not find the application root.');
}

const alphaFixtureModes = new Set(['alpha-fixture', 'benchmark-art']);
const productionArtFallbackPolicy: ProductionArtFallbackPolicy =
  alphaFixtureModes.has(import.meta.env.MODE)
    || import.meta.env.VITE_PIXEL_PALS_ALLOW_ALPHA_FALLBACK === 'true'
    ? 'alpha'
    : 'block';

document.documentElement.dataset.pixelPalsArtMode = import.meta.env.MODE;
document.documentElement.dataset.pixelPalsArtFallback = productionArtFallbackPolicy;
document.documentElement.dataset.pixelPalsArtMinimumStatus = productionArtMinimumStatus;

function ProductionArtReleaseBoundary({ children }: { children: ReactNode }) {
  if (productionArtFallbackPolicy === 'alpha' || productionArtRelease.ready) return <>{children}</>;

  return (
    <main className="app-shell production-art-release-shell">
      <section
        className="storybook-panel production-art-release-block"
        aria-labelledby="production-art-release-title"
        data-production-art-release-blocked="true"
        data-production-art-blocker-count={productionArtRelease.blockerCount}
      >
        <div className="production-art-release-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="production-art-release-copy">
          <p className="eyebrow">Visual release gate active</p>
          <h1 id="production-art-release-title">Pixel Pals is waiting for its finished artwork</h1>
          <p className="intro">
            This build is intentionally blocked rather than showing temporary alpha art as the product’s visual identity.
          </p>
          <p>
            {productionArtRelease.blockerCount} required art records still need reviewed production assets. Saved local worlds remain unchanged.
          </p>
        </div>
      </section>
    </main>
  );
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <AccessibilitySettingsProvider>
        <ProductionArtProvider
          registry={productionArtRegistry}
          minimumStatus={productionArtMinimumStatus}
          fallbackPolicy={productionArtFallbackPolicy}
        >
          <ProductionArtReleaseBoundary>
            <TabletProfileBoundary>
              <App />
            </TabletProfileBoundary>
          </ProductionArtReleaseBoundary>
        </ProductionArtProvider>
        <ServiceWorkerUpdateNotice />
      </AccessibilitySettingsProvider>
    </ErrorBoundary>
  </StrictMode>
);
