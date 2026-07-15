import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import { ErrorBoundary } from './ErrorBoundary';
import { ServiceWorkerUpdateNotice } from './ServiceWorkerUpdateNotice';
import { TabletProfileBoundary } from './TabletProfileBoundary';
import { setPendingServiceWorkerUpdate } from './serviceWorkerUpdate';
import './styles.css';
import './starter-choice.css';
import './playtest.css';
import './parent-access.css';
import './compatibility.css';
import './update-notice.css';
import './viewport-layout.css';
import './stone-stacking.css';
import './leaf-chase.css';

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

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <TabletProfileBoundary>
        <App />
      </TabletProfileBoundary>
      <ServiceWorkerUpdateNotice />
    </ErrorBoundary>
  </StrictMode>
);
