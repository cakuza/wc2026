// wc-shared.jsx — flags (SVG, OS-independent), atmosphere, country data.
// Exports to window: Flag, FLAGS, COUNTRY, Pitch, Floodlights, Confetti, Halo,
// JerseyBack, Disclaimer, Chip.

// ---------- star helper ----------
function starPts(cx, cy, r, rot = -90) {
  let p = '';
  for (let i = 0; i < 5; i++) {
    const aO = (rot + i * 72) * Math.PI / 180;
    const aI = (rot + i * 72 + 36) * Math.PI / 180;
    p += `${cx + r * Math.cos(aO)},${cy + r * Math.sin(aO)} `;
    p += `${cx + r * 0.40 * Math.cos(aI)},${cy + r * 0.40 * Math.sin(aI)} `;
  }
  return p.trim();
}

// ---------- flag inner SVG (viewBox 0 0 90 60) ----------
const FLAGS = {
  TR: `<rect width="90" height="60" fill="#E30A17"/><circle cx="33" cy="30" r="13" fill="#fff"/><circle cx="37" cy="30" r="10.4" fill="#E30A17"/><polygon points="${starPts(52,30,7)}" fill="#fff"/>`,
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
  MA: `<rect width="90" height="60" fill="#C1272D"/><polygon points="${starPts(45,30,11)}" fill="none" stroke="#006233" stroke-width="2"/>`,
  ZA: `<rect width="90" height="30" fill="#E03C31"/><rect y="30" width="90" height="30" fill="#002395"/><rect x="28" y="22" width="62" height="16" fill="#007749"/><path d="M0,0 L42,30 L0,60 Z" fill="#fff"/><path d="M0,6 L34,30 L0,54 Z" fill="#007749"/><path d="M0,13 L24,30 L0,47 Z" fill="#FFB915"/><path d="M0,18 L17,30 L0,42 Z" fill="#000"/>`,
  KR: `<rect width="90" height="60" fill="#fff"/><circle cx="45" cy="30" r="13" fill="#CD2E3A"/><path d="M45,17 a6.5,6.5 0 0,1 0,13 a6.5,6.5 0 0,0 0,13 a13,13 0 0,1 0,-26" fill="#0047A0"/><g stroke="#111" stroke-width="1.5"><path d="M22,18 h6 M22,21 h6 M22,24 h6"/><path d="M62,36 h6 M62,39 h6 M62,42 h6"/></g>`,
  CZ: `<rect width="90" height="30" fill="#fff"/><rect y="30" width="90" height="30" fill="#D7141A"/><path d="M0,0 L45,30 L0,60 Z" fill="#11457E"/>`,
  HR: `<rect width="90" height="20" fill="#FF0000"/><rect y="20" width="90" height="20" fill="#fff"/><rect y="40" width="90" height="20" fill="#171796"/><g>${[0,1,2,3,4].map(i=>[0,1,2].map(j=>((i+j)%2? `<rect x="${37+i*3.2}" y="${20+j*6.6}" width="3.2" height="6.6" fill="#FF0000"/>`:'')).join('')).join('')}</g>`,
  GH: `<rect width="90" height="20" fill="#CE1126"/><rect y="20" width="90" height="20" fill="#FCD116"/><rect y="40" width="90" height="20" fill="#006B3F"/><polygon points="${starPts(45,30,7)}" fill="#111"/>`,
  SN: `<rect width="30" height="60" fill="#00853F"/><rect x="30" width="30" height="60" fill="#FDEF42"/><rect x="60" width="30" height="60" fill="#E31B23"/><polygon points="${starPts(45,30,7)}" fill="#00853F"/>`,
  NO: `<rect width="90" height="60" fill="#BA0C2F"/><rect x="24" width="12" height="60" fill="#fff"/><rect y="24" width="90" height="12" fill="#fff"/><rect x="27" width="6" height="60" fill="#00205B"/><rect y="27" width="90" height="6" fill="#00205B"/>`,
  US: `<rect width="90" height="60" fill="#fff"/>${[0,2,4,6,8,10,12].map(i=>`<rect y="${i*4.615}" width="90" height="4.615" fill="#B22234"/>`).join('')}<rect width="40" height="32.3" fill="#3C3B6E"/><g fill="#fff">${[0,1,2,3].map(r=>[0,1,2,3,4,5].map(c=>`<circle cx="${4+c*6.4}" cy="${4+r*8}" r="1.5"/>`).join('')).join('')}</g>`,
  CA: `<rect width="90" height="60" fill="#fff"/><rect width="22" height="60" fill="#FF0000"/><rect x="68" width="22" height="60" fill="#FF0000"/><path d="M45,16 l2,7 6,-2 -3,6 4,2 -5,3 1,5 -5,-3 -5,3 1,-5 -5,-3 4,-2 -3,-6 6,2 z" fill="#FF0000"/>`,
  AU: `<rect width="90" height="60" fill="#00247D"/><rect width="45" height="30" fill="#00247D"/><path d="M0,0 L45,30 M45,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L45,30 M45,0 L0,30" stroke="#CF142B" stroke-width="3"/><rect x="18" width="9" height="30" fill="#fff"/><rect y="10.5" width="45" height="9" fill="#fff"/><rect x="20" width="5" height="30" fill="#CF142B"/><rect y="12.5" width="45" height="5" fill="#CF142B"/><polygon points="${starPts(67,42,8)}" fill="#fff"/>`,
  CO: `<rect width="90" height="60" fill="#FCD116"/><rect y="30" width="90" height="15" fill="#003893"/><rect y="45" width="90" height="15" fill="#CE1126"/>`,
};

