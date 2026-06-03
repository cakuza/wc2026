// Hand-drawn SVG flags (viewBox 0 0 90 60), ported from design-reference/wc-shared.jsx.
// Emoji flags do not render as flags on Windows/many browsers (they fall back to letter
// pairs), and they export inconsistently in html-to-image. These inline SVGs are
// OS-independent and capture cleanly in the poster PNG.

// Five-point star helper (used by several flags).
function starPts(cx: number, cy: number, r: number, rot = -90): string {
  let p = "";
  for (let i = 0; i < 5; i++) {
    const aO = ((rot + i * 72) * Math.PI) / 180;
    const aI = ((rot + i * 72 + 36) * Math.PI) / 180;
    p += `${cx + r * Math.cos(aO)},${cy + r * Math.sin(aO)} `;
    p += `${cx + r * 0.4 * Math.cos(aI)},${cy + r * 0.4 * Math.sin(aI)} `;
  }
  return p.trim();
}

// Keyed by 2-letter design codes (not ISO/FIFA). EN is St George's cross, not the Union Jack.
export const FLAGS: Record<string, string> = {
  TR: `<rect width="90" height="60" fill="#E30A17"/><circle cx="33" cy="30" r="13" fill="#fff"/><circle cx="37" cy="30" r="10.4" fill="#E30A17"/><polygon points="${starPts(52, 30, 7)}" fill="#fff"/>`,
  JP: `<rect width="90" height="60" fill="#fff"/><circle cx="45" cy="30" r="16.5" fill="#BC002D"/>`,
  MX: `<rect width="30" height="60" fill="#006847"/><rect x="30" width="30" height="60" fill="#fff"/><rect x="60" width="30" height="60" fill="#CE1126"/><circle cx="45" cy="30" r="6.4" fill="#9b6b3f"/><circle cx="45" cy="30" r="6.4" fill="none" stroke="#5c3d22" stroke-width="0.8"/>`,
  FR: `<rect width="30" height="60" fill="#0055A4"/><rect x="30" width="30" height="60" fill="#fff"/><rect x="60" width="30" height="60" fill="#EF4135"/>`,
  DE: `<rect width="90" height="20" fill="#111"/><rect y="20" width="90" height="20" fill="#DD0000"/><rect y="40" width="90" height="20" fill="#FFCE00"/>`,
  NL: `<rect width="90" height="20" fill="#AE1C28"/><rect y="20" width="90" height="20" fill="#fff"/><rect y="40" width="90" height="20" fill="#21468B"/>`,
  BE: `<rect width="30" height="60" fill="#111"/><rect x="30" width="30" height="60" fill="#FDDA24"/><rect x="60" width="30" height="60" fill="#EF3340"/>`,
  ES: `<rect width="90" height="60" fill="#AA151B"/><rect y="15" width="90" height="30" fill="#F1BF00"/><rect x="14" y="24" width="11" height="12" rx="1.5" fill="#AA151B"/>`,
  PT: `<rect width="90" height="60" fill="#FF0000"/><rect width="36" height="60" fill="#006600"/><circle cx="36" cy="30" r="8.5" fill="#FFD700"/><circle cx="36" cy="30" r="8.5" fill="none" stroke="#fff" stroke-width="1.1"/><circle cx="36" cy="30" r="4.4" fill="#fff"/><circle cx="36" cy="30" r="2.4" fill="#FF0000"/>`,
  EN: `<rect width="90" height="60" fill="#fff"/><rect x="38" width="14" height="60" fill="#CE1124"/><rect y="23" width="90" height="14" fill="#CE1124"/>`,
  BR: `<rect width="90" height="60" fill="#009C3B"/><polygon points="45,6 83,30 45,54 7,30" fill="#FFDF00"/><circle cx="45" cy="30" r="12" fill="#002776"/><path d="M34,27 Q45,22 56,29" stroke="#fff" stroke-width="1.4" fill="none"/>`,
  AR: `<rect width="90" height="60" fill="#75AADB"/><rect y="20" width="90" height="20" fill="#fff"/><rect y="40" width="90" height="20" fill="#75AADB"/><circle cx="45" cy="30" r="6" fill="#F6B40E"/>`,
  MA: `<rect width="90" height="60" fill="#C1272D"/><polygon points="${starPts(45, 30, 11)}" fill="none" stroke="#006233" stroke-width="2"/>`,
  ZA: `<rect width="90" height="30" fill="#E03C31"/><rect y="30" width="90" height="30" fill="#002395"/><rect x="28" y="22" width="62" height="16" fill="#007749"/><path d="M0,0 L42,30 L0,60 Z" fill="#fff"/><path d="M0,6 L34,30 L0,54 Z" fill="#007749"/><path d="M0,13 L24,30 L0,47 Z" fill="#FFB915"/><path d="M0,18 L17,30 L0,42 Z" fill="#000"/>`,
  KR: `<rect width="90" height="60" fill="#fff"/><circle cx="45" cy="30" r="13" fill="#CD2E3A"/><path d="M45,17 a6.5,6.5 0 0,1 0,13 a6.5,6.5 0 0,0 0,13 a13,13 0 0,1 0,-26" fill="#0047A0"/><g stroke="#111" stroke-width="1.5"><path d="M22,18 h6 M22,21 h6 M22,24 h6"/><path d="M62,36 h6 M62,39 h6 M62,42 h6"/></g>`,
  CZ: `<rect width="90" height="30" fill="#fff"/><rect y="30" width="90" height="30" fill="#D7141A"/><path d="M0,0 L45,30 L0,60 Z" fill="#11457E"/>`,
  HR: `<rect width="90" height="20" fill="#FF0000"/><rect y="20" width="90" height="20" fill="#fff"/><rect y="40" width="90" height="20" fill="#171796"/><g>${[0, 1, 2, 3, 4]
    .map((i) => [0, 1, 2].map((j) => ((i + j) % 2 ? `<rect x="${37 + i * 3.2}" y="${20 + j * 6.6}" width="3.2" height="6.6" fill="#FF0000"/>` : "")).join(""))
    .join("")}</g>`,
  GH: `<rect width="90" height="20" fill="#CE1126"/><rect y="20" width="90" height="20" fill="#FCD116"/><rect y="40" width="90" height="20" fill="#006B3F"/><polygon points="${starPts(45, 30, 7)}" fill="#111"/>`,
  SN: `<rect width="30" height="60" fill="#00853F"/><rect x="30" width="30" height="60" fill="#FDEF42"/><rect x="60" width="30" height="60" fill="#E31B23"/><polygon points="${starPts(45, 30, 7)}" fill="#00853F"/>`,
  NO: `<rect width="90" height="60" fill="#BA0C2F"/><rect x="24" width="12" height="60" fill="#fff"/><rect y="24" width="90" height="12" fill="#fff"/><rect x="27" width="6" height="60" fill="#00205B"/><rect y="27" width="90" height="6" fill="#00205B"/>`,
  US: `<rect width="90" height="60" fill="#fff"/>${[0, 2, 4, 6, 8, 10, 12].map((i) => `<rect y="${i * 4.615}" width="90" height="4.615" fill="#B22234"/>`).join("")}<rect width="40" height="32.3" fill="#3C3B6E"/><g fill="#fff">${[0, 1, 2, 3]
    .map((r) => [0, 1, 2, 3, 4, 5].map((c) => `<circle cx="${4 + c * 6.4}" cy="${4 + r * 8}" r="1.5"/>`).join(""))
    .join("")}</g>`,
  CA: `<rect width="90" height="60" fill="#fff"/><rect width="22" height="60" fill="#FF0000"/><rect x="68" width="22" height="60" fill="#FF0000"/><path d="M45,16 l2,7 6,-2 -3,6 4,2 -5,3 1,5 -5,-3 -5,3 1,-5 -5,-3 4,-2 -3,-6 6,2 z" fill="#FF0000"/>`,
  AU: `<rect width="90" height="60" fill="#00247D"/><rect width="45" height="30" fill="#00247D"/><path d="M0,0 L45,30 M45,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L45,30 M45,0 L0,30" stroke="#CF142B" stroke-width="3"/><rect x="18" width="9" height="30" fill="#fff"/><rect y="10.5" width="45" height="9" fill="#fff"/><rect x="20" width="5" height="30" fill="#CF142B"/><rect y="12.5" width="45" height="5" fill="#CF142B"/><polygon points="${starPts(67, 42, 8)}" fill="#fff"/>`,
  CO: `<rect width="90" height="60" fill="#FCD116"/><rect y="30" width="90" height="15" fill="#003893"/><rect y="45" width="90" height="15" fill="#CE1126"/>`,
  // Bosnia and Herzegovina — blue field, yellow triangle, diagonal row of white stars.
  BA: `<rect width="90" height="60" fill="#002F6C"/><polygon points="34,0 90,0 90,60" fill="#FECB00"/><g fill="#fff">${[0, 1, 2, 3, 4]
    .map((i) => `<polygon points="${starPts(39 + i * 12, 4 + i * 13, 3.2)}"/>`)
    .join("")}</g>`,
  // Qatar — white hoist, maroon fly with nine-point serrated border.
  QA: `<rect width="90" height="60" fill="#fff"/><path d="M28,0 ${[...Array(9)]
    .map((_, i) => `L34,${(i * 2 + 1) * (60 / 18)} L28,${(i * 2 + 2) * (60 / 18)}`)
    .join(" ")} L90,60 L90,0 Z" fill="#8A1538"/>`,
  // Switzerland — red field with centered white cross.
  CH: `<rect width="90" height="60" fill="#D52B1E"/><rect x="38" y="13" width="14" height="34" fill="#fff"/><rect x="28" y="23" width="34" height="14" fill="#fff"/>`,
  // Haiti — blue over red bicolour with white central panel.
  HT: `<rect width="90" height="30" fill="#00209F"/><rect y="30" width="90" height="30" fill="#D21034"/><rect x="33" y="20" width="24" height="20" fill="#fff"/>`,
  // Scotland — blue field with white saltire (St Andrew's cross), NOT the Union Jack.
  SC: `<rect width="90" height="60" fill="#005EB8"/><path d="M0,0 L90,60 M90,0 L0,60" stroke="#fff" stroke-width="10"/>`,
  // Paraguay — red/white/blue triband with central star emblem (obverse).
  PY: `<rect width="90" height="20" fill="#D52B1E"/><rect y="20" width="90" height="20" fill="#fff"/><rect y="40" width="90" height="20" fill="#0038A8"/><circle cx="45" cy="30" r="5.4" fill="none" stroke="#0038A8" stroke-width="0.8"/><polygon points="${starPts(45, 30, 3.4)}" fill="#FCD116"/>`,
  // Curaçao — blue field, yellow stripe, two white stars in the canton.
  CW: `<rect width="90" height="60" fill="#002B7F"/><rect y="40" width="90" height="9" fill="#F9D616"/><polygon points="${starPts(17, 17, 5)}" fill="#fff"/><polygon points="${starPts(29, 30, 7)}" fill="#fff"/>`,
  // Côte d'Ivoire — orange/white/green vertical triband.
  CI: `<rect width="30" height="60" fill="#FF8200"/><rect x="30" width="30" height="60" fill="#fff"/><rect x="60" width="30" height="60" fill="#009E60"/>`,
  // Ecuador — yellow (double height) over blue over red, with central emblem.
  EC: `<rect width="90" height="60" fill="#FFDD00"/><rect y="30" width="90" height="15" fill="#0038A8"/><rect y="45" width="90" height="15" fill="#CE1126"/><circle cx="45" cy="27" r="5" fill="#0038A8"/><polygon points="${starPts(45, 27, 3)}" fill="#FFDD00"/>`,
  // Sweden — blue field with off-centre yellow Scandinavian cross.
  SE: `<rect width="90" height="60" fill="#006AA7"/><rect x="24" width="12" height="60" fill="#FECC00"/><rect y="24" width="90" height="12" fill="#FECC00"/>`,
  // Tunisia — red field, white disc with red crescent and star.
  TN: `<rect width="90" height="60" fill="#E70013"/><circle cx="45" cy="30" r="13" fill="#fff"/><circle cx="48" cy="30" r="9.2" fill="#E70013"/><circle cx="51" cy="30" r="7.4" fill="#fff"/><polygon points="${starPts(52, 30, 4)}" fill="#E70013"/>`,
  // Egypt — red/white/black triband with golden eagle of Saladin (stylised).
  EG: `<rect width="90" height="20" fill="#CE1126"/><rect y="20" width="90" height="20" fill="#fff"/><rect y="40" width="90" height="20" fill="#111"/><circle cx="45" cy="30" r="4.2" fill="#C09300"/>`,
  // Iran — green/white/red triband with central emblem (stylised).
  IR: `<rect width="90" height="20" fill="#239F40"/><rect y="20" width="90" height="20" fill="#fff"/><rect y="40" width="90" height="20" fill="#DA0000"/><path d="M45,23 v7 M42,25 v3 M48,25 v3" stroke="#DA0000" stroke-width="1.4" fill="none"/>`,
  // New Zealand — blue ensign with Union Jack canton and red Southern Cross.
  NZ: `<rect width="90" height="60" fill="#00247D"/><path d="M0,0 L45,30 M45,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L45,30 M45,0 L0,30" stroke="#CF142B" stroke-width="2"/><rect x="18" width="9" height="30" fill="#fff"/><rect y="10.5" width="45" height="9" fill="#fff"/><rect x="20" width="5" height="30" fill="#CF142B"/><rect y="12.5" width="45" height="5" fill="#CF142B"/><g fill="#CF142B"><polygon points="${starPts(72, 14, 4)}"/><polygon points="${starPts(80, 30, 4)}"/><polygon points="${starPts(66, 40, 3.4)}"/><polygon points="${starPts(76, 50, 5)}"/></g>`,
  // Cape Verde — blue field, white/red/white stripes, ring of ten yellow stars.
  CV: `<rect width="90" height="60" fill="#003893"/><rect y="33" width="90" height="6" fill="#fff"/><rect y="39" width="90" height="6" fill="#CF2027"/><rect y="45" width="90" height="6" fill="#fff"/><g fill="#F7D116">${[...Array(10)]
    .map((_, i) => {
      const a = ((i * 36 - 90) * Math.PI) / 180;
      return `<polygon points="${starPts(38 + 13 * Math.cos(a), 36 + 13 * Math.sin(a), 2)}"/>`;
    })
    .join("")}</g>`,
  // Saudi Arabia — green field with white shahada (stylised script) above a sword.
  SA: `<rect width="90" height="60" fill="#006C35"/><path d="M18,24 q6,-3 12,0 q6,3 12,0 q6,-3 12,0 q6,3 12,0" stroke="#fff" stroke-width="2" fill="none"/><rect x="18" y="36" width="56" height="2.4" fill="#fff"/><polygon points="16,37.2 22,34 22,40.4" fill="#fff"/>`,
  // Uruguay — nine white/blue stripes with the Sun of May in the canton.
  UY: `<rect width="90" height="60" fill="#fff"/>${[1, 3, 5, 7]
    .map((i) => `<rect y="${(i * 60) / 9}" width="90" height="${60 / 9}" fill="#0038A8"/>`)
    .join("")}<rect width="36" height="33.3" fill="#fff"/><polygon points="${starPts(18, 16.6, 8)}" fill="#FCD116"/><circle cx="18" cy="16.6" r="4.2" fill="#FCD116"/>`,
  // Iraq — red/white/black triband with green takbir (stylised script).
  IQ: `<rect width="90" height="20" fill="#CE1126"/><rect y="20" width="90" height="20" fill="#fff"/><rect y="40" width="90" height="20" fill="#111"/><path d="M30,30 h6 M40,28 q3,4 6,0 M50,30 h6" stroke="#007A3D" stroke-width="1.6" fill="none"/>`,
  // Algeria — green/white vertical bicolour with red crescent and star.
  DZ: `<rect width="90" height="60" fill="#fff"/><rect width="45" height="60" fill="#006233"/><circle cx="45" cy="30" r="11" fill="#D21034"/><circle cx="49" cy="30" r="9" fill="#fff"/><polygon points="${starPts(53, 30, 5)}" fill="#D21034"/>`,
  // Austria — red/white/red triband.
  AT: `<rect width="90" height="60" fill="#ED2939"/><rect y="20" width="90" height="20" fill="#fff"/>`,
  // Jordan — black/white/green triband with red hoist chevron and white star.
  JO: `<rect width="90" height="20" fill="#111"/><rect y="20" width="90" height="20" fill="#fff"/><rect y="40" width="90" height="20" fill="#007A3D"/><polygon points="0,0 45,30 0,60" fill="#CE1126"/><polygon points="${starPts(15, 30, 4)}" fill="#fff"/>`,
  // Uzbekistan — blue/white/green triband with red fimbriations, crescent and stars.
  UZ: `<rect width="90" height="20" fill="#0099B5"/><rect y="20" width="90" height="20" fill="#fff"/><rect y="40" width="90" height="20" fill="#1EB53A"/><rect y="19" width="90" height="2" fill="#CE1126"/><rect y="39" width="90" height="2" fill="#CE1126"/><circle cx="16" cy="10" r="6" fill="#fff"/><circle cx="19" cy="10" r="5" fill="#0099B5"/><g fill="#fff"><polygon points="${starPts(26, 6, 1.6)}"/><polygon points="${starPts(32, 6, 1.6)}"/><polygon points="${starPts(26, 12, 1.6)}"/><polygon points="${starPts(32, 12, 1.6)}"/></g>`,
  // DR Congo — sky-blue field, yellow-edged red diagonal, yellow star in the canton.
  CD: `<rect width="90" height="60" fill="#007FFF"/><line x1="-5" y1="62" x2="85" y2="-2" stroke="#F7D618" stroke-width="14"/><line x1="-5" y1="62" x2="85" y2="-2" stroke="#CE1021" stroke-width="9"/><polygon points="${starPts(14, 12, 5)}" fill="#F7D618"/>`,
  // Panama — quartered: white/red over blue/white, with blue and red stars.
  PA: `<rect width="90" height="60" fill="#fff"/><rect x="45" width="45" height="30" fill="#D21034"/><rect y="30" width="45" height="30" fill="#005293"/><polygon points="${starPts(22, 15, 7)}" fill="#005293"/><polygon points="${starPts(67, 45, 7)}" fill="#D21034"/>`
};

