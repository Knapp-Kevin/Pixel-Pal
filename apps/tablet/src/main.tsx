import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import './styles.css';
import './starter-choice.css';

registerSW({ immediate: true });

const root = document.getElementById('root');

if (!root) {
  throw new Error('Pixel Pals could not find the application root.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
