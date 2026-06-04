// wc-festival.jsx — Direction 1: BRIGHT TOURNAMENT FESTIVAL (lead).
// White/vivid, confetti, celebratory, color-blocked. Exports window.Festival.
const { Flag, COUNTRY, Pitch, Floodlights, Confetti, Halo, JerseyBack, Disclaimer, Chip } = window;

const FT = {
  paper: '#FBF6EC',
  card: '#ffffff',
  ink: '#14100C',
  sub: 'rgba(20,16,12,.6)',
  line: 'rgba(20,16,12,.10)',
  pink: '#FF2D6B',
  tang: '#FF7A1A',
  sun: '#FFC524',
  grass: '#11B886',
  sky: '#1FA9F6',
  violet: '#6C4CFF',
  disp: 'Anton, sans-serif',
  ui: 'Archivo, sans-serif',
  mono: '"Space Mono", monospace',
};

// kicker label
function Kick({ children, color = FT.pink, style = {} }) {
  return <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color, ...style }}>{children}</div>;
}
function Btn({ children, bg = FT.ink, color = '#fff', big = false, style = {} }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap', background: bg, color, fontFamily: FT.ui, fontWeight: 800, fontSize: big ? 17 : 14, letterSpacing: '.2px', padding: big ? '16px 26px' : '11px 18px', borderRadius: 999, ...style }}>{children}</span>;
}