// Map the app's 3-letter FIFA/country codes to the 2-letter design-flag keys above.
export const FIFA_TO_FLAG: Record<string, string> = {
  TUR: "TR",
  JPN: "JP",
  MEX: "MX",
  FRA: "FR",
  GER: "DE",
  NED: "NL",
  BEL: "BE",
  ESP: "ES",
  POR: "PT",
  ENG: "EN",
  BRA: "BR",
  ARG: "AR",
  MAR: "MA",
  RSA: "ZA",
  KOR: "KR",
  CZE: "CZ",
  CRO: "HR",
  GHA: "GH",
  SEN: "SN",
  NOR: "NO",
  USA: "US",
  CAN: "CA",
  AUS: "AU",
  COL: "CO",
  BIH: "BA",
  QAT: "QA",
  SUI: "CH",
  HAI: "HT",
  SCO: "SC",
  PAR: "PY",
  CUW: "CW",
  CIV: "CI",
  ECU: "EC",
  SWE: "SE",
  TUN: "TN",
  EGY: "EG",
  IRN: "IR",
  NZL: "NZ",
  CPV: "CV",
  KSA: "SA",
  URU: "UY",
  IRQ: "IQ",
  ALG: "DZ",
  AUT: "AT",
  JOR: "JO",
  UZB: "UZ",
  COD: "CD",
  PAN: "PA"
};

// Returns the inline SVG markup for a team's flag, or null when no hand-drawn flag
// exists yet (caller should fall back to the emoji).
export function flagSvgFor(code?: string): string | null {
  if (!code) return null;
  const key = FIFA_TO_FLAG[code.toUpperCase()];
  return key ? FLAGS[key] : null;
}
