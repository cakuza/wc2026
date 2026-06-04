// wc-picker.jsx — Country Picker Overlay for WC26 Hub
// Requires: wc-shared.jsx (window.Flag, window.COUNTRY)
// Exports: window.WCPicker = { CountryPicker, TeamTile, FEATURED_TEAMS }

const { Flag: PkFlag, COUNTRY: PkCOUNTRY } = window;

const PK_GOLD  = '#E7C36B';
const PK_DARK  = '#0E0C0A';
const PK_ANTON = 'var(--font-anton, Anton, sans-serif)';
const PK_MONO  = '"Space Mono", monospace';
const PK_UI    = 'Archivo, system-ui, sans-serif';

const FEATURED_TEAMS = [
  { code: 'BR', color: '#009C3B' },
  { code: 'FR', color: '#1A5CC8' },
  { code: 'EN', color: '#CF1124' },
  { code: 'AR', color: '#5B9DD8' },
  { code: 'DE', color: '#333333' },
  { code: 'ES', color: '#AA151B' },
  { code: 'PT', color: '#006600' },
  { code: 'TR', color: '#E30A17' },
  { code: 'MX', color: '#006847' },
  { code: 'JP', color: '#BC002D' },
  { code: 'MA', color: '#C1272D' },
  { code: 'US', color: '#3C3B6E' },
];

// Grain noise overlay
function PkGrain({ id = 'pk', opacity = 0.36 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
               pointerEvents: 'none', mixBlendMode: 'overlay', display: 'block' }}>
      <filter id={`pknoise-${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#pknoise-${id})`} opacity={opacity} />
    </svg>
  );
}

// Stadium floodlight beams from top corners
function PkBeams() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20%', left: '-8%', width: '54%', height: '115%',
                    background: 'linear-gradient(172deg, rgba(231,195,107,.10) 0%, transparent 50%)',
                    transform: 'rotate(20deg)', filter: 'blur(22px)' }} />
      <div style={{ position: 'absolute', top: '-20%', right: '-8%', width: '54%', height: '115%',
                    background: 'linear-gradient(188deg, rgba(231,195,107,.10) 0%, transparent 50%)',
                    transform: 'rotate(-20deg)', filter: 'blur(22px)' }} />
      <div style={{ position: 'absolute', top: 0, left: '25%', width: '50%', height: '50%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,.032) 0%, transparent 100%)',
                    filter: 'blur(40px)' }} />
    </div>
  );
}

// Individual team tile
function TeamTile({ code, color, size = 120, onClick }) {
  const [hov, setHov] = React.useState(false);
  const name = PkCOUNTRY[code]?.name || code;
  // Show first word only for long names
  const label = name.includes(' ') ? name.split(' ')[0] : name;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick && onClick(code)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: size, height: size,
        background: `linear-gradient(148deg, ${color}ee 0%, ${color}99 100%)`,
        borderRadius: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: Math.round(size * 0.06),
        cursor: 'pointer',
        transform: hov ? 'scale(1.07) translateY(-2px)' : 'scale(1)',
        boxShadow: hov
          ? `0 0 0 2px ${color}cc, 0 14px 36px ${color}66, 0 24px 52px rgba(0,0,0,.52)`
          : '0 4px 18px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.12)',
        transition: 'transform .17s ease, box-shadow .17s ease',
        position: 'relative', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,.08)',
      }}
    >
      {/* Inner highlight */}
      <div style={{ position: 'absolute', inset: 0,
                    background: 'linear-gradient(148deg, rgba(255,255,255,.14) 0%, transparent 55%)',
                    borderRadius: 10 }} />
      <PkFlag code={code} w={Math.round(size * 0.5)} radius={3} shadow={false}
        style={{ position: 'relative', zIndex: 1, boxShadow: '0 3px 10px rgba(0,0,0,.45)' }} />
      <div style={{
        fontFamily: PK_ANTON,
        fontSize: Math.round(size * 0.115),
        color: '#fff',
        textTransform: 'uppercase',
        position: 'relative', zIndex: 1,
        textShadow: '0 1px 5px rgba(0,0,0,.65)',
        lineHeight: 1,
      }}>{label}</div>
    </div>
  );
}

