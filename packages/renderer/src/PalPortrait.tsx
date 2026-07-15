export type PalSpecies = 'fox' | 'deer' | 'rabbit' | 'cat' | 'duck';
export type PalExpression = 'content' | 'curious' | 'delighted' | 'uncertain' | 'thoughtful';
export type PalPose = 'standing' | 'playful';

export type PalPortraitProps = {
  name: string;
  species: PalSpecies;
  paletteId: string;
  markingId: string;
  accessoryId?: string;
  expression?: PalExpression;
  pose?: PalPose;
  className?: string;
};

type Palette = {
  fur: string;
  light: string;
  dark: string;
  accent: string;
  clothing: string;
};

const PALETTES: Record<string, Palette> = {
  sunleaf: { fur: '#C96F3D', light: '#F5D9A8', dark: '#6F3B2A', accent: '#E8A84A', clothing: '#4D7C61' },
  riverstone: { fur: '#758B91', light: '#DDE4DF', dark: '#394F55', accent: '#8BB6B1', clothing: '#725C8D' },
  berrybloom: { fur: '#A86678', light: '#F2D3D8', dark: '#5E3545', accent: '#D99A9E', clothing: '#587B68' },
  mosscream: { fur: '#B9A67B', light: '#F1E7C9', dark: '#5C5642', accent: '#8FA66D', clothing: '#6E8262' }
};

const SPECIES_LABELS: Record<PalSpecies, string> = {
  fox: 'fox',
  deer: 'deer',
  rabbit: 'rabbit',
  cat: 'kitten',
  duck: 'duckling'
};

function paletteFor(id: string): Palette {
  return PALETTES[id] ?? PALETTES.sunleaf;
}

function Eyes({ expression, dark }: { expression: PalExpression; dark: string }) {
  if (expression === 'delighted') {
    return (
      <g fill="none" stroke={dark} strokeLinecap="round" strokeWidth="5">
        <path d="M88 91 Q99 80 110 91" />
        <path d="M130 91 Q141 80 152 91" />
      </g>
    );
  }

  return (
    <g fill={dark}>
      <ellipse cx="100" cy="90" rx={expression === 'curious' ? 6 : 5} ry={expression === 'curious' ? 8 : 7} />
      <ellipse cx="140" cy="90" rx={expression === 'curious' ? 6 : 5} ry={expression === 'curious' ? 8 : 7} />
      {expression === 'thoughtful' ? <path d="M130 76 Q141 70 151 77" fill="none" stroke={dark} strokeLinecap="round" strokeWidth="4" /> : null}
      {expression === 'uncertain' ? <path d="M89 76 Q99 70 109 76 M131 76 Q141 82 151 76" fill="none" stroke={dark} strokeLinecap="round" strokeWidth="4" /> : null}
    </g>
  );
}

function Mouth({ expression, dark }: { expression: PalExpression; dark: string }) {
  const path = expression === 'delighted'
    ? 'M106 117 Q120 132 134 117'
    : expression === 'uncertain'
      ? 'M108 123 Q120 114 132 123'
      : expression === 'thoughtful'
        ? 'M111 120 Q120 124 129 119'
        : 'M108 117 Q120 126 132 117';

  return <path d={path} fill="none" stroke={dark} strokeLinecap="round" strokeWidth="4" />;
}