// ───────── share-card: Country Road ─────────
function FCardRoad({ code = 'TR', w = 540 }) {
  const c = COUNTRY[code]; const s = w / 540;
  const { group, opponents: opp } = window.groupOf(code);
  return (
    <div style={{ width: w, height: w * 16 / 9, position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, ${c.c1}, ${shade(c.c1, -22)})`, fontFamily: FT.ui }}>
      <Halo color="rgba(255,255,255,.30)" x="50%" y="20%" size="80%" />
      <Pitch color="rgba(255,255,255,.13)" />
      <Confetti n={30} seed={3} style={{ opacity: .85 }} />
      <Floodlights tint="rgba(255,255,255,.28)" />
      <div style={{ position: 'absolute', inset: 0, padding: 34 * s, display: 'flex', flexDirection: 'column', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Kick color="rgba(255,255,255,.85)">Road to 2026</Kick>
          <Chip bg="rgba(255,255,255,.18)" style={{ fontSize: 10 }}>Save this ★</Chip>
        </div>
        <div style={{ marginTop: 18 * s, display: 'flex', alignItems: 'center', gap: 16 * s }}>
          <Flag code={code} w={92 * s} ring radius={8} />
          <div>
            <div style={{ fontFamily: FT.mono, fontSize: 12 * s, letterSpacing: '2px', opacity: .8, whiteSpace: 'nowrap' }}>GROUP {group} · MATCHDAYS 1–3</div>
            <div style={{ fontFamily: FT.disp, fontSize: 30 * s, lineHeight: .96, textTransform: 'uppercase', letterSpacing: '.5px' }}>The Road<br />Starts Here</div>
          </div>
        </div>
        <div style={{ fontFamily: FT.disp, fontSize: 78 * s, lineHeight: .84, textTransform: 'uppercase', marginTop: 'auto', letterSpacing: '-1px', textShadow: '0 8px 30px rgba(0,0,0,.25)', whiteSpace: 'nowrap' }}>{c.name}</div>
        <div style={{ marginTop: 18 * s, display: 'flex', flexDirection: 'column', gap: 10 * s }}>
          {opp.map((o, i) => (
            <div key={o} style={{ display: 'flex', alignItems: 'center', gap: 12 * s, background: 'rgba(255,255,255,.13)', backdropFilter: 'blur(6px)', borderRadius: 14 * s, padding: `${11 * s}px ${14 * s}px` }}>
              <span style={{ fontFamily: FT.disp, fontSize: 22 * s, width: 30 * s, color: FT.sun }}>{i + 1}</span>
              <Flag code={o} w={42 * s} radius={5} />
              <span style={{ fontFamily: FT.ui, fontWeight: 800, fontSize: 17 * s, flex: 1, textTransform: 'uppercase', letterSpacing: '.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>vs {COUNTRY[o].name}</span>
              <span style={{ fontFamily: FT.mono, fontSize: 11 * s, opacity: .8 }}>MD{i + 1}</span>
            </div>
          ))}
        </div>
        <Disclaimer color="rgba(255,255,255,.6)" style={{ marginTop: 18 * s, fontSize: 9 * s }} />
      </div>
    </div>
  );
}

// ───────── share-card: Prediction Battle ─────────
function FCardPrediction({ a = 'MX', b = 'ZA', scoreA = 2, scoreB = 1, w = 540 }) {
  const s = w / 540; const A = COUNTRY[a], B = COUNTRY[b];
  const { group } = window.groupOf(a);
  return (
    <div style={{ width: w, height: w * 16 / 9, position: 'relative', overflow: 'hidden', background: FT.ink, fontFamily: FT.ui }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <div style={{ flex: 1, background: `linear-gradient(180deg, ${A.c1}, ${shade(A.c1, -28)})` }} />
        <div style={{ flex: 1, background: `linear-gradient(180deg, ${B.c1}, ${shade(B.c1, -28)})` }} />
      </div>
      <Confetti n={26} seed={9} style={{ opacity: .7 }} />
      <Pitch color="rgba(255,255,255,.10)" />
      <div style={{ position: 'absolute', inset: 0, padding: 32 * s, display: 'flex', flexDirection: 'column', color: '#fff', textAlign: 'center' }}>
        <Kick color="rgba(255,255,255,.9)" style={{ textAlign: 'center' }}>Prediction · Group {group}</Kick>
        <div style={{ fontFamily: FT.disp, fontSize: 38 * s, lineHeight: .9, textTransform: 'uppercase', marginTop: 8 * s }}>Drop Your<br />Score</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 * s, marginTop: 'auto' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Flag code={a} w={104 * s} ring radius={10} style={{ margin: '0 auto' }} />
            <div style={{ fontFamily: FT.disp, fontSize: 22 * s, textTransform: 'uppercase', marginTop: 10 * s, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{A.name}</div>
            <div style={{ fontFamily: FT.disp, fontSize: 72 * s, lineHeight: 1, background: '#fff', color: FT.ink, borderRadius: 16 * s, marginTop: 8 * s, padding: `${4 * s}px 0` }}>{scoreA}</div>
          </div>
          <div style={{ fontFamily: FT.disp, fontSize: 40 * s, color: FT.sun }}>VS</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Flag code={b} w={104 * s} ring radius={10} style={{ margin: '0 auto' }} />
            <div style={{ fontFamily: FT.disp, fontSize: 22 * s, textTransform: 'uppercase', marginTop: 10 * s, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{B.name}</div>
            <div style={{ fontFamily: FT.disp, fontSize: 72 * s, lineHeight: 1, background: '#fff', color: FT.ink, borderRadius: 16 * s, marginTop: 8 * s, padding: `${4 * s}px 0` }}>{scoreB}</div>
          </div>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <Chip bg="rgba(255,255,255,.16)" style={{ fontSize: 11 * s }}>My call ★</Chip>
          <Disclaimer color="rgba(255,255,255,.55)" style={{ marginTop: 14 * s, fontSize: 9 * s }} />
        </div>
      </div>
    </div>
  );
}

// ───────── share-card: Player Watch ─────────
function FCardPlayer({ name = 'MBAPPÉ', code = 'FR', number = '10', w = 540 }) {
  const s = w / 540; const c = COUNTRY[code];
  return (
    <div style={{ width: w, height: w * 16 / 9, position: 'relative', overflow: 'hidden', background: `linear-gradient(165deg, ${shade(c.c1, 10)}, ${shade(c.c1, -34)})`, fontFamily: FT.ui }}>
      <Halo color="rgba(255,255,255,.34)" x="50%" y="58%" size="70%" />
      <Floodlights tint="rgba(255,255,255,.3)" />
      <Confetti n={22} seed={5} colors={['#fff', FT.sun]} style={{ opacity: .55 }} />
      <div style={{ position: 'absolute', top: 30 * s, left: 0, right: 0, textAlign: 'center', color: '#fff' }}>
        <Kick color="rgba(255,255,255,.85)" style={{ textAlign: 'center' }}>Player Watch · {c.name}</Kick>
      </div>
      <div style={{ position: 'absolute', top: '8%', left: 0, right: 0, textAlign: 'center', fontFamily: FT.disp, fontSize: 130 * s, lineHeight: .8, color: 'rgba(255,255,255,.08)', textTransform: 'uppercase' }}>WATCH</div>
      <div style={{ position: 'absolute', top: '24%', left: '50%', transform: 'translateX(-50%)' }}>
        <JerseyBack name={name} number={number} fill="#fff" ink={c.ink} accent={c.c2} w={232 * s} />
      </div>
      <div style={{ position: 'absolute', bottom: 30 * s, left: 30 * s, right: 30 * s, textAlign: 'center', color: '#fff' }}>
        <Flag code={code} w={56 * s} radius={6} style={{ margin: '0 auto 12px' }} />
        <div style={{ fontFamily: FT.disp, fontSize: 78 * s, lineHeight: .82, textTransform: 'uppercase', letterSpacing: '-.5px', textShadow: '0 8px 28px rgba(0,0,0,.3)' }}>{name}</div>
        <div style={{ fontFamily: FT.mono, fontSize: 12 * s, letterSpacing: '2px', opacity: .8, marginTop: 8 * s }}>BIG-GAME ENERGY · MATCHDAY 1</div>
        <Disclaimer color="rgba(255,255,255,.5)" style={{ marginTop: 12 * s, fontSize: 9 * s }} />
      </div>
    </div>
  );
}

// small poster preview tile (used in hero)
function PreviewTile({ kind, w, rot = 0, lift = 0 }) {
  const map = { road: <FCardRoad code="TR" w={w} />, upset: <FCardUpset w={w} />, menu: <FCardMenu w={w} /> };
  return (
    <div style={{ borderRadius: 18, overflow: 'hidden', transform: `rotate(${rot}deg) translateY(${lift}px)`, boxShadow: '0 30px 60px rgba(20,16,12,.28), 0 8px 18px rgba(20,16,12,.16)' }}>{map[kind]}</div>
  );
}

// Upset Watch card
function FCardUpset({ code = 'JP', w = 540 }) {
  const s = w / 540; const c = COUNTRY[code];
  const { group } = window.groupOf(code);
  return (
    <div style={{ width: w, height: w * 16 / 9, position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, ${shade(c.c1, 6)}, ${shade(c.c1, -40)})`, fontFamily: FT.ui }}>
      <Pitch color="rgba(255,255,255,.12)" />
      <Confetti n={24} seed={11} colors={['#fff', FT.sun, FT.pink]} style={{ opacity: .7 }} />
      <Halo color="rgba(255,255,255,.28)" y="30%" />
      <div style={{ position: 'absolute', inset: 0, padding: 34 * s, color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <Kick color={FT.sun}>Upset Watch</Kick>
        <Flag code={code} w={108 * s} ring radius={10} style={{ marginTop: 16 * s }} />
        <div style={{ fontFamily: FT.disp, fontSize: 76 * s, lineHeight: .84, textTransform: 'uppercase', marginTop: 18 * s, letterSpacing: '-1px' }}><span style={{ whiteSpace: 'nowrap' }}>{c.name}</span><br /><span style={{ color: FT.sun }}>Can Shock</span><br />The Group</div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 8 * s, flexWrap: 'wrap' }}>
          <Chip bg="rgba(255,255,255,.16)" style={{ fontSize: 11 * s }}>Dark horse</Chip>
          <Chip bg="rgba(255,255,255,.16)" style={{ fontSize: 11 * s }}>Group {group}</Chip>
          <Chip bg={FT.pink} style={{ fontSize: 11 * s }}>Believe ★</Chip>
        </div>
        <Disclaimer color="rgba(255,255,255,.5)" style={{ marginTop: 16 * s, fontSize: 9 * s }} />
      </div>
    </div>
  );
}