// Full picker overlay
function CountryPicker({ onSelect, onViewAll, width = 1280, height = 820, pickerId = 'main' }) {
  const [query,   setQuery]   = React.useState('');
  const [focused, setFocused] = React.useState('');

  const mobile   = width < 540;
  const tileSize = mobile ? 100 : 120;
  const cols     = mobile ? 2 : 4;
  const cardPad  = mobile ? 22 : 48;
  const cardW    = Math.min(width - (mobile ? 16 : 80), 856);
  const headPx   = mobile ? 30 : Math.min(52, Math.round(width * 0.038));

  const visible = query
    ? FEATURED_TEAMS.filter(({ code }) => {
        const n = (PkCOUNTRY[code]?.name || '').toLowerCase();
        return n.includes(query.toLowerCase()) || code.toLowerCase().includes(query.toLowerCase());
      })
    : FEATURED_TEAMS;

  return (
    <div style={{
      width, height,
      position: 'relative',
      background: '#080604',
      overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: PK_UI,
    }}>
      {/* Crowd depth gradients */}
      <div style={{ position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse 95% 60% at 50% 115%, rgba(48,36,10,.88) 0%, rgba(8,6,4,1) 62%)' }} />
      <div style={{ position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse 72% 50% at 50% -6%, rgba(92,70,16,.28) 0%, transparent 65%)' }} />
      <PkBeams />
      <PkGrain id={pickerId} opacity={0.36} />

      {/* Glass card */}
      <div style={{
        position: 'relative', zIndex: 2,
        background: 'rgba(14,12,10,.84)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,255,255,.12)',
        borderTop: '1px solid rgba(255,255,255,.22)',
        borderRadius: 18,
        padding: cardPad,
        width: cardW,
        boxShadow: '0 44px 100px rgba(0,0,0,.78), inset 0 1px 0 rgba(255,255,255,.06)',
      }}>
        {/* Headline */}
        <div style={{ fontFamily: PK_ANTON, fontSize: headPx, color: '#fff',
                      textTransform: 'uppercase', lineHeight: .9, letterSpacing: '-.5px', marginBottom: 26 }}>
          Which country are you<br />
          <span style={{ color: PK_GOLD }}>cheering for?</span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 28 }}>
          <span style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)',
                         fontSize: 15, color: 'rgba(255,255,255,.3)', pointerEvents: 'none', lineHeight: 1 }}>⚽</span>
          <input
            type="text"
            placeholder="Search for your country…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              display: 'block', width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,.05)',
              border: `2px solid ${focused ? PK_GOLD : 'rgba(255,255,255,.12)'}`,
              borderRadius: 8,
              padding: '13px 18px 13px 44px',
              fontFamily: PK_UI, fontSize: 15,
              color: '#fff', outline: 'none',
              boxShadow: focused ? `0 0 0 3px ${PK_GOLD}28` : 'none',
              transition: 'border-color .15s, box-shadow .15s',
            }}
          />
        </div>

        {/* Team grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
          gap: 10,
          justifyContent: 'center',
        }}>
          {visible.map(({ code, color }) => (
            <TeamTile key={code} code={code} color={color} size={tileSize} onClick={onSelect} />
          ))}
        </div>

        {/* See all */}
        <div
          onClick={onViewAll}
          style={{ marginTop: 24, textAlign: 'center', fontFamily: PK_ANTON, fontSize: 15,
                   color: PK_GOLD, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}
        >
          See all 48 teams →
        </div>

        <div style={{ marginTop: 14, textAlign: 'center', fontFamily: PK_MONO, fontSize: 9,
                      letterSpacing: '.4px', color: 'rgba(255,255,255,.22)' }}>
          FAN-MADE · NOT AFFILIATED WITH FIFA OR ANY OFFICIAL ORGANIZER
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WCPicker: { CountryPicker, TeamTile, FEATURED_TEAMS } });
