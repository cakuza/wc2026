// wc-app.jsx — Festival interactive prototype (mobile). Exports window.WCApp.
const { Flag, COUNTRY, GROUPS, groupOf, playersOf, Confetti, Pitch, Halo, Floodlights, Disclaimer } = window;
const F = window.Festival; const FT = F.FT; const shade = F.shade;
const { useState, useRef, useEffect } = React;

const TOP = 54; // clear status bar / dynamic island
const ALL_CODES = Object.keys(COUNTRY);

// white-chrome design tokens (clean UI spine; cards carry the loud poster energy)
const WHITE = {
  base: '#FFFFFF', wash: '#F6F4F1', ink: '#0E0C0A', sub: 'rgba(14,12,10,.58)',
  line: 'rgba(14,12,10,.10)',
  pink: '#FF2D6B', tang: '#FF6A1A', lime: '#C6F23E', sky: '#1FA9F6', gold: '#E7C36B',
  disp: 'Anton, sans-serif', ui: 'Archivo, sans-serif', mono: '"Space Mono", monospace',
};

// ───────── primitives ─────────
function Tappable({ children, onClick, style = {}, active = false }) {
  const [down, setDown] = useState(false);
  return (
    <div onClick={onClick}
      onMouseDown={() => setDown(true)} onMouseUp={() => setDown(false)} onMouseLeave={() => setDown(false)}
      style={{ cursor: 'pointer', transition: 'transform .12s ease, filter .12s ease', transform: down ? 'scale(.97)' : 'scale(1)', ...style }}>
      {children}
    </div>
  );
}
function PillBtn({ children, bg = FT.ink, color = '#fff', onClick, style = {}, shadow = true }) {
  return (
    <Tappable onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: bg, color, fontFamily: FT.ui, fontWeight: 800, fontSize: 16, padding: '15px 20px', borderRadius: 16, boxShadow: shadow && bg !== 'transparent' ? '0 8px 20px rgba(20,16,12,.16)' : 'none', ...style }}>
      {children}
    </Tappable>
  );
}
function Kicker({ children, color = FT.pink, style = {} }) {
  return <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color, ...style }}>{children}</div>;
}
// top bar with optional back
function TopBar({ onBack, right, dark = false, title }) {
  const ink = dark ? '#fff' : FT.ink;
  return (
    <div style={{ paddingTop: TOP, paddingLeft: 18, paddingRight: 18, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
      {onBack ? (
        <Tappable onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, background: dark ? 'rgba(255,255,255,.16)' : 'rgba(20,16,12,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="11" height="18" viewBox="0 0 11 18"><path d="M9 1L2 9l7 8" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Tappable>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontFamily: FT.disp, fontSize: 24, color: ink, lineHeight: 1 }}>WC<span style={{ color: FT.pink }}>26</span></span>
          <span style={{ width: 1, height: 16, background: dark ? 'rgba(255,255,255,.3)' : 'rgba(20,16,12,.18)' }}></span>
          <span style={{ fontFamily: FT.mono, fontSize: 10, letterSpacing: '2px', color: dark ? 'rgba(255,255,255,.6)' : FT.sub }}>FAN HUB</span>
        </div>
      )}
      {title && <div style={{ fontFamily: FT.ui, fontWeight: 800, fontSize: 17, color: ink, whiteSpace: 'nowrap' }}>{title}</div>}
      <div style={{ marginLeft: 'auto' }}>{right}</div>
    </div>
  );
}

// render the active studio card — now uses the BOLD Cards2 engine, ratio + theme aware
function StudioCard({ cfg, w, ratio = '9:16', theme = 'color', pro = false }) {
  return window.Cards2.RenderCard({ cfg, ratio, w, theme, pro });
}

// money cards lead: Prediction, Player, Chaos first
const TEMPLATES = [
  { id: 'prediction', name: 'Prediction', tone: WHITE.pink },
  { id: 'player', name: 'Player Watch', tone: WHITE.sky },
  { id: 'chaos', name: 'Group Chaos', tone: WHITE.lime },
  { id: 'road', name: 'Country Road', tone: WHITE.pink },
  { id: 'menu', name: 'Matchday Menu', tone: WHITE.tang },
  { id: 'boot', name: 'Golden Boot', tone: WHITE.gold },
  { id: 'upset', name: 'Upset Watch', tone: WHITE.pink },
  { id: 'custom', name: 'Custom Card', tone: WHITE.ink },
];
const RATIOS = [
  { id: '9:16', label: '9:16', sub: 'Story' },
  { id: '1:1', label: '1:1', sub: 'Square' },
  { id: '16:9', label: '16:9', sub: 'X / feed' },
];

window.WCApp = { Tappable, PillBtn, Kicker, TopBar, StudioCard, TEMPLATES, RATIOS, TOP, ALL_CODES, WHITE };