const COUNTRY = {
  TR: { name: 'Turkey',        c1: '#E30A17', c2: '#ffffff', ink: '#E30A17' },
  JP: { name: 'Japan',         c1: '#BC002D', c2: '#0b1f3a', ink: '#BC002D' },
  MX: { name: 'Mexico',        c1: '#006847', c2: '#CE1126', ink: '#0c7a4e' },
  FR: { name: 'France',        c1: '#0055A4', c2: '#EF4135', ink: '#2050b8' },
  DE: { name: 'Germany',       c1: '#111111', c2: '#DD0000', ink: '#c9a227' },
  NL: { name: 'Netherlands',   c1: '#AE1C28', c2: '#21468B', ink: '#d8662a' },
  BE: { name: 'Belgium',       c1: '#111111', c2: '#EF3340', ink: '#d4a017' },
  ES: { name: 'Spain',         c1: '#AA151B', c2: '#F1BF00', ink: '#c0392b' },
  PT: { name: 'Portugal',      c1: '#006600', c2: '#FF0000', ink: '#0b7a3b' },
  EN: { name: 'England',       c1: '#CE1124', c2: '#ffffff', ink: '#CE1124' },
  BR: { name: 'Brazil',        c1: '#009C3B', c2: '#FFDF00', ink: '#0aa14a' },
  AR: { name: 'Argentina',     c1: '#75AADB', c2: '#ffffff', ink: '#4a90c4' },
  MA: { name: 'Morocco',       c1: '#C1272D', c2: '#006233', ink: '#C1272D' },
  ZA: { name: 'South Africa',  c1: '#007749', c2: '#FFB915', ink: '#0a8c58' },
  KR: { name: 'South Korea',   c1: '#CD2E3A', c2: '#0047A0', ink: '#CD2E3A' },
  CZ: { name: 'Czechia',       c1: '#11457E', c2: '#D7141A', ink: '#11457E' },
  HR: { name: 'Croatia',       c1: '#FF0000', c2: '#171796', ink: '#e01020' },
  GH: { name: 'Ghana',         c1: '#006B3F', c2: '#FCD116', ink: '#0a8c54' },
  SN: { name: 'Senegal',       c1: '#00853F', c2: '#E31B23', ink: '#0a9a4c' },
  NO: { name: 'Norway',        c1: '#BA0C2F', c2: '#00205B', ink: '#BA0C2F' },
  US: { name: 'USA',           c1: '#3C3B6E', c2: '#B22234', ink: '#2f2e63' },
  CA: { name: 'Canada',        c1: '#FF0000', c2: '#ffffff', ink: '#e01020' },
  AU: { name: 'Australia',     c1: '#00247D', c2: '#CF142B', ink: '#1a3da8' },
  CO: { name: 'Colombia',      c1: '#FCD116', c2: '#003893', ink: '#c79a0e' },
};

