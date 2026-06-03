// wc-cards2.jsx — BOLD ratio-aware poster cards. Exports window.Cards2.
// Every card: full-bleed team color + black zone, grain, halftone, vignette,
// strong floods, varied streamers, one giant focal element, flag, watermark, <=9px disclaimer.
const { Flag: C2Flag, COUNTRY: C2CO, groupOf: c2GroupOf, playersOf: c2Players } = window;
const FX = window.FX;
const { useMemo: c2useMemo } = React;

const C2 = {
  ink: '#0E0C0A', pink: '#FF2D6B', tang: '#FF6A1A', lime: '#C6F23E', sky: '#1FA9F6',
  gold: '#E7C36B', gold2: '#C8962F',
  disp: 'Anton, sans-serif', ui: 'Archivo, sans-serif', mono: '"Space Mono", monospace',
};
const RATIO = { '9:16': 16 / 9, '1:1': 1, '16:9': 9 / 16 };
function shade(hex, pct) {
  const n = parseInt(hex.replace('#', ''), 16); let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; const f = pct / 100;
  r = Math.round(r + (f > 0 ? 255 - r : r) * f); g = Math.round(g + (f > 0 ? 255 - g : g) * f); b = Math.round(b + (f > 0 ? 255 - b : b) * f);
  return `rgb(${Math.max(0, Math.min(255, r))},${Math.max(0, Math.min(255, g))},${Math.max(0, Math.min(255, b))})`;
}

