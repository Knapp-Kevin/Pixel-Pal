import { useId } from 'react';
import type { FamilyMemoryTheme } from '@pixel-pals/content-schema';
import { PalArtwork, SceneArtwork, type PalArtworkRequest } from './ProductionArt';

export type FamilyMemorySceneProps = {
  className?: string;
  sceneVariant: FamilyMemoryTheme;
  firstPal: PalArtworkRequest;
  companion: PalArtworkRequest;
};

const THEME_LABELS: Record<FamilyMemoryTheme, string> = {
  'welcome-home': 'Welcome home',
  'helping-day': 'Helping day',
  'family-tradition': 'Family tradition',
  'promise-kept': 'Promise kept'
};

function ThemeDetails({ sceneVariant }: { sceneVariant: FamilyMemoryTheme }) {
  if (sceneVariant === 'welcome-home') {
    return (
      <g>
        <path d="M336 173 Q366 126 399 174" fill="#D99862" stroke="#765039" strokeWidth="7" />
        <rect x="352" y="140" width="30" height="39" rx="5" fill="#F6D889" stroke="#765039" strokeWidth="5" />
        <path d="M367 140 V119" stroke="#765039" strokeLinecap="round" strokeWidth="5" />
        <path d="M321 190 Q367 169 415 190" fill="none" stroke="#EED7AA" strokeLinecap="round" strokeWidth="10" />
      </g>
    );
  }

  if (sceneVariant === 'helping-day') {
    return (
      <g>
        <rect x="326" y="150" width="83" height="44" rx="12" fill="#B68159" stroke="#664936" strokeWidth="6" />
        <path d="M340 151 Q367 117 394 151" fill="none" stroke="#664936" strokeWidth="7" />
        <path d="M345 171 H390" stroke="#E9CA8A" strokeLinecap="round" strokeWidth="7" />
        <path d="M420 174 Q437 144 450 177" fill="#6F9D6E" stroke="#456A4A" strokeWidth="5" />
      </g>
    );
  }

  if (sceneVariant === 'family-tradition') {
    return (
      <g>
        <circle cx="369" cy="154" r="39" fill="#F0C966" stroke="#74533D" strokeWidth="6" />
        <path d="M369 119 V189 M334 154 H404 M344 129 L394 179 M394 129 L344 179" stroke="#FFF0B6" strokeLinecap="round" strokeWidth="6" />
        <path d="M326 204 Q369 182 414 204" fill="none" stroke="#9B6B49" strokeLinecap="round" strokeWidth="9" />
      </g>
    );
  }

  return (
    <g>
      <path d="M329 160 Q350 134 369 158 Q389 132 410 160 Q398 190 369 204 Q340 190 329 160" fill="#C96F76" stroke="#6B4147" strokeWidth="6" />
      <path d="M344 117 Q369 96 394 117" fill="none" stroke="#F0D06E" strokeLinecap="round" strokeWidth="8" />
      <circle cx="344" cy="117" r="7" fill="#FFF1B6" />
      <circle cx="394" cy="117" r="7" fill="#FFF1B6" />
    </g>
  );
}

function FamilySceneFallback({ sceneVariant }: { sceneVariant: FamilyMemoryTheme }) {
  const resourceId = useId().replace(/:/g, '');
  const skyId = `family-sky-${resourceId}`;
  const paperId = `family-paper-${resourceId}`;

  return (
    <svg className="family-memory-background" viewBox="0 0 480 270" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={skyId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#F7E8BE" />
          <stop offset="1" stopColor="#CFE2C4" />
        </linearGradient>
        <filter id={paperId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence baseFrequency="0.8" numOctaves="2" seed="13" type="fractalNoise" />
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .04 0" />
        </filter>
      </defs>
      <rect width="480" height="270" rx="28" fill={`url(#${skyId})`} />
      <circle cx="72" cy="54" r="29" fill="#F2C866" opacity="0.88" />
      <path d="M0 190 Q102 135 211 184 T480 165 V270 H0 Z" fill="#8DB384" />
      <path d="M0 222 Q125 168 245 211 T480 195 V270 H0 Z" fill="#5F8966" />
      <path d="M386 196 Q408 150 431 198" fill="none" stroke="#4C7255" strokeWidth="10" />
      <circle cx="410" cy="126" r="58" fill="#4C7E59" />
      <circle cx="448" cy="143" r="40" fill="#5D9368" />
      <rect x="404" y="157" width="23" height="75" rx="10" fill="#80583B" />
      <ThemeDetails sceneVariant={sceneVariant} />
      <rect width="480" height="270" rx="28" fill="#6A5137" filter={`url(#${paperId})`} />
      <rect x="5" y="5" width="470" height="260" rx="24" fill="none" stroke="#6B563F" strokeWidth="7" opacity="0.55" />
    </svg>
  );
}

export function FamilyMemoryScene({ className, sceneVariant, firstPal, companion }: FamilyMemorySceneProps) {
  return (
    <div
      className={["family-memory-scene", className].filter(Boolean).join(' ')}
      data-family-scene-id="family-memory"
      data-family-scene-variant={sceneVariant}
      data-reusable-art="family-memory-scene"
    >
      <SceneArtwork
        sceneId="family-memory"
        variant={sceneVariant}
        className="family-memory-background"
        fallback={<FamilySceneFallback sceneVariant={sceneVariant} />}
      />
      <PalArtwork
        {...firstPal}
        className={["family-memory-pal", "family-memory-pal-first", firstPal.className].filter(Boolean).join(' ')}
      />
      <PalArtwork
        {...companion}
        className={["family-memory-pal", "family-memory-pal-companion", companion.className].filter(Boolean).join(' ')}
      />
      <span className="family-memory-theme-label">{THEME_LABELS[sceneVariant]}</span>
    </div>
  );
}