function SpeciesHead({ species, palette }: { species: PalSpecies; palette: Palette }) {
  if (species === 'fox') {
    return (
      <g>
        <path d="M70 62 L82 18 L108 57 Z" fill={palette.fur} stroke={palette.dark} strokeLinejoin="round" strokeWidth="5" />
        <path d="M170 62 L158 18 L132 57 Z" fill={palette.fur} stroke={palette.dark} strokeLinejoin="round" strokeWidth="5" />
        <path d="M80 55 L85 31 L100 57 Z" fill={palette.light} />
        <path d="M160 55 L155 31 L140 57 Z" fill={palette.light} />
      </g>
    );
  }

  if (species === 'deer') {
    return (
      <g fill="none" stroke={palette.dark} strokeLinecap="round" strokeWidth="5">
        <path d="M90 50 Q77 31 80 12 M80 28 L67 19 M81 35 L96 22" />
        <path d="M150 50 Q163 31 160 12 M160 28 L173 19 M159 35 L144 22" />
        <path d="M82 61 Q55 45 55 70 Q70 76 88 70" fill={palette.fur} />
        <path d="M158 61 Q185 45 185 70 Q170 76 152 70" fill={palette.fur} />
      </g>
    );
  }

  if (species === 'rabbit') {
    return (
      <g>
        <ellipse cx="91" cy="35" rx="20" ry="46" fill={palette.fur} stroke={palette.dark} strokeWidth="5" transform="rotate(-9 91 35)" />
        <ellipse cx="149" cy="35" rx="20" ry="46" fill={palette.fur} stroke={palette.dark} strokeWidth="5" transform="rotate(9 149 35)" />
        <ellipse cx="91" cy="35" rx="9" ry="31" fill={palette.light} transform="rotate(-9 91 35)" />
        <ellipse cx="149" cy="35" rx="9" ry="31" fill={palette.light} transform="rotate(9 149 35)" />
      </g>
    );
  }

  if (species === 'cat') {
    return (
      <g>
        <path d="M72 65 L79 24 L108 58 Z" fill={palette.fur} stroke={palette.dark} strokeLinejoin="round" strokeWidth="5" />
        <path d="M168 65 L161 24 L132 58 Z" fill={palette.fur} stroke={palette.dark} strokeLinejoin="round" strokeWidth="5" />
        <path d="M82 55 L84 37 L99 57 Z" fill={palette.light} />
        <path d="M158 55 L156 37 L141 57 Z" fill={palette.light} />
      </g>
    );
  }

  return (
    <g fill="none" stroke={palette.dark} strokeLinecap="round" strokeLinejoin="round" strokeWidth="5">
      <path d="M104 48 Q105 25 116 20 Q119 36 120 50" fill={palette.fur} />
      <path d="M120 49 Q126 25 137 24 Q134 41 132 53" fill={palette.fur} />
    </g>
  );
}

function Markings({ markingId, palette }: { markingId: string; palette: Palette }) {
  if (markingId === 'freckles') {
    return (
      <g fill={palette.dark} opacity="0.65">
        <circle cx="88" cy="108" r="3" />
        <circle cx="98" cy="112" r="2.5" />
        <circle cx="142" cy="112" r="2.5" />
        <circle cx="152" cy="108" r="3" />
      </g>
    );
  }

  if (markingId === 'soft-mask') {
    return <path d="M77 83 Q120 52 163 83 Q153 111 120 112 Q87 111 77 83" fill={palette.light} opacity="0.7" />;
  }

  if (markingId === 'ear-dapple') {
    return (
      <g fill={palette.accent} opacity="0.72">
        <circle cx="86" cy="36" r="7" />
        <circle cx="96" cy="54" r="5" />
        <circle cx="150" cy="41" r="6" />
      </g>
    );
  }

  return <path d="M155 205 Q189 198 204 216 Q183 225 163 218" fill={palette.light} />;
}

function Accessory({ accessoryId, palette }: { accessoryId?: string; palette: Palette }) {
  if (accessoryId === 'satchel') {
    return (
      <g>
        <path d="M93 143 Q137 182 155 224" fill="none" stroke={palette.clothing} strokeWidth="9" />
        <rect x="139" y="196" width="45" height="38" rx="10" fill={palette.clothing} stroke={palette.dark} strokeWidth="4" />
      </g>
    );
  }

  if (accessoryId === 'leaf-pin') {
    return <path d="M86 153 Q68 137 77 123 Q95 129 97 148 Q92 154 86 153" fill={palette.accent} stroke={palette.dark} strokeWidth="3" />;
  }

  if (accessoryId === 'scarf') {
    return (
      <g>
        <path d="M78 145 Q120 165 162 145 L156 169 Q120 180 84 169 Z" fill={palette.clothing} stroke={palette.dark} strokeWidth="4" />
        <path d="M151 162 Q167 183 155 218" fill="none" stroke={palette.clothing} strokeLinecap="round" strokeWidth="13" />
      </g>
    );
  }

  return null;
}