// Matchday Menu card
function FCardMenu({ code = 'MX', w = 540 }) {
  const s = w / 540;
  const { group, teams } = window.groupOf(code);
  const fix = [[teams[0], teams[1], '17:00'], [teams[2], teams[3], '20:00']];
  return (
    <div style={{ width: w, height: w * 16 / 9, position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, ${FT.tang}, ${shade(FT.pink, -10)})`, fontFamily: FT.ui }}>
      <Confetti n={26} seed={2} style={{ opacity: .55 }} />
      <Halo color="rgba(255,255,255,.26)" y="22%" />
      <div style={{ position: 'absolute', inset: 0, padding: 34 * s, color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <Kick color="rgba(255,255,255,.9)">Matchday Menu</Kick>
        <div style={{ fontFamily: FT.disp, fontSize: 72 * s, lineHeight: .86, textTransform: 'uppercase', marginTop: 8 * s, letterSpacing: '-.5px' }}>Group {group}<br />Matchday</div>
        <div style={{ marginTop: 24 * s, display: 'flex', flexDirection: 'column', gap: 14 * s }}>
          {fix.map(([a, b, t], i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.14)', borderRadius: 16 * s, padding: `${14 * s}px ${16 * s}px`, display: 'flex', alignItems: 'center', gap: 10 * s }}>
              <Flag code={a} w={44 * s} radius={5} />
              <span style={{ fontFamily: FT.disp, fontSize: 21 * s, textTransform: 'uppercase', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{COUNTRY[a].name}</span>
              <span style={{ fontFamily: FT.mono, fontSize: 12 * s, opacity: .7 }}>{t}</span>
              <span style={{ fontFamily: FT.disp, fontSize: 21 * s, textTransform: 'uppercase', flex: 1, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{COUNTRY[b].name}</span>
              <Flag code={b} w={44 * s} radius={5} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', fontFamily: FT.mono, fontSize: 12 * s, opacity: .85 }}>★ SAVE THE MATCHUPS · LOCAL TIME</div>
        <Disclaimer color="rgba(255,255,255,.55)" style={{ marginTop: 12 * s, fontSize: 9 * s }} />
      </div>
    </div>
  );
}

// Golden Boot Debate card
function FCardBoot({ code = 'FR', w = 540 }) {
  const s = w / 540;
  const slots = [['MBAPPÉ', 'FR'], ['HAALAND', 'NO'], ['KANE', 'EN'], ['VINÍCIUS JR', 'BR'], ['MESSI', 'AR']];
  if (code && code !== 'FR') { const p = window.playersOf(code)[0]; slots.unshift([p, code]); slots.pop(); }
  return (
    <div style={{ width: w, height: w * 16 / 9, position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, ${FT.violet}, ${shade(FT.violet, -32)})`, fontFamily: FT.ui }}>
      <Confetti n={22} seed={6} colors={['#fff', FT.sun]} style={{ opacity: .6 }} />
      <Halo color="rgba(255,255,255,.22)" y="16%" />
      <div style={{ position: 'absolute', inset: 0, padding: 34 * s, color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <Kick color={FT.sun}>The Debate</Kick>
        <div style={{ fontFamily: FT.disp, fontSize: 52 * s, lineHeight: .9, textTransform: 'uppercase', marginTop: 8 * s }}>Who wins the<br /><span style={{ color: FT.sun }}>Golden Boot?</span></div>
        <div style={{ marginTop: 20 * s, display: 'flex', flexDirection: 'column', gap: 9 * s }}>
          {slots.map(([nm, fc], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 * s, padding: `${10 * s}px ${13 * s}px`, borderRadius: 12 * s, background: i === 0 ? 'rgba(255,197,36,.22)' : 'rgba(255,255,255,.1)', border: i === 0 ? `1.5px solid ${FT.sun}` : '1.5px solid transparent' }}>
              <span style={{ fontFamily: FT.disp, fontSize: 26 * s, width: 26 * s, color: i === 0 ? FT.sun : 'rgba(255,255,255,.6)' }}>{i + 1}</span>
              <Flag code={fc} w={40 * s} radius={4} />
              <span style={{ fontFamily: FT.ui, fontWeight: 800, fontSize: 20 * s, flex: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nm}</span>
              {i === 0 && <span style={{ fontFamily: FT.mono, fontSize: 10 * s, color: FT.sun }}>MY PICK ★</span>}
            </div>
          ))}
        </div>
        <Disclaimer color="rgba(255,255,255,.5)" style={{ marginTop: 'auto', fontSize: 9 * s }} />
      </div>
    </div>
  );
}

