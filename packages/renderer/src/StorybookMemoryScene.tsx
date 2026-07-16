import { useId } from 'react';
import { PalArtwork, type PalArtworkRequest } from './ProductionArt';

export type StorybookMemorySceneProps = {
  className?: string;
  eventType: string;
  activityId?: string;
  emotionalTone: 'joyful' | 'playful' | 'calm' | 'uncertain' | 'sad' | 'hopeful';
  firstPal: PalArtworkRequest;
  companion?: PalArtworkRequest;
};

function LanternAdventureDetails() {
  return (
    <g>
      <path d="M56 198 Q150 164 246 198 T436 190" fill="none" stroke="#B79B70" strokeLinecap="round" strokeWidth="22" />
      {[114, 236, 354].map((x, index) => (
        <g key={x}>
          <path d={`M${x} ${index === 1 ? 164 : 172} V118`} stroke="#4D5E4E" strokeLinecap="round" strokeWidth="5" />
          <rect x={x - 13} y={index === 1 ? 142 : 150} width="26" height="35" rx="8" fill="#F4CA62" stroke="#5E503A" strokeWidth="4" />
          <circle cx={x} cy={index === 1 ? 159 : 167} r="21" fill="#FFE89B" opacity="0.28" />
        </g>
      ))}
      <path d="M70 62 L55 90 M138 50 L124 80 M210 58 L195 88 M288 46 L274 76 M374 59 L360 89" stroke="#E9F5F4" strokeLinecap="round" strokeWidth="5" opacity="0.7" />
    </g>
  );
}

function BridgeAdventureDetails() {
  return (
    <g>
      <path d="M60 212 Q154 164 244 207 T430 199" fill="none" stroke="#6BA2A5" strokeLinecap="round" strokeWidth="28" />
      <path d="M142 197 Q236 133 334 195" fill="#B58D5F" stroke="#674C37" strokeWidth="9" />
      <path d="M154 187 Q236 143 322 185" fill="none" stroke="#E1C596" strokeLinecap="round" strokeWidth="9" />
      <text x="176" y="110" fill="#3F604F" fontFamily="Georgia, serif" fontSize="34" fontWeight="700">♪</text>
      <text x="246" y="88" fill="#3F604F" fontFamily="Georgia, serif" fontSize="28" fontWeight="700">·</text>
      <text x="306" y="119" fill="#3F604F" fontFamily="Georgia, serif" fontSize="38" fontWeight="700">♫</text>
    </g>
  );
}

function SceneDetails({ eventType, activityId }: { eventType: string; activityId?: string }) {
  if (eventType === 'adventure' && activityId === 'lanterns-in-the-rain') return <LanternAdventureDetails />;
  if (eventType === 'adventure' && activityId === 'humming-bridge') return <BridgeAdventureDetails />;

  if (eventType === 'first-friendship-ceremony') {
    return (
      <g>
        <path d="M322 91 Q343 111 330 145" fill="none" stroke="#D77A74" strokeLinecap="round" strokeWidth="8" />
        <path d="M342 92 Q364 118 351 151" fill="none" stroke="#E3B34C" strokeLinecap="round" strokeWidth="7" />
        <circle cx="330" cy="88" r="8" fill="#F7E4A3" />
        <circle cx="350" cy="88" r="7" fill="#F7E4A3" />
      </g>
    );
  }

  if (eventType === 'first-home-object') {
    return (
      <g>
        <rect x="316" y="129" width="76" height="53" rx="12" fill="#B9855B" stroke="#694C38" strokeWidth="5" />
        <circle cx="354" cy="117" r="24" fill="#F3CC6D" opacity="0.9" />
        <path d="M354 92 V74" stroke="#694C38" strokeLinecap="round" strokeWidth="5" />
      </g>
    );
  }

  return (
    <g>
      <ellipse cx="335" cy="181" rx="28" ry="10" fill="#756A58" opacity="0.35" />
      <ellipse cx="321" cy="173" rx="14" ry="9" fill="#B6A891" stroke="#756A58" strokeWidth="3" />
      <ellipse cx="342" cy="168" rx="16" ry="10" fill="#CAB99C" stroke="#756A58" strokeWidth="3" />
      <ellipse cx="355" cy="178" rx="13" ry="8" fill="#9E917C" stroke="#756A58" strokeWidth="3" />
    </g>
  );
}

export function StorybookMemoryScene({
  className,
  eventType,
  activityId,
  emotionalTone,
  firstPal,
  companion
}: StorybookMemorySceneProps) {
  const resourceId = useId().replace(/:/g, '');
  const skyId = `memory-sky-${resourceId}`;
  const textureId = `paper-texture-${resourceId}`;

  return (
    <div className={["storybook-memory-scene", `storybook-memory-${emotionalTone}`, className].filter(Boolean).join(' ')}>
      <svg className="storybook-memory-background" viewBox="0 0 480 270" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={skyId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={emotionalTone === 'calm' ? '#D9E7E8' : '#F9E7B9'} />
            <stop offset="1" stopColor={emotionalTone === 'hopeful' ? '#C8DFC4' : '#D7E6CB'} />
          </linearGradient>
          <filter id={textureId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence baseFrequency="0.9" numOctaves="2" seed="7" type="fractalNoise" />
            <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .045 0" />
          </filter>
        </defs>

        <rect width="480" height="270" rx="28" fill={`url(#${skyId})`} />
        <circle cx="402" cy="54" r="30" fill="#F4C75D" opacity="0.86" />
        <path d="M0 190 Q90 134 190 182 T480 166 V270 H0 Z" fill="#8FB484" />
        <path d="M0 220 Q118 166 240 210 T480 194 V270 H0 Z" fill="#5F8B68" />
        <path d="M388 191 Q410 148 430 194" fill="none" stroke="#496F54" strokeWidth="9" />
        <circle cx="408" cy="133" r="54" fill="#4D805B" />
        <circle cx="442" cy="143" r="43" fill="#5A9365" />
        <rect x="403" y="158" width="22" height="69" rx="10" fill="#80583B" />
        <SceneDetails eventType={eventType} activityId={activityId} />
        <rect width="480" height="270" rx="28" fill="#6A5137" filter={`url(#${textureId})`} />
        <rect x="5" y="5" width="470" height="260" rx="24" fill="none" stroke="#6B563F" strokeWidth="7" opacity="0.58" />
      </svg>

      <PalArtwork
        {...firstPal}
        className={["storybook-memory-pal", "storybook-memory-pal-first", firstPal.className].filter(Boolean).join(' ')}
      />
      {companion ? (
        <PalArtwork
          {...companion}
          className={["storybook-memory-pal", "storybook-memory-pal-companion", companion.className].filter(Boolean).join(' ')}
        />
      ) : null}
    </div>
  );
}