// ---------- Flag component ----------
function Flag({ code, w = 60, radius = 4, ring = false, shadow = true, style = {} }) {
  const h = w * (60 / 90) * (style.aspect === '1' ? 1 : 1);
  const inner = FLAGS[code] || `<rect width="90" height="60" fill="#888"/>`;
  return (
    <span style={{
      display: 'inline-block', width: w, height: w * 2 / 3, borderRadius: radius,
      overflow: 'hidden', flex: '0 0 auto',
      boxShadow: (ring ? '0 0 0 2px rgba(255,255,255,.9),' : '') + (shadow ? '0 4px 14px rgba(0,0,0,.28)' : 'none'),
      ...style,
    }}>
      <svg viewBox="0 0 90 60" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
        dangerouslySetInnerHTML={{ __html: inner }} style={{ display: 'block' }} />
    </span>
  );
}

// ---------- atmosphere ----------
// Pitch lines (markings) as an absolutely-positioned overlay.
function Pitch({ color = 'rgba(255,255,255,.16)', stroke = 1.4, style = {} }) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }}>
      <g fill="none" stroke={color} strokeWidth={stroke}>
        <circle cx="200" cy="150" r="58" />
        <circle cx="200" cy="150" r="2.4" fill={color} stroke="none" />
        <line x1="200" y1="-10" x2="200" y2="310" />
        <rect x="-60" y="92" width="120" height="116" />
        <rect x="-60" y="125" width="58" height="50" />
        <rect x="340" y="92" width="120" height="116" />
        <rect x="462" y="125" width="58" height="50" />
      </g>
    </svg>
  );
}

// Floodlight glow beams from the top.
function Floodlights({ tint = 'rgba(255,255,255,.5)', style = {} }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}>
      <div style={{ position: 'absolute', top: '-30%', left: '8%', width: '38%', height: '150%', transform: 'rotate(16deg)', background: `linear-gradient(180deg, ${tint}, transparent 62%)`, filter: 'blur(14px)' }} />
      <div style={{ position: 'absolute', top: '-30%', right: '8%', width: '38%', height: '150%', transform: 'rotate(-16deg)', background: `linear-gradient(180deg, ${tint}, transparent 62%)`, filter: 'blur(14px)' }} />
    </div>
  );
}

