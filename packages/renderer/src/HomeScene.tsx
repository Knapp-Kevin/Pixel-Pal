export type HomeSceneProps = {
  view: 'exterior' | 'interior';
  chosenObjectId?: 'window-cushion' | 'memory-shelf' | 'story-lantern';
  className?: string;
};

export function HomeScene({ view, chosenObjectId, className }: HomeSceneProps) {
  if (view === 'exterior') {
    return (
      <svg
        className={className}
        viewBox="0 0 720 440"
        role="img"
        aria-label="A round Willowmere home beside a garden path"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="home-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#CFE7DF" />
            <stop offset="1" stopColor="#F7EDC5" />
          </linearGradient>
        </defs>
        <rect width="720" height="440" fill="url(#home-sky)" />
        <circle cx="610" cy="74" r="44" fill="#F2CF69" opacity="0.92" />
        <path d="M0 270 Q170 205 340 270 T720 265 V440 H0 Z" fill="#91B986" />
        <path d="M0 320 Q180 260 370 320 T720 305 V440 H0 Z" fill="#628E69" />
        <path d="M300 440 Q324 350 352 304 Q380 264 420 246" fill="none" stroke="#D9C392" strokeWidth="52" strokeLinecap="round" />
        <ellipse cx="342" cy="275" rx="190" ry="118" fill="#DDAA72" stroke="#4C5A45" strokeWidth="8" />
        <path d="M160 260 Q340 80 525 260" fill="#6E8A58" stroke="#4C5A45" strokeWidth="9" strokeLinejoin="round" />
        <path d="M183 248 Q340 112 500 248" fill="#789A62" opacity="0.84" />
        <ellipse cx="342" cy="304" rx="48" ry="70" fill="#6B4A39" stroke="#4C3C31" strokeWidth="7" />
        <circle cx="327" cy="302" r="5" fill="#E9C86D" />
        <circle cx="246" cy="270" r="34" fill="#B7D6D2" stroke="#4C5A45" strokeWidth="7" />
        <path d="M246 236 V304 M212 270 H280" stroke="#F7F0D4" strokeWidth="6" />
        <g fill="#F0D36F" stroke="#4C5A45" strokeWidth="3">
          <circle cx="112" cy="342" r="12" />
          <circle cx="142" cy="358" r="10" />
          <circle cx="570" cy="338" r="11" />
          <circle cx="604" cy="352" r="9" />
        </g>
        <g stroke="#4C5A45" strokeWidth="5" strokeLinecap="round">
          <path d="M112 354 V382" />
          <path d="M142 368 V394" />
          <path d="M570 349 V382" />
          <path d="M604 361 V392" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 720 440"
      role="img"
      aria-label="A warm Willowmere home interior"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="720" height="440" fill="#F1DFB7" />
      <path d="M0 0 H720 V300 Q360 355 0 300 Z" fill="#D8B47D" />
      <path d="M0 318 Q360 270 720 318 V440 H0 Z" fill="#927153" />
      <path d="M34 24 Q360 -8 686 24" fill="none" stroke="#76553F" strokeWidth="18" strokeLinecap="round" />
      <circle cx="548" cy="120" r="78" fill="#B8D8D2" stroke="#5C705D" strokeWidth="9" />
      <path d="M548 42 V198 M470 120 H626" stroke="#F4ECD2" strokeWidth="8" />
      <rect x="72" y="230" width="210" height="104" rx="34" fill="#6E8D69" stroke="#4C5A45" strokeWidth="8" />
      <rect x="92" y="206" width="170" height="70" rx="28" fill="#91AF82" stroke="#4C5A45" strokeWidth="7" />
      <ellipse cx="360" cy="338" rx="150" ry="62" fill="#D9B66B" opacity="0.78" />
      <rect x="468" y="248" width="156" height="94" rx="18" fill="#A97B55" stroke="#5D493A" strokeWidth="8" />
      <circle cx="590" cy="294" r="6" fill="#F3D475" />

      {chosenObjectId === 'window-cushion' ? (
        <g>
          <ellipse cx="548" cy="238" rx="78" ry="30" fill="#C97973" stroke="#5D493A" strokeWidth="7" />
          <path d="M495 235 Q548 205 601 235" fill="none" stroke="#F0B6A6" strokeWidth="6" />
        </g>
      ) : null}

      {chosenObjectId === 'memory-shelf' ? (
        <g>
          <rect x="92" y="88" width="176" height="18" rx="8" fill="#79583F" />
          <rect x="112" y="54" width="28" height="34" rx="5" fill="#7DA0A2" />
          <circle cx="176" cy="72" r="17" fill="#E2BF62" />
          <path d="M216 86 Q235 46 254 86" fill="#8D6B94" />
        </g>
      ) : null}

      {chosenObjectId === 'story-lantern' ? (
        <g>
          <path d="M354 74 V124" stroke="#604839" strokeWidth="7" />
          <path d="M326 122 Q354 95 382 122 L374 184 H334 Z" fill="#F1C85A" stroke="#604839" strokeWidth="7" />
          <circle cx="354" cy="148" r="42" fill="#FFD979" opacity="0.2" />
        </g>
      ) : null}

      {!chosenObjectId ? (
        <g opacity="0.72">
          <circle cx="548" cy="238" r="20" fill="none" stroke="#5C705D" strokeWidth="5" strokeDasharray="8 8" />
          <rect x="92" y="78" width="176" height="18" rx="8" fill="none" stroke="#5C705D" strokeWidth="5" strokeDasharray="8 8" />
          <circle cx="354" cy="144" r="24" fill="none" stroke="#5C705D" strokeWidth="5" strokeDasharray="8 8" />
        </g>
      ) : null}
    </svg>
  );
}