// Group Chaos card
function FCardChaos({ code = 'BR', w = 540 }) {
  const s = w / 540;
  const { group, teams } = window.groupOf(code);
  return (
    <div style={{ width: w, height: w * 16 / 9, position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, ${FT.sky}, ${shade(FT.violet, -16)})`, fontFamily: FT.ui }}>
      <Confetti n={28} seed={8} style={{ opacity: .7 }} />
      <Pitch color="rgba(255,255,255,.12)" />
      <div style={{ position: 'absolute', inset: 0, padding: 34 * s, color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <Kick color="rgba(255,255,255,.9)">Group Stage</Kick>
        <div style={{ fontFamily: FT.disp, fontSize: 90 * s, lineHeight: .82, textTransform: 'uppercase', marginTop: 10 * s, letterSpacing: '-1px' }}>Group {group}<br /><span style={{ color: FT.sun }}>is loaded</span></div>
        <div style={{ marginTop: 22 * s, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 * s }}>
          {teams.map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9 * s, background: 'rgba(255,255,255,.14)', borderRadius: 12 * s, padding: `${9 * s}px ${11 * s}px` }}>
              <Flag code={t} w={38 * s} radius={4} />
              <span style={{ fontFamily: FT.disp, fontSize: 20 * s, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{COUNTRY[t].name}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', fontFamily: FT.disp, fontSize: 34 * s, textTransform: 'uppercase', background: '#fff', color: FT.ink, alignSelf: 'flex-start', padding: `${2 * s}px ${12 * s}px`, transform: 'rotate(-2deg)' }}>Who survives?</div>
        <Disclaimer color="rgba(255,255,255,.55)" style={{ marginTop: 14 * s, fontSize: 9 * s }} />
      </div>
    </div>
  );
}

// Custom Fan Card — editable headline
function FCardCustom({ code = 'AR', headline = 'WE BELIEVE', sub = 'Vamos · 2026', w = 540 }) {
  const s = w / 540; const c = COUNTRY[code];
  return (
    <div style={{ width: w, height: w * 16 / 9, position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, ${c.c1}, ${shade(c.c1, -30)})`, fontFamily: FT.ui }}>
      <Halo color="rgba(255,255,255,.3)" y="34%" />
      <Floodlights tint="rgba(255,255,255,.26)" />
      <Confetti n={26} seed={13} style={{ opacity: .7 }} />
      <div style={{ position: 'absolute', inset: 0, padding: 34 * s, color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Kick color="rgba(255,255,255,.85)">Fan Card</Kick>
          <Flag code={code} w={56 * s} ring radius={6} />
        </div>
        <div style={{ margin: 'auto 0', fontFamily: FT.disp, fontSize: 88 * s, lineHeight: .86, textTransform: 'uppercase', letterSpacing: '-1px', textShadow: '0 8px 28px rgba(0,0,0,.3)', wordBreak: 'break-word' }}>{headline}</div>
        <div style={{ fontFamily: FT.mono, fontSize: 14 * s, letterSpacing: '2px', opacity: .85, marginTop: 'auto' }}>{(sub || '').toUpperCase()}</div>
        <Disclaimer color="rgba(255,255,255,.5)" style={{ marginTop: 12 * s, fontSize: 9 * s }} />
      </div>
    </div>
  );
}

// color shade helper
function shade(hex, pct) {
  const n = parseInt(hex.replace('#', ''), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = pct / 100;
  r = Math.round(r + (f > 0 ? 255 - r : r) * f);
  g = Math.round(g + (f > 0 ? 255 - g : g) * f);
  b = Math.round(b + (f > 0 ? 255 - b : b) * f);
  return `rgb(${Math.max(0, Math.min(255, r))},${Math.max(0, Math.min(255, g))},${Math.max(0, Math.min(255, b))})`;
}

// ───────────────────────── HOMEPAGE (desktop) ─────────────────────────
function FNav({ dark = false }) {
  const col = dark ? '#fff' : FT.ink;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 44px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: FT.disp, fontSize: 26, color: col, letterSpacing: '.5px', lineHeight: 1 }}>WC<span style={{ color: FT.pink }}>26</span></span>
        <span style={{ width: 1, height: 18, background: dark ? 'rgba(255,255,255,.3)' : 'rgba(20,16,12,.18)' }} />
        <span style={{ fontFamily: FT.mono, fontSize: 11, letterSpacing: '2px', color: dark ? 'rgba(255,255,255,.65)' : FT.sub }}>FAN HUB</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 30, fontFamily: FT.ui, fontWeight: 700, fontSize: 14, color: col }}>
        <span>Countries</span><span>Cards</span><span>Matchday</span>
        <Btn bg={FT.pink}>Create a fan card</Btn>
      </div>
    </div>
  );
}

