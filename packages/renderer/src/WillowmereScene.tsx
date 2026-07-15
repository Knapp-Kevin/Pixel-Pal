export type WillowmereSceneProps = {
  showPlayMarker?: boolean;
  className?: string;
};

export function WillowmereScene({ showPlayMarker = false, className }: WillowmereSceneProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 900 420"
      role="img"
      aria-label="Willowmere village with its Great Tree, winding path, homes, and garden"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="900" height="420" fill="#DDEEDC" />
      <circle cx="760" cy="78" r="46" fill="#F4D879" />
      <circle cx="760" cy="78" r="64" fill="#F4D879" opacity="0.2" />

      <path d="M0 190 Q135 92 285 177 Q430 80 575 170 Q755 82 900 165 L900 420 L0 420 Z" fill="#9BC496" />
      <path d="M0 255 Q150 164 310 245 Q460 151 615 245 Q760 168 900 238 L900 420 L0 420 Z" fill="#6C9E75" />
      <path d="M0 314 Q165 250 335 308 Q520 240 690 309 Q790 271 900 298 L900 420 L0 420 Z" fill="#4F7E61" />

      <path d="M370 420 Q405 332 481 279 Q535 242 599 236" fill="none" stroke="#D9C89A" strokeLinecap="round" strokeWidth="62" />
      <path d="M370 420 Q405 332 481 279 Q535 242 599 236" fill="none" stroke="#EEE2BC" strokeDasharray="5 15" strokeLinecap="round" strokeWidth="5" opacity="0.65" />

      <g transform="translate(84 200)">
        <path d="M0 58 L65 8 L130 58 V142 H0 Z" fill="#D49A68" stroke="#5B463B" strokeLinejoin="round" strokeWidth="6" />
        <path d="M-10 58 L65 0 L140 58" fill="none" stroke="#6F5A43" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
        <rect x="18" y="78" width="36" height="42" rx="7" fill="#A8D1D0" stroke="#5B463B" strokeWidth="5" />
        <rect x="78" y="78" width="34" height="64" rx="10" fill="#7B5B45" stroke="#5B463B" strokeWidth="5" />
        <path d="M8 62 Q65 40 122 62" fill="none" stroke="#E8C989" strokeWidth="7" />
      </g>

      <g transform="translate(230 234) scale(0.78)">
        <path d="M0 58 L65 8 L130 58 V142 H0 Z" fill="#C88369" stroke="#5B463B" strokeLinejoin="round" strokeWidth="6" />
        <path d="M-10 58 L65 0 L140 58" fill="none" stroke="#607B55" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
        <rect x="22" y="82" width="32" height="36" rx="7" fill="#A8D1D0" stroke="#5B463B" strokeWidth="5" />
        <rect x="80" y="78" width="32" height="64" rx="10" fill="#7B5B45" stroke="#5B463B" strokeWidth="5" />
      </g>

      <g transform="translate(617 69)">
        <path d="M98 252 Q64 201 76 145 Q29 134 31 87 Q61 54 103 68 Q116 20 161 18 Q203 22 212 64 Q259 50 287 84 Q294 130 250 148 Q264 201 225 244 Z" fill="#47805A" stroke="#315B4C" strokeLinejoin="round" strokeWidth="8" />
        <circle cx="108" cy="91" r="61" fill="#5A9869" />
        <circle cx="181" cy="67" r="72" fill="#529064" />
        <circle cx="244" cy="105" r="63" fill="#3F7B55" />
        <circle cx="160" cy="130" r="80" fill="#4C8B60" />
        <path d="M153 300 Q132 242 150 179 Q176 157 193 180 Q205 245 191 300 Z" fill="#7E573E" stroke="#5B3E31" strokeWidth="8" />
        <path d="M171 183 Q145 139 119 119 M178 180 Q207 141 233 126" fill="none" stroke="#70503A" strokeLinecap="round" strokeWidth="12" />
        <path d="M141 300 Q174 270 207 300" fill="none" stroke="#5B3E31" strokeLinecap="round" strokeWidth="11" />
        <g fill="#F0C967">
          <circle cx="106" cy="74" r="7" />
          <circle cx="143" cy="47" r="6" />
          <circle cx="205" cy="54" r="7" />
          <circle cx="242" cy="99" r="6" />
          <circle cx="129" cy="131" r="7" />
          <circle cx="219" cy="141" r="7" />
        </g>
        <g fill="#F0E2A8" opacity="0.9">
          <path d="M115 152 Q126 144 137 152 Q127 165 115 152" />
          <path d="M205 100 Q216 92 227 100 Q217 113 205 100" />
          <path d="M158 81 Q169 73 180 81 Q170 94 158 81" />
        </g>
      </g>

      <g transform="translate(515 294)">
        <path d="M0 32 Q67 -4 134 32" fill="none" stroke="#8C6F47" strokeLinecap="round" strokeWidth="13" />
        <path d="M10 35 V68 M124 35 V68" stroke="#6B5339" strokeLinecap="round" strokeWidth="8" />
      </g>

      <g transform="translate(245 324)">
        <rect width="105" height="48" rx="18" fill="#7F9D60" stroke="#486747" strokeWidth="5" />
        <g fill="#E9C968">
          <circle cx="18" cy="15" r="5" />
          <circle cx="44" cy="27" r="6" />
          <circle cx="75" cy="15" r="5" />
          <circle cx="91" cy="31" r="5" />
        </g>
        <g fill="#D9878A">
          <circle cx="29" cy="31" r="5" />
          <circle cx="62" cy="14" r="5" />
        </g>
      </g>

      {showPlayMarker ? (
        <g transform="translate(444 321)">
          <ellipse cx="0" cy="28" rx="58" ry="12" fill="#315B4C" opacity="0.12" />
          <ellipse cx="-25" cy="18" rx="18" ry="12" fill="#A99B7C" stroke="#5F5849" strokeWidth="4" />
          <ellipse cx="0" cy="8" rx="22" ry="14" fill="#C2B38F" stroke="#5F5849" strokeWidth="4" />
          <ellipse cx="26" cy="19" rx="17" ry="11" fill="#8E8979" stroke="#5F5849" strokeWidth="4" />
          <path d="M-34 7 Q-4 -16 35 5" fill="none" stroke="#D7B85E" strokeDasharray="5 8" strokeLinecap="round" strokeWidth="5" />
        </g>
      ) : null}

      <g fill="#F4E8B2" opacity="0.85">
        <circle cx="52" cy="341" r="5" />
        <circle cx="78" cy="361" r="4" />
        <circle cx="196" cy="348" r="5" />
        <circle cx="721" cy="346" r="5" />
        <circle cx="782" cy="332" r="4" />
        <circle cx="837" cy="354" r="5" />
      </g>
    </svg>
  );
}