export function PalPortrait({
  name,
  species,
  paletteId,
  markingId,
  accessoryId,
  expression = 'content',
  pose = 'standing',
  className
}: PalPortraitProps) {
  const palette = paletteFor(paletteId);
  const armPath = pose === 'playful'
    ? { left: 'M91 171 Q58 140 53 113', right: 'M149 171 Q182 140 187 113' }
    : { left: 'M91 171 Q66 196 66 224', right: 'M149 171 Q174 196 174 224' };

  return (
    <svg
      className={className}
      viewBox="0 0 240 280"
      role="img"
      aria-label={`${name}, a ${SPECIES_LABELS[species]} Pal`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="120" cy="260" rx="72" ry="11" fill="#20342D" opacity="0.13" />
      {species === 'fox' ? <path d="M162 201 Q222 180 216 226 Q194 244 162 224" fill={palette.fur} stroke={palette.dark} strokeWidth="5" /> : null}
      {species === 'rabbit' ? <circle cx="174" cy="214" r="23" fill={palette.light} stroke={palette.dark} strokeWidth="5" /> : null}
      {species === 'deer' ? <path d="M164 211 Q196 197 199 218 Q184 231 164 226" fill={palette.fur} stroke={palette.dark} strokeWidth="5" /> : null}
      {species === 'cat' ? <path d="M164 213 Q214 214 205 180 Q192 169 187 192 Q193 211 164 226" fill={palette.fur} stroke={palette.dark} strokeLinecap="round" strokeWidth="5" /> : null}
      {species === 'duck' ? <path d="M164 211 Q195 199 207 214 Q191 230 164 226" fill={palette.fur} stroke={palette.dark} strokeWidth="5" /> : null}

      <path d={armPath.left} fill="none" stroke={palette.dark} strokeLinecap="round" strokeWidth="21" />
      <path d={armPath.left} fill="none" stroke={palette.fur} strokeLinecap="round" strokeWidth="13" />
      <path d={armPath.right} fill="none" stroke={palette.dark} strokeLinecap="round" strokeWidth="21" />
      <path d={armPath.right} fill="none" stroke={palette.fur} strokeLinecap="round" strokeWidth="13" />

      <ellipse cx="120" cy="195" rx="58" ry="67" fill={palette.fur} stroke={palette.dark} strokeWidth="6" />
      <ellipse cx="120" cy="201" rx="31" ry="42" fill={palette.light} opacity="0.82" />
      <path d="M94 239 Q91 259 82 264" fill="none" stroke={palette.dark} strokeLinecap="round" strokeWidth="20" />
      <path d="M146 239 Q149 259 158 264" fill="none" stroke={palette.dark} strokeLinecap="round" strokeWidth="20" />
      <path d="M94 239 Q91 259 82 264" fill="none" stroke={palette.fur} strokeLinecap="round" strokeWidth="12" />
      <path d="M146 239 Q149 259 158 264" fill="none" stroke={palette.fur} strokeLinecap="round" strokeWidth="12" />
      {species === 'duck' ? (
        <g fill={palette.accent} stroke={palette.dark} strokeLinejoin="round" strokeWidth="3">
          <path d="M68 264 L82 255 L96 267 L82 271 Z" />
          <path d="M144 267 L158 255 L173 264 L158 271 Z" />
        </g>
      ) : null}

      <SpeciesHead species={species} palette={palette} />
      <ellipse cx="120" cy="98" rx="58" ry="57" fill={palette.fur} stroke={palette.dark} strokeWidth="6" />
      <Markings markingId={markingId} palette={palette} />
      <Eyes expression={expression} dark={palette.dark} />
      {species === 'duck' ? (
        <g>
          <path d="M92 107 Q120 94 148 107 Q143 127 120 130 Q97 127 92 107" fill={palette.accent} stroke={palette.dark} strokeLinejoin="round" strokeWidth="4" />
          <path d="M101 117 Q120 123 139 117" fill="none" stroke={palette.dark} strokeLinecap="round" strokeWidth="3" />
        </g>
      ) : (
        <g>
          <ellipse cx="120" cy="111" rx="30" ry="22" fill={palette.light} />
          <ellipse cx="120" cy="107" rx="7" ry="5" fill={palette.dark} />
          <Mouth expression={expression} dark={palette.dark} />
        </g>
      )}
      <Accessory accessoryId={accessoryId} palette={palette} />
    </svg>
  );
}