function FestHome() {
  return (
    <div style={{ width: 1280, background: FT.paper, fontFamily: FT.ui, color: FT.ink }}>
      <FNav />
      {/* hero */}
      <div style={{ position: 'relative', padding: '20px 44px 60px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 30, alignItems: 'start' }}>
          <div style={{ paddingTop: 12 }}>
            <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginBottom: 22 }}>
              <Chip bg={FT.ink} color="#fff" style={{ fontSize: 11 }}>★ 48 teams · 12 groups</Chip>
              <Chip bg="rgba(20,16,12,.07)" color={FT.ink} style={{ fontSize: 11 }}>Fan-made</Chip>
            </div>
            <div style={{ fontFamily: FT.disp, fontSize: 54, lineHeight: 1.06, textTransform: 'uppercase', letterSpacing: '-.5px', whiteSpace: 'nowrap' }}>
              <div>Pick your <span style={{ color: FT.pink }}>country.</span></div>
              <div>Build the <span style={{ color: FT.tang }}>hype.</span></div>
              <div>Share the <span style={{ color: FT.grass }}>road.</span></div>
            </div>
            <div style={{ fontSize: 17.5, lineHeight: 1.5, color: FT.sub, marginTop: 22, maxWidth: 466 }}>
              Create fan-made World Cup 2026 posters for any of 48 teams — country roads, prediction battles, player-watch cards, and group-stage matchups.
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 30 }}>
              <Btn big bg={FT.ink}>Create a fan card →</Btn>
              <Btn big bg="transparent" color={FT.ink} style={{ boxShadow: 'inset 0 0 0 2px rgba(20,16,12,.18)' }}>Pick your country</Btn>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 30, alignItems: 'center' }}>
              <span style={{ fontFamily: FT.mono, fontSize: 12, color: FT.sub, letterSpacing: '1px' }}>TRENDING</span>
              {['BR', 'AR', 'FR', 'EN', 'MX', 'JP', 'MA', 'TR'].map((c) => <Flag key={c} code={c} w={34} radius={4} />)}
            </div>
          </div>
          {/* poster previews */}
          <div style={{ position: 'relative', height: 640, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: '-4%', top: 24, zIndex: 1 }}><PreviewTile kind="upset" w={208} rot={-7} /></div>
            <div style={{ position: 'absolute', right: '-4%', top: 96, zIndex: 1 }}><PreviewTile kind="menu" w={208} rot={7} /></div>
            <div style={{ position: 'relative', zIndex: 3 }}><PreviewTile kind="road" w={262} /></div>
          </div>
        </div>
      </div>
      {/* labels strip for the 3 previews */}
      <div style={{ display: 'flex', gap: 16, padding: '0 44px 30px' }}>
        {[['Turkey Road to Glory', FT.pink], ['Japan Upset Watch', FT.sky], ['Mexico Matchday Menu', FT.tang]].map(([t, c]) => (
          <div key={t} style={{ flex: 1, background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 1px 0 rgba(20,16,12,.06), 0 10px 30px rgba(20,16,12,.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
            <span style={{ fontFamily: FT.ui, fontWeight: 800, fontSize: 16 }}>{t}</span>
            <span style={{ marginLeft: 'auto', fontFamily: FT.mono, fontSize: 12, color: FT.sub }}>Open →</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '0 44px 36px' }}><Disclaimer color={FT.sub} /></div>
    </div>
  );
}

// ───────────────────────── CARDS PAGE (desktop) ─────────────────────────
function FestCards() {
  const templates = [
    ['Country Road Poster', 'Your team\u2019s full group path', FT.pink, 'TR'],
    ['Matchday Menu', 'Every kickoff, your local time', FT.tang, 'MX'],
    ['Prediction Battle', 'Drop your scoreline', FT.violet, 'ZA'],
    ['Golden Boot Debate', 'Rank the scorers', FT.sun, 'FR'],
    ['Player Watch', 'Big-name, big-game energy', FT.sky, 'BR'],
    ['Group Chaos', 'Who survives the group?', FT.grass, 'DE'],
    ['Upset Watch', 'Back the dark horse', FT.pink, 'JP'],
    ['Custom Fan Card', 'Your words, your flag', FT.ink, 'AR'],
  ];
  return (
    <div style={{ width: 1280, background: FT.paper, fontFamily: FT.ui, color: FT.ink }}>
      <FNav />
      <div style={{ padding: '14px 44px 40px' }}>
        <Kick>The money page · poster studio</Kick>
        <div style={{ fontFamily: FT.disp, fontSize: 64, lineHeight: 1.08, textTransform: 'uppercase', marginTop: 14, letterSpacing: '-.5px' }}>
          <div style={{ whiteSpace: 'nowrap' }}>Create football cards</div>
          <div style={{ whiteSpace: 'nowrap' }}>fans actually <span style={{ color: FT.pink }}>share.</span></div>
        </div>
        <div style={{ fontSize: 17, color: FT.sub, marginTop: 20, maxWidth: 560 }}>Pick a template, drop your country, post it to your group chat in seconds. Built for Instagram Story, X and WhatsApp.</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          {['Instagram Story', 'X / Twitter', 'WhatsApp'].map((p) => <Chip key={p} bg="rgba(20,16,12,.06)" color={FT.ink} style={{ fontSize: 11 }}>{p}</Chip>)}
        </div>
        {/* template grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginTop: 34 }}>
          {templates.map(([t, d, c, code], i) => (
            <div key={t} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 0 rgba(20,16,12,.05), 0 14px 34px rgba(20,16,12,.07)' }}>
              <div style={{ height: 168, position: 'relative', overflow: 'hidden', background: `linear-gradient(150deg, ${c}, ${shade(c, -26)})` }}>
                <Confetti n={14} seed={i + 1} style={{ opacity: .6 }} />
                <Pitch color="rgba(255,255,255,.14)" />
                <div style={{ position: 'absolute', left: 18, top: 16 }}><Flag code={code} w={46} ring radius={6} /></div>
                <div style={{ position: 'absolute', left: 18, bottom: 16, right: 18, fontFamily: FT.disp, fontSize: 24, color: '#fff', textTransform: 'uppercase', lineHeight: .9, textShadow: '0 4px 14px rgba(0,0,0,.3)' }}>{t}</div>
              </div>
              <div style={{ padding: '15px 18px 18px' }}>
                <div style={{ fontSize: 13.5, color: FT.sub, lineHeight: 1.35, minHeight: 38 }}>{d}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <span style={{ fontFamily: FT.ui, fontWeight: 800, fontSize: 13, color: c === FT.sun ? FT.tang : c }}>Use template →</span>
                  <span style={{ fontFamily: FT.mono, fontSize: 11, color: FT.sub }}>9:16</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28 }}><Disclaimer color={FT.sub} /></div>
      </div>
    </div>
  );
}

// ───────────────────────── COUNTRY HUB (Turkey) ─────────────────────────
function FestCountry({ code = 'TR' }) {
  const c = COUNTRY[code];
  const opp = [['NL', 'Jun 13', '21:00'], ['SN', 'Jun 19', '18:00'], ['HR', 'Jun 25', '21:00']];
  return (
    <div style={{ width: 1080, background: FT.paper, fontFamily: FT.ui, color: FT.ink }}>
      {/* country hero band */}
      <div style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, ${c.c1}, ${shade(c.c1, -26)})`, color: '#fff' }}>
        <Pitch color="rgba(255,255,255,.12)" />
        <Confetti n={26} seed={4} style={{ opacity: .7 }} />
        <Floodlights tint="rgba(255,255,255,.24)" />
        <FNav dark />
        <div style={{ padding: '14px 44px 44px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 26 }}>
            <Flag code={code} w={150} ring radius={12} />
            <div>
              <Kick color="rgba(255,255,255,.85)">My World Cup hub · Group F</Kick>
              <div style={{ fontFamily: FT.disp, fontSize: 108, lineHeight: .82, textTransform: 'uppercase', letterSpacing: '-1px' }}>{c.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
            <Btn big bg="#fff" color={c.ink}>Create schedule poster</Btn>
            <Btn big bg="rgba(255,255,255,.16)" color="#fff">Create prediction card</Btn>
            <Btn big bg="transparent" color="#fff" style={{ boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.4)' }}>★ Following</Btn>
          </div>
        </div>
      </div>
      {/* group path */}
      <div style={{ padding: '34px 44px' }}>
        <Kick color={c.ink}>Group F · the path</Kick>
        <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
          {[code, 'NL', 'SN', 'HR'].map((g, i) => (
            <div key={g} style={{ flex: 1, background: g === code ? c.c1 : '#fff', color: g === code ? '#fff' : FT.ink, borderRadius: 16, padding: '16px 18px', boxShadow: g === code ? 'none' : '0 10px 26px rgba(20,16,12,.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Flag code={g} w={44} radius={5} />
              <div>
                <div style={{ fontFamily: FT.ui, fontWeight: 800, fontSize: 17 }}>{COUNTRY[g].name}</div>
                <div style={{ fontFamily: FT.mono, fontSize: 11, opacity: .7 }}>{['SEED', 'POT 2', 'POT 3', 'POT 4'][i]}</div>
              </div>
            </div>
          ))}
        </div>
        {/* three matchups */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 28 }}>
          {opp.map(([o, date, time], i) => (
            <div key={o} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 14px 34px rgba(20,16,12,.07)' }}>
              <div style={{ padding: '18px 20px', borderBottom: `1px solid ${FT.line}` }}>
                <div style={{ fontFamily: FT.mono, fontSize: 11, color: FT.sub, letterSpacing: '1px' }}>MATCHDAY {i + 1} · {date}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                  <Flag code={code} w={46} radius={5} />
                  <span style={{ fontFamily: FT.disp, fontSize: 26, color: FT.sub }}>vs</span>
                  <Flag code={o} w={46} radius={5} />
                  <span style={{ marginLeft: 'auto', fontFamily: FT.disp, fontSize: 30, color: c.ink }}>{time}</span>
                </div>
                <div style={{ fontFamily: FT.ui, fontWeight: 800, fontSize: 18, marginTop: 10 }}>{c.name} vs {COUNTRY[o].name}</div>
              </div>
              <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: FT.ui, fontWeight: 800, fontSize: 13, color: c.ink }}>Make matchday card →</span>
                {i === 0
                  ? <Chip bg={FT.grass} color="#fff" style={{ fontSize: 10 }}>★ Reminder set</Chip>
                  : <Chip bg="rgba(20,16,12,.06)" color={FT.ink} style={{ fontSize: 10 }}>+ Remind me</Chip>}
              </div>
            </div>
          ))}
        </div>
        {/* opponent watch */}
        <div style={{ marginTop: 34, background: FT.ink, color: '#fff', borderRadius: 24, padding: '28px 30px', position: 'relative', overflow: 'hidden' }}>
          <Halo color="rgba(255,45,107,.3)" x="85%" y="20%" size="50%" />
          <Kick color={FT.sun}>Opponent watch · next up</Kick>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14 }}>
            <Flag code="NL" w={70} ring radius={8} />
            <div style={{ fontFamily: FT.disp, fontSize: 52, textTransform: 'uppercase', lineHeight: .9 }}>Netherlands</div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
              <Chip bg="rgba(255,255,255,.12)">Lineup watch</Chip>
              <Chip bg="rgba(255,255,255,.12)">Form: monitoring</Chip>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginTop: 20 }}>
            {[['Talking point', 'Set-piece threat from the back line'], ['Watch the gap', 'High press leaves space in behind'], ['Fan verdict', '“Winnable. Loud. Believe.”']].map(([h, b]) => (
              <div key={h} style={{ background: 'rgba(255,255,255,.07)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontFamily: FT.mono, fontSize: 10, letterSpacing: '1px', color: 'rgba(255,255,255,.55)' }}>{h.toUpperCase()}</div>
                <div style={{ fontSize: 14.5, marginTop: 6, lineHeight: 1.35 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 24 }}><Disclaimer color={FT.sub} /></div>
      </div>
    </div>
  );
}

// ───────────────────────── MOBILE HOME ─────────────────────────
function FestMobile() {
  return (
    <div style={{ width: 390, background: FT.paper, fontFamily: FT.ui, color: FT.ink }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
        <span style={{ fontFamily: FT.disp, fontSize: 22 }}>WC<span style={{ color: FT.pink }}>26</span></span>
        <Btn bg={FT.pink} style={{ fontSize: 12, padding: '8px 14px' }}>Create card</Btn>
      </div>
      <div style={{ padding: '6px 20px 22px' }}>
        <Chip bg={FT.ink} color="#fff" style={{ fontSize: 10 }}>★ 48 teams · fan-made</Chip>
        <div style={{ fontFamily: FT.disp, fontSize: 48, lineHeight: 1.04, textTransform: 'uppercase', marginTop: 14 }}>
          Pick your <span style={{ color: FT.pink }}>country.</span> Build the <span style={{ color: FT.tang }}>hype.</span>
        </div>
        <div style={{ fontSize: 14.5, color: FT.sub, marginTop: 14, lineHeight: 1.45 }}>Fan-made posters for any of 48 teams — roads, predictions, player-watch & group-stage cards.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
          <Btn big bg={FT.ink} style={{ justifyContent: 'center' }}>Create a fan card →</Btn>
          <Btn big bg="transparent" color={FT.ink} style={{ justifyContent: 'center', boxShadow: 'inset 0 0 0 2px rgba(20,16,12,.16)' }}>Pick your country</Btn>
        </div>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{ borderRadius: 18, overflow: 'hidden', boxShadow: '0 20px 44px rgba(20,16,12,.18)' }}><FCardRoad code="TR" w={350} /></div>
      </div>
      <div style={{ padding: '20px' }}>
        <Kick>Trending now</Kick>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 10px 24px rgba(20,16,12,.12)' }}><FCardUpset w={167} /></div>
          <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 10px 24px rgba(20,16,12,.12)' }}><FCardMenu w={167} /></div>
        </div>
        <div style={{ marginTop: 18 }}><Disclaimer color={FT.sub} /></div>
      </div>
    </div>
  );
}

window.Festival = { FestHome, FestCards, FestCountry, FestMobile, FCardRoad, FCardPrediction, FCardPlayer, FCardUpset, FCardMenu, FCardBoot, FCardChaos, FCardCustom, FT, shade };