// ───────── frame: applies background zones + all texture layers ─────────
function Frame({ accent = '#E30A17', ratio = '9:16', w = 540, theme = 'color', pro = false, seed = 7, streamers = true, children }) {
  const h = w * RATIO[ratio]; const s = Math.min(w, h) / 540;
  const tall = ratio === '9:16', wide = ratio === '16:9';
  const night = theme === 'night';
  // base gradient
  const base = night
    ? `radial-gradient(120% 90% at 50% -8%, #1a1712, #0b0908 62%)`
    : `linear-gradient(155deg, ${shade(accent, 8)}, ${shade(accent, -34)})`;
  // black focus zone direction depends on ratio
  const zone = wide
    ? `linear-gradient(to left, ${C2.ink} 0%, ${C2.ink}cc 30%, transparent 64%)`
    : `linear-gradient(to top, ${C2.ink} 2%, ${C2.ink}cc 26%, transparent 62%)`;
  const floodTint = night ? 'rgba(231,195,107,.4)' : 'rgba(255,248,222,.46)';
  // contrast-aware pop color for highlight text (team color can clash with team-color bg)
  const _lum = (() => { const n = parseInt(String(accent).replace('#', ''), 16); if (isNaN(n)) return 0.4; const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255; return 0.299 * r + 0.587 * g + 0.114 * b; })();
  const pop = night ? C2.gold : (_lum > 0.6 ? '#0E0C0A' : C2.lime);
  return (
    <div style={{ width: w, height: h, position: 'relative', overflow: 'hidden', background: base, fontFamily: C2.ui, color: '#fff' }}>
      <div style={{ position: 'absolute', inset: 0, background: zone }} />
      <FX.Floods tint={floodTint} />
      <FX.PitchArc color={night ? 'rgba(231,195,107,.12)' : 'rgba(255,255,255,.13)'} stroke={2 * s} style={{ opacity: .8 }} />
      <FX.Halftone color={night ? 'rgba(231,195,107,.16)' : 'rgba(0,0,0,.2)'} size={8 * s} fade="to top" />
      {streamers && <FX.Streamers n={tall ? 34 : 26} seed={seed} colors={night ? ['#E7C36B', '#fff', '#C8962F'] : [C2.pink, C2.gold, C2.lime, C2.sky, '#fff']} style={{ opacity: night ? .5 : .8 }} />}
      <FX.Vignette strength={night ? 0.62 : 0.5} />
      <FX.Grain opacity={0.13} />
      {night && <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 ${2 * s}px rgba(231,195,107,.4)`, pointerEvents: 'none' }} />}
      {/* content */}
      <div style={{ position: 'absolute', inset: 0, padding: (wide ? 30 : 32) * s, display: 'flex', flexDirection: 'column' }}>
        {children({ s, tall, wide, sq: ratio === '1:1', night, accent: pop, team: accent })}
      </div>
      {/* footer: disclaimer + watermark */}
      <div style={{ position: 'absolute', left: 32 * s, right: 32 * s, bottom: 12 * s, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <FX.Disc2 light s={s} style={{ maxWidth: '64%' }} />
        <FX.Watermark light s={s} hidden={pro} />
      </div>
    </div>
  );
}

function Kick({ children, color = '#fff', s = 1, style = {} }) {
  return <div style={{ fontFamily: C2.mono, fontWeight: 700, fontSize: 12 * s, letterSpacing: 2 * s, textTransform: 'uppercase', color, opacity: .92, ...style }}>{children}</div>;
}

// ════════════════════ COUNTRY ROAD ════════════════════
function Road({ code = 'TR', ratio = '9:16', w = 540, theme = 'color', pro = false }) {
  const c = C2CO[code]; const { group, opponents } = c2GroupOf(code);
  return (
    <Frame accent={c.c1} ratio={ratio} w={w} theme={theme} pro={pro} seed={3}>
      {({ s, wide, night, accent }) => {
        const rows = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 * s, width: wide ? '46%' : 'auto' }}>
            {opponents.map((o, i) => (
              <div key={o} style={{ display: 'flex', alignItems: 'center', gap: 11 * s, background: 'rgba(255,255,255,.1)', borderRadius: 12 * s, padding: `${9 * s}px ${12 * s}px`, backdropFilter: 'blur(4px)' }}>
                <span style={{ fontFamily: C2.disp, fontSize: 22 * s, width: 22 * s, color: accent }}>{i + 1}</span>
                <C2Flag code={o} w={38 * s} radius={4} />
                <span style={{ fontFamily: C2.ui, fontWeight: 800, fontSize: 17 * s, flex: 1, textTransform: 'uppercase', lineHeight: 1 }}>{C2CO[o].name}</span>
                <span style={{ fontFamily: C2.mono, fontSize: 10 * s, opacity: .7 }}>MD{i + 1}</span>
              </div>
            ))}
          </div>
        );
        const head = (
          <div>
            <Kick s={s} color={accent}>Road to 2026 · Group {group}</Kick>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 * s, marginTop: 12 * s }}>
              <C2Flag code={code} w={70 * s} ring radius={7} />
              <div style={{ fontFamily: C2.disp, fontSize: 22 * s, lineHeight: .92, textTransform: 'uppercase', color: accent }}>The Road<br />Starts Here</div>
            </div>
            <div style={{ fontFamily: C2.disp, fontSize: (wide ? 84 : 96) * s, lineHeight: .86, textTransform: 'uppercase', letterSpacing: -1 * s, marginTop: 20 * s, textShadow: '0 10px 34px rgba(0,0,0,.4)' }}>{c.name}</div>
          </div>
        );
        if (wide) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 * s }}><div style={{ flex: 1 }}>{head}</div>{rows}</div>;
        return <React.Fragment>{head}<div style={{ marginTop: 'auto', paddingBottom: 16 * s }}>{rows}</div></React.Fragment>;
      }}
    </Frame>
  );
}

// ════════════════════ PREDICTION BATTLE ════════════════════
function Prediction({ a = 'MX', b = 'ZA', scoreA = 2, scoreB = 1, ratio = '9:16', w = 540, theme = 'color', pro = false }) {
  const A = C2CO[a], B = C2CO[b]; const { group } = c2GroupOf(a);
  return (
    <Frame accent={A.c1} ratio={ratio} w={w} theme={theme} pro={pro} seed={9} streamers>
      {({ s, tall, night, accent }) => {
        const side = (code, name, score) => (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * s, width: tall ? '100%' : 'auto', flex: tall ? '0 0 auto' : 1 }}>
            <C2Flag code={code} w={92 * s} ring radius={9} />
            <div style={{ fontFamily: C2.disp, fontSize: 22 * s, textTransform: 'uppercase', textAlign: 'center', lineHeight: .96, maxWidth: 200 * s, wordBreak: 'normal', overflowWrap: 'normal' }}>{name}</div>
            <div style={{ fontFamily: C2.disp, fontSize: 70 * s, lineHeight: 1, background: night ? C2.gold : '#fff', color: C2.ink, borderRadius: 14 * s, minWidth: 86 * s, textAlign: 'center', padding: `${2 * s}px ${10 * s}px`, boxShadow: '0 10px 24px rgba(0,0,0,.3)' }}>{score}</div>
          </div>
        );
        const vs = <div style={{ fontFamily: C2.disp, fontSize: 46 * s, color: accent, textShadow: '0 4px 18px rgba(0,0,0,.4)', flex: '0 0 auto' }}>VS</div>;
        return (
          <React.Fragment>
            <div style={{ textAlign: 'center' }}>
              <Kick s={s} color={accent} style={{ textAlign: 'center' }}>Prediction · Group {group}</Kick>
              <div style={{ fontFamily: C2.disp, fontSize: 40 * s, lineHeight: .9, textTransform: 'uppercase', marginTop: 6 * s }}>Drop Your Score</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: tall ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: (tall ? 14 : 12) * s }}>
              {side(a, A.name, scoreA)}{vs}{side(b, B.name, scoreB)}
            </div>
          </React.Fragment>
        );
      }}
    </Frame>
  );
}

// ════════════════════ PLAYER WATCH ════════════════════
function JerseyBack({ name, number, w, ink = '#0E0C0A', fill = '#fff', accent = '#FF2D6B' }) {
  return (
    <div style={{ position: 'relative', width: w }}>
      <svg viewBox="0 0 200 230" width="100%" style={{ display: 'block', filter: 'drop-shadow(0 20px 34px rgba(0,0,0,.5))' }}>
        <path d="M62,20 L78,8 Q100,22 122,8 L138,20 L180,44 L162,86 L142,76 L142,210 Q100,222 58,210 L58,76 L38,86 L20,44 Z" fill={fill} stroke="rgba(0,0,0,.14)" strokeWidth="1.5" />
        <path d="M78,8 Q100,30 122,8 L116,20 Q100,32 84,20 Z" fill={accent} />
      </svg>
      <div style={{ position: 'absolute', top: '33%', left: 0, right: 0, textAlign: 'center', fontFamily: C2.mono, fontWeight: 700, letterSpacing: 1, color: ink, fontSize: w * 0.066, textTransform: 'uppercase' }}>{name}</div>
      <div style={{ position: 'absolute', top: '43%', left: 0, right: 0, textAlign: 'center', fontFamily: C2.disp, color: ink, fontSize: w * 0.42, lineHeight: 1 }}>{number}</div>
    </div>
  );
}
function Player({ name = 'MBAPPÉ', code = 'FR', number = '10', ratio = '9:16', w = 540, theme = 'color', pro = false }) {
  const c = C2CO[code];
  return (
    <Frame accent={c.c1} ratio={ratio} w={w} theme={theme} pro={pro} seed={5} streamers>
      {({ s, tall, wide, night, accent }) => {
        const jersey = <JerseyBack name={name} number={number} w={(wide ? 210 : 230) * s} ink={C2.ink} fill={night ? C2.gold : '#fff'} accent={night ? C2.gold2 : c.c2 || accent} />;
        const ghost = <div style={{ position: 'absolute', top: wide ? '6%' : '4%', left: 0, right: 0, textAlign: 'center', fontFamily: C2.disp, fontSize: 150 * s, lineHeight: .8, color: 'rgba(255,255,255,.06)', textTransform: 'uppercase', whiteSpace: 'nowrap', pointerEvents: 'none' }}>WATCH</div>;
        const label = (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 * s }}>
              <C2Flag code={code} w={52 * s} ring radius={6} />
              <Kick s={s} color={accent}>Player Watch · {c.name}</Kick>
            </div>
            <div style={{ fontFamily: C2.disp, fontSize: (wide ? 92 : 86) * s, lineHeight: .82, textTransform: 'uppercase', letterSpacing: -1 * s, textShadow: '0 10px 30px rgba(0,0,0,.45)', marginTop: 8 * s, wordBreak: 'break-word' }}>{name}</div>
            <div style={{ fontFamily: C2.mono, fontSize: 11 * s, letterSpacing: 2 * s, opacity: .8, marginTop: 6 * s }}>BIG-GAME ENERGY · MATCHDAY 1</div>
          </div>
        );
        if (wide) return <React.Fragment>{ghost}<div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 18 * s }}><div style={{ flex: 1 }}>{label}</div><div style={{ flexShrink: 0 }}>{jersey}</div></div></React.Fragment>;
        return <React.Fragment>{ghost}<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10 * s }}>{jersey}</div><div style={{ marginTop: 'auto', paddingBottom: 16 * s }}>{label}</div></React.Fragment>;
      }}
    </Frame>
  );
}

// ════════════════════ GROUP CHAOS ════════════════════
function Chaos({ code = 'BR', ratio = '9:16', w = 540, theme = 'color', pro = false }) {
  const { group, teams } = c2GroupOf(code);
  return (
    <Frame accent={C2CO[code].c1} ratio={ratio} w={w} theme={theme} pro={pro} seed={8} streamers>
      {({ s, wide, night, accent }) => {
        const grid = (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 * s, width: wide ? '50%' : 'auto' }}>
            {teams.map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9 * s, background: 'rgba(255,255,255,.1)', borderRadius: 11 * s, padding: `${9 * s}px ${10 * s}px`, backdropFilter: 'blur(4px)' }}>
                <C2Flag code={t} w={34 * s} radius={4} />
                <span style={{ fontFamily: C2.disp, fontSize: 19 * s, textTransform: 'uppercase', lineHeight: 1 }}>{C2CO[t].name}</span>
              </div>
            ))}
          </div>
        );
        const title = (
          <div>
            <Kick s={s} color="rgba(255,255,255,.9)">Group Stage</Kick>
            <div style={{ fontFamily: C2.disp, fontSize: (wide ? 84 : 96) * s, lineHeight: .82, textTransform: 'uppercase', letterSpacing: -1 * s, marginTop: 8 * s }}>Group {group}<br /><span style={{ color: night ? C2.gold : C2.lime, textShadow: '0 4px 18px rgba(0,0,0,.45)' }}>is loaded</span></div>
          </div>
        );
        const tag = <div style={{ fontFamily: C2.disp, fontSize: 34 * s, textTransform: 'uppercase', background: night ? C2.gold : '#fff', color: C2.ink, alignSelf: 'flex-start', padding: `${2 * s}px ${12 * s}px`, transform: 'rotate(-2deg)', marginTop: 12 * s }}>Who survives?</div>;
        if (wide) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 18 * s }}><div style={{ flex: 1 }}>{title}{tag}</div>{grid}</div>;
        return <React.Fragment>{title}<div style={{ marginTop: 'auto', paddingBottom: 14 * s }}>{grid}{tag}</div></React.Fragment>;
      }}
    </Frame>
  );
}

// ════════════════════ MATCHDAY MENU ════════════════════
function Menu({ code = 'MX', ratio = '9:16', w = 540, theme = 'color', pro = false }) {
  const { group, teams } = c2GroupOf(code);
  const fix = [[teams[0], teams[1], '17:00'], [teams[2], teams[3], '20:00']];
  return (
    <Frame accent={C2CO[code].c1} ratio={ratio} w={w} theme={theme} pro={pro} seed={2} streamers>
      {({ s, wide, night, accent }) => (
        <React.Fragment>
          <Kick s={s} color={accent}>Matchday Menu</Kick>
          <div style={{ fontFamily: C2.disp, fontSize: (wide ? 56 : 66) * s, lineHeight: .82, textTransform: 'uppercase', marginTop: 6 * s }}>Group {group}<br />Matchday</div>
          <div style={{ marginTop: 'auto', paddingBottom: 14 * s, display: 'flex', flexDirection: 'column', gap: 11 * s }}>
            {fix.map(([a, b, t], i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.1)', borderRadius: 13 * s, padding: `${12 * s}px ${14 * s}px`, display: 'flex', alignItems: 'center', gap: 9 * s, backdropFilter: 'blur(4px)' }}>
                <C2Flag code={a} w={40 * s} radius={4} />
                <span style={{ fontFamily: C2.disp, fontSize: 21 * s, textTransform: 'uppercase', flex: 1, lineHeight: 1 }}>{C2CO[a].name}</span>
                <span style={{ fontFamily: C2.mono, fontSize: 12 * s, color: accent }}>{t}</span>
                <span style={{ fontFamily: C2.disp, fontSize: 21 * s, textTransform: 'uppercase', flex: 1, textAlign: 'right', lineHeight: 1 }}>{C2CO[b].name}</span>
                <C2Flag code={b} w={40 * s} radius={4} />
              </div>
            ))}
          </div>
        </React.Fragment>
      )}
    </Frame>
  );
}

// ════════════════════ GOLDEN BOOT ════════════════════
function Boot({ code = 'FR', ratio = '9:16', w = 540, theme = 'color', pro = false }) {
  let slots = [['MBAPPÉ', 'FR'], ['HAALAND', 'NO'], ['KANE', 'EN'], ['VINÍCIUS JR', 'BR'], ['MESSI', 'AR']];
  if (code && code !== 'FR') { const p = c2Players(code)[0]; slots = [[p, code], ['HAALAND', 'NO'], ['KANE', 'EN'], ['MBAPPÉ', 'FR']]; }
  return (
    <Frame accent={C2CO[code].c1} ratio={ratio} w={w} theme={theme} pro={pro} seed={6} streamers>
      {({ s, night, accent }) => (
        <React.Fragment>
          <Kick s={s} color={accent}>The Debate</Kick>
          <div style={{ fontFamily: C2.disp, fontSize: 50 * s, lineHeight: .88, textTransform: 'uppercase', marginTop: 6 * s }}>Who wins the<br /><span style={{ color: accent }}>Golden Boot?</span></div>
          <div style={{ marginTop: 'auto', paddingBottom: 14 * s, display: 'flex', flexDirection: 'column', gap: 8 * s }}>
            {slots.map(([nm, fc], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 * s, padding: `${9 * s}px ${12 * s}px`, borderRadius: 11 * s, background: i === 0 ? (night ? 'rgba(231,195,107,.24)' : 'rgba(255,255,255,.16)') : 'rgba(255,255,255,.07)', border: i === 0 ? `1.5px solid ${accent}` : '1.5px solid transparent' }}>
                <span style={{ fontFamily: C2.disp, fontSize: 24 * s, width: 22 * s, color: i === 0 ? accent : 'rgba(255,255,255,.6)' }}>{i + 1}</span>
                <C2Flag code={fc} w={34 * s} radius={4} />
                <span style={{ fontFamily: C2.ui, fontWeight: 800, fontSize: 19 * s, flex: 1, textTransform: 'uppercase', lineHeight: 1 }}>{nm}</span>
                {i === 0 && <span style={{ fontFamily: C2.mono, fontSize: 9 * s, color: accent }}>MY PICK ★</span>}
              </div>
            ))}
          </div>
        </React.Fragment>
      )}
    </Frame>
  );
}

// ════════════════════ UPSET WATCH ════════════════════
function Upset({ code = 'JP', ratio = '9:16', w = 540, theme = 'color', pro = false }) {
  const c = C2CO[code]; const { group } = c2GroupOf(code);
  return (
    <Frame accent={c.c1} ratio={ratio} w={w} theme={theme} pro={pro} seed={11} streamers>
      {({ s, wide, night, accent }) => (
        <React.Fragment>
          <Kick s={s} color={accent}>Upset Watch · Group {group}</Kick>
          <C2Flag code={code} w={(wide ? 84 : 100) * s} ring radius={9} style={{ marginTop: 14 * s }} />
          <div style={{ fontFamily: C2.disp, fontSize: (wide ? 70 : 80) * s, lineHeight: .82, textTransform: 'uppercase', marginTop: 16 * s, letterSpacing: -1 * s, textShadow: '0 10px 30px rgba(0,0,0,.45)' }}>{c.name}<br /><span style={{ color: accent }}>Can Shock</span><br />The Group</div>
          <div style={{ marginTop: 'auto', paddingBottom: 16 * s, display: 'flex', gap: 8 * s, flexWrap: 'wrap' }}>
            {['Dark horse', 'No fear', 'Believe ★'].map((t, i) => (
              <span key={t} style={{ fontFamily: C2.mono, fontSize: 11 * s, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', color: i === 2 ? C2.ink : '#fff', background: i === 2 ? accent : 'rgba(255,255,255,.14)', padding: `${7 * s}px ${12 * s}px`, borderRadius: 999 }}>{t}</span>
            ))}
          </div>
        </React.Fragment>
      )}
    </Frame>
  );
}

// ════════════════════ CUSTOM ════════════════════
function Custom({ code = 'AR', headline = 'WE BELIEVE', sub = 'Vamos · 2026', ratio = '9:16', w = 540, theme = 'color', pro = false }) {
  const c = C2CO[code];
  return (
    <Frame accent={c.c1} ratio={ratio} w={w} theme={theme} pro={pro} seed={13} streamers>
      {({ s, night, accent }) => (
        <React.Fragment>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Kick s={s} color={accent}>Fan Card</Kick>
            <C2Flag code={code} w={52 * s} ring radius={6} />
          </div>
          <div style={{ margin: 'auto 0', fontFamily: C2.disp, fontSize: 84 * s, lineHeight: .86, textTransform: 'uppercase', letterSpacing: -1 * s, textShadow: '0 10px 30px rgba(0,0,0,.45)', wordBreak: 'break-word' }}>{headline}</div>
          <div style={{ marginTop: 'auto', paddingBottom: 16 * s, fontFamily: C2.mono, fontSize: 14 * s, letterSpacing: 2 * s, opacity: .85 }}>{(sub || '').toUpperCase()}</div>
        </React.Fragment>
      )}
    </Frame>
  );
}

const CARD_FN = { road: Road, prediction: Prediction, player: Player, chaos: Chaos, menu: Menu, boot: Boot, upset: Upset, custom: Custom };
function RenderCard({ cfg, ratio, w, theme = 'color', pro = false }) {
  const Fn = CARD_FN[cfg.template] || Road;
  return <Fn {...cfg} ratio={ratio} w={w} theme={theme} pro={pro} a={cfg.code} b={cfg.opp} name={cfg.playerName} number={cfg.playerNum} />;
}

window.Cards2 = { Road, Prediction, Player, Chaos, Menu, Boot, Upset, Custom, RenderCard, CARD_FN, C2, RATIO, shade };
