import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import { ErrorBoundary } from './ErrorBoundary';
import { ServiceWorkerUpdateNotice } from './ServiceWorkerUpdateNotice';
import { setPendingServiceWorkerUpdate } from './serviceWorkerUpdate';
import './styles.css';
import './starter-choice.css';
import './playtest.css';
import './update-notice.css';

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
      <App />
      <ServiceWorkerUpdateNotice />
    </ErrorBoundary>
  </StrictMode>
);