// Confetti — deterministic scatter of small rects.
function Confetti({ colors = ['#ff5470', '#ffd166', '#06d6a0', '#4cc9f0', '#fff'], n = 46, seed = 7, style = {} }) {
  const rnd = (i) => { const x = Math.sin(seed * 99 + i * 37.7) * 10000; return x - Math.floor(x); };
  const bits = Array.from({ length: n }, (_, i) => ({
    left: rnd(i) * 100, top: rnd(i + 100) * 100, rot: rnd(i + 200) * 360,
    w: 4 + rnd(i + 300) * 7, h: 7 + rnd(i + 400) * 10,
    c: colors[Math.floor(rnd(i + 500) * colors.length)], o: 0.5 + rnd(i + 600) * 0.5,
    rad: rnd(i + 700) > 0.7 ? '50%' : '1px',
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}>
      {bits.map((b, i) => (
        <span key={i} style={{ position: 'absolute', left: b.left + '%', top: b.top + '%', width: b.w, height: b.h,
          background: b.c, opacity: b.o, borderRadius: b.rad, transform: `rotate(${b.rot}deg)` }} />
      ))}
    </div>
  );
}

// Soft radial halo.
function Halo({ color = 'rgba(255,255,255,.4)', size = '70%', x = '50%', y = '40%', style = {} }) {
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(${size} ${size} at ${x} ${y}, ${color}, transparent 70%)`, ...style }} />;
}

// Generic jersey-back silhouette (no crest, no face). Shows a name + number.
function JerseyBack({ name = 'PLAYER', number = '10', fill = '#ffffff', ink = '#0b1f3a', accent = '#ff5470', w = 220, style = {} }) {
  return (
    <div style={{ position: 'relative', width: w, ...style }}>
      <svg viewBox="0 0 200 230" width="100%" style={{ display: 'block', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,.35))' }}>
        <path d="M62,20 L78,8 Q100,22 122,8 L138,20 L180,44 L162,86 L142,76 L142,210 Q100,222 58,210 L58,76 L38,86 L20,44 Z"
          fill={fill} stroke="rgba(0,0,0,.12)" strokeWidth="1.5" />
        <path d="M78,8 Q100,30 122,8 L116,20 Q100,32 84,20 Z" fill={accent} opacity="0.9" />
      </svg>
      <div style={{ position: 'absolute', top: '34%', left: 0, right: 0, textAlign: 'center', fontFamily: 'Space Mono, monospace', fontWeight: 700, letterSpacing: '1px', color: ink, fontSize: w * 0.07, textTransform: 'uppercase' }}>{name}</div>
      <div style={{ position: 'absolute', top: '44%', left: 0, right: 0, textAlign: 'center', fontFamily: 'Anton, sans-serif', color: ink, fontSize: w * 0.42, lineHeight: 1 }}>{number}</div>
    </div>
  );
}

function Disclaimer({ color = 'rgba(255,255,255,.5)', style = {} }) {
  return <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '.3px', color, ...style }}>FAN-MADE · NOT AFFILIATED WITH FIFA OR ANY OFFICIAL ORGANIZER</div>;
}

function Chip({ children, bg = 'rgba(255,255,255,.14)', color = '#fff', style = {} }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, background: bg, color, fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', ...style }}>{children}</span>;
}

// ---------- tournament data (fan-made fictional draw) ----------
const GROUPS = {
  A: ['MX', 'ZA', 'KR', 'CZ'],
  B: ['TR', 'NL', 'SN', 'HR'],
  C: ['FR', 'NO', 'AU', 'CO'],
  D: ['BR', 'DE', 'MA', 'US'],
  E: ['JP', 'BE', 'GH', 'CA'],
  F: ['AR', 'ES', 'PT', 'EN'],
};
const DATES = ['Jun 13', 'Jun 19', 'Jun 25'];
const TIMES = ['21:00', '18:00', '21:00'];
function groupOf(code) {
  for (const g in GROUPS) {
    if (GROUPS[g].includes(code)) return { group: g, teams: GROUPS[g], opponents: GROUPS[g].filter((c) => c !== code) };
  }
  return { group: 'B', teams: GROUPS.B, opponents: GROUPS.B.filter((c) => c !== 'TR') };
}
// player names as TEXT only (allowed) — no photos, no crests
const PLAYERS = {
  TR: ['GÜLER', 'ÇALHANOĞLU'], JP: ['MITOMA', 'KUBO'], MX: ['LOZANO', 'JIMÉNEZ'],
  FR: ['MBAPPÉ', 'GRIEZMANN'], DE: ['MUSIALA', 'WIRTZ'], NL: ['GAKPO', 'XAVI'],
  BE: ['DE BRUYNE', 'DOKU'], ES: ['YAMAL', 'PEDRI'], PT: ['RONALDO', 'B. FERNANDES'],
  EN: ['KANE', 'BELLINGHAM'], BR: ['VINÍCIUS JR', 'RODRYGO'], AR: ['MESSI', 'ÁLVAREZ'],
  MA: ['HAKIMI', 'ZIYECH'], ZA: ['ZWANE'], KR: ['SON', 'KIM'], CZ: ['SCHICK'],
  HR: ['MODRIĆ'], GH: ['KUDUS'], SN: ['MANÉ'], NO: ['HAALAND', 'ØDEGAARD'],
  US: ['PULISIC'], CA: ['DAVIES'], AU: ['IRVINE'], CO: ['J. RODRÍGUEZ'],
};
function playersOf(code) { return PLAYERS[code] || ['NO. 10']; }

Object.assign(window, { Flag, FLAGS, COUNTRY, Pitch, Floodlights, Confetti, Halo, JerseyBack, Disclaimer, Chip, starPts, GROUPS, DATES, TIMES, groupOf, PLAYERS, playersOf });
