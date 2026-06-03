// wc-night.jsx — Direction 2: PREMIUM STADIUM NIGHT.
// Deep navy-black, floodlights, gold foil, cinematic. Exports window.Night.
const { Flag, COUNTRY, Pitch, Floodlights, Confetti, Halo, JerseyBack, Disclaimer, Chip } = window;
const shadeN = window.Festival.shade;

const NT = {
  bg: '#080B11',
  bg2: '#0E1420',
  panel: '#121A29',
  gold: '#E7C36B',
  gold2: '#C79A3A',
  ink: '#F5F0E4',
  sub: 'rgba(245,240,228,.62)',
  line: 'rgba(245,240,228,.12)',
  grass: '#1F6F4A',
  disp: 'Anton, sans-serif',
  ui: 'Archivo, sans-serif',
  mono: '"Space Mono", monospace',
};

function NKick({ children, color = NT.gold, style = {} }) {
  return <div style={{ fontFamily: NT.mono, fontWeight: 700, fontSize: 12, letterSpacing: '3px', textTransform: 'uppercase', color, ...style }}>{children}</div>;
}
function NBtn({ children, gold = false, big = false, style = {} }) {
  const base = gold
    ? { background: `linear-gradient(180deg, ${NT.gold}, ${NT.gold2})`, color: '#1A1206' }
    : { background: 'transparent', color: NT.ink, boxShadow: `inset 0 0 0 1.5px ${NT.line}` };
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap', fontFamily: NT.ui, fontWeight: 800, fontSize: big ? 16 : 13.5, letterSpacing: '.3px', padding: big ? '15px 26px' : '11px 18px', borderRadius: 8, ...base, ...style }}>{children}</span>;
}
// gold foil divider line
function GoldRule({ style = {} }) {
  return <div style={{ height: 2, background: `linear-gradient(90deg, ${NT.gold2}, ${NT.gold}, transparent)`, ...style }} />;
}

// stadium backdrop: dark gradient + floodlight beams + faint pitch
function NightBackdrop({ children, style = {} }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: `radial-gradient(120% 80% at 50% -10%, ${shadeN(NT.bg2, 8)}, ${NT.bg} 60%)`, ...style }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 40% at 50% 0%, rgba(231,195,107,.16), transparent 70%)' }} />
      <Floodlights tint="rgba(231,210,150,.14)" />
      <Pitch color="rgba(120,180,140,.08)" stroke={1.2} />
      {children}
    </div>
  );
}

// ───────── share-card: Country Road (night) ─────────
function NCardRoad({ code = 'TR', w = 540 }) {
  const c = COUNTRY[code]; const s = w / 540;
  const opp = ['NL', 'SN', 'HR'];
  return (
    <NightBackdrop style={{ width: w, height: w * 16 / 9, fontFamily: NT.ui }}>
      <div style={{ position: 'absolute', inset: 0, padding: 34 * s, display: 'flex', flexDirection: 'column', color: NT.ink }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <NKick>Road to 2026</NKick>
          <Chip bg="rgba(231,195,107,.14)" color={NT.gold} style={{ fontSize: 10 }}>★ Save this</Chip>
        </div>
        <GoldRule style={{ marginTop: 14 * s }} />
        <div style={{ marginTop: 22 * s, display: 'flex', alignItems: 'center', gap: 16 * s }}>
          <Flag code={code} w={86 * s} ring radius={6} />
          <div style={{ fontFamily: NT.mono, fontSize: 12 * s, letterSpacing: '2px', color: NT.sub }}>GROUP F<br />MATCHDAYS 1–3</div>
        </div>
        <div style={{ fontFamily: NT.disp, fontSize: 96 * s, lineHeight: .82, textTransform: 'uppercase', marginTop: 18 * s, letterSpacing: '-1px', color: NT.ink }}>{c.name}</div>
        <div style={{ fontFamily: NT.disp, fontSize: 30 * s, color: NT.gold, textTransform: 'uppercase', letterSpacing: '1px' }}>The road starts here</div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 9 * s }}>
          {opp.map((o, i) => (
            <div key={o} style={{ display: 'flex', alignItems: 'center', gap: 12 * s, padding: `${10 * s}px 0`, borderTop: `1px solid ${NT.line}` }}>
              <span style={{ fontFamily: NT.disp, fontSize: 20 * s, width: 26 * s, color: NT.gold }}>{i + 1}</span>
              <Flag code={o} w={40 * s} radius={4} />
              <span style={{ fontFamily: NT.ui, fontWeight: 800, fontSize: 18 * s, flex: 1, textTransform: 'uppercase', letterSpacing: '.3px' }}>{COUNTRY[o].name}</span>
              <span style={{ fontFamily: NT.mono, fontSize: 11 * s, color: NT.sub }}>MD{i + 1}</span>
            </div>
          ))}
        </div>
        <Disclaimer color="rgba(245,240,228,.42)" style={{ marginTop: 16 * s, fontSize: 9 * s }} />
      </div>
    </NightBackdrop>
  );
}

// ───────── share-card: Matchday Menu (night) ─────────
function NCardMenu({ w = 540 }) {
  const s = w / 540;
  const fix = [['MX', 'ZA', '17:00'], ['KR', 'CZ', '20:00']];
  return (
    <NightBackdrop style={{ width: w, height: w * 16 / 9, fontFamily: NT.ui }}>
      <div style={{ position: 'absolute', inset: 0, padding: 34 * s, display: 'flex', flexDirection: 'column', color: NT.ink }}>
        <NKick>Matchday Menu · Group A</NKick>
        <div style={{ fontFamily: NT.disp, fontSize: 78 * s, lineHeight: .84, textTransform: 'uppercase', marginTop: 10 * s, letterSpacing: '-.5px' }}>Tonight's<br /><span style={{ color: NT.gold }}>fixtures</span></div>
        <div style={{ marginTop: 28 * s, display: 'flex', flexDirection: 'column', gap: 14 * s }}>
          {fix.map(([a, b, t], i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${NT.line}`, borderRadius: 14 * s, padding: `${16 * s}px ${18 * s}px` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 * s }}>
                <Flag code={a} w={46 * s} radius={4} />
                <span style={{ fontFamily: NT.disp, fontSize: 26 * s, textTransform: 'uppercase' }}>{COUNTRY[a].name}</span>
                <span style={{ fontFamily: NT.disp, fontSize: 22 * s, color: NT.sub, margin: '0 auto' }}>v</span>
                <span style={{ fontFamily: NT.disp, fontSize: 26 * s, textTransform: 'uppercase' }}>{COUNTRY[b].name}</span>
                <Flag code={b} w={46 * s} radius={4} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 * s }}>
                <span style={{ fontFamily: NT.mono, fontSize: 13 * s, color: NT.gold, letterSpacing: '2px' }}>◷ {t} LOCAL</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto' }}>
          <GoldRule style={{ marginBottom: 12 * s }} />
          <div style={{ fontFamily: NT.mono, fontSize: 12 * s, color: NT.sub }}>★ SAVE THE MATCHUPS · YOUR LOCAL KICKOFF</div>
          <Disclaimer color="rgba(245,240,228,.42)" style={{ marginTop: 10 * s, fontSize: 9 * s }} />
        </div>
      </div>
    </NightBackdrop>
  );
}

// ───────── share-card: Golden Boot Debate (night) ─────────
function NCardBoot({ w = 540 }) {
  const s = w / 540;
  const slots = [['MBAPPÉ', 'FR'], ['HAALAND', 'NO'], ['KANE', 'EN'], ['VINÍCIUS JR', 'BR'], ['MESSI', 'AR']];
  return (
    <NightBackdrop style={{ width: w, height: w * 16 / 9, fontFamily: NT.ui }}>
      <div style={{ position: 'absolute', inset: 0, padding: 34 * s, display: 'flex', flexDirection: 'column', color: NT.ink }}>
        <NKick>The Debate</NKick>
        <div style={{ fontFamily: NT.disp, fontSize: 60 * s, lineHeight: .86, textTransform: 'uppercase', marginTop: 8 * s }}>Who wins the<br /><span style={{ color: NT.gold }}>Golden Boot?</span></div>
        <div style={{ marginTop: 22 * s, display: 'flex', flexDirection: 'column', gap: 9 * s }}>
          {slots.map(([nm, fc], i) => (
            <div key={nm} style={{ display: 'flex', alignItems: 'center', gap: 13 * s, padding: `${11 * s}px ${14 * s}px`, borderRadius: 12 * s,
              background: i === 0 ? `linear-gradient(90deg, rgba(231,195,107,.22), rgba(231,195,107,.04))` : 'rgba(255,255,255,.03)',
              border: `1px solid ${i === 0 ? 'rgba(231,195,107,.45)' : NT.line}` }}>
              <span style={{ fontFamily: NT.disp, fontSize: 28 * s, width: 30 * s, color: i === 0 ? NT.gold : NT.sub }}>{i + 1}</span>
              <Flag code={fc} w={42 * s} radius={4} />
              <span style={{ fontFamily: NT.ui, fontWeight: 800, fontSize: 21 * s, flex: 1, textTransform: 'uppercase', letterSpacing: '.3px' }}>{nm}</span>
              {i === 0 && <span style={{ fontFamily: NT.mono, fontSize: 10 * s, color: NT.gold, letterSpacing: '1px' }}>FAN PICK ★</span>}
            </div>
          ))}
        </div>
        <Disclaimer color="rgba(245,240,228,.42)" style={{ marginTop: 'auto', fontSize: 9 * s }} />
      </div>
    </NightBackdrop>
  );
}

// preview tile
function NPreview({ kind, w, rot = 0 }) {
  const map = { road: <NCardRoad w={w} />, menu: <NCardMenu w={w} />, boot: <NCardBoot w={w} /> };
  return <div style={{ borderRadius: 14, overflow: 'hidden', transform: `rotate(${rot}deg)`, boxShadow: '0 30px 70px rgba(0,0,0,.6), 0 0 0 1px rgba(231,195,107,.18)' }}>{map[kind]}</div>;
}

function NNav() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 46px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: NT.disp, fontSize: 26, color: NT.ink, letterSpacing: '.5px' }}>WC<span style={{ color: NT.gold }}>26</span></span>
        <span style={{ width: 1, height: 18, background: NT.line }} />
        <span style={{ fontFamily: NT.mono, fontSize: 11, letterSpacing: '2px', color: NT.sub }}>FAN HUB</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontFamily: NT.ui, fontWeight: 700, fontSize: 13.5, color: NT.ink }}>
        <span style={{ opacity: .85 }}>Countries</span><span style={{ opacity: .85 }}>Cards</span><span style={{ opacity: .85 }}>Matchday</span>
        <NBtn gold>Create a fan card</NBtn>
      </div>
    </div>
  );
}

// ───────────────────────── HOMEPAGE ─────────────────────────
function NightHome() {
  return (
    <NightBackdrop style={{ width: 1280, fontFamily: NT.ui, color: NT.ink }}>
      <NNav />
      <div style={{ padding: '24px 46px 64px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.06fr .94fr', gap: 36, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', gap: 8, marginBottom: 24 }}>
              <Chip bg="rgba(231,195,107,.14)" color={NT.gold} style={{ fontSize: 11 }}>★ 48 teams · 12 groups</Chip>
              <Chip bg="rgba(255,255,255,.06)" color={NT.sub} style={{ fontSize: 11 }}>Fan-made</Chip>
            </div>
            <div style={{ fontFamily: NT.disp, fontSize: 56, lineHeight: 1.04, textTransform: 'uppercase', letterSpacing: '-.5px', whiteSpace: 'nowrap' }}>
              <div>Pick your <span style={{ color: NT.gold }}>country.</span></div>
              <div>Build the hype.</div>
              <div>Share the <span style={{ color: NT.gold }}>road.</span></div>
            </div>
            <div style={{ fontSize: 17.5, lineHeight: 1.55, color: NT.sub, marginTop: 24, maxWidth: 470 }}>
              Create fan-made World Cup 2026 posters for any of 48 teams — country roads, prediction battles, player-watch cards, and group-stage matchups.
            </div>
            <div style={{ display: 'flex', gap: 13, marginTop: 30 }}>
              <NBtn gold big>Create a fan card →</NBtn>
              <NBtn big>Pick your country</NBtn>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 32, alignItems: 'center' }}>
              <span style={{ fontFamily: NT.mono, fontSize: 12, color: NT.sub, letterSpacing: '1px' }}>TRENDING</span>
              {['BR', 'AR', 'FR', 'EN', 'PT', 'DE', 'MA', 'TR'].map((cc) => <Flag key={cc} code={cc} w={32} radius={3} />)}
            </div>
          </div>
          <div style={{ position: 'relative', height: 640, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: '-2%', top: 70, zIndex: 1 }}><NPreview kind="boot" w={206} rot={-6} /></div>
            <div style={{ position: 'absolute', right: '-2%', top: 40, zIndex: 1 }}><NPreview kind="menu" w={206} rot={6} /></div>
            <div style={{ position: 'relative', zIndex: 3 }}><NPreview kind="road" w={264} /></div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 46px 46px' }}><Disclaimer color="rgba(245,240,228,.4)" /></div>
    </NightBackdrop>
  );
}

// ───────────────────────── CARDS PAGE ─────────────────────────
function NightCards() {
  const templates = [
    ['Country Road Poster', 'Your team\u2019s full group path', 'TR'],
    ['Matchday Menu', 'Every kickoff in your local time', 'MX'],
    ['Prediction Battle', 'Drop your scoreline', 'ZA'],
    ['Golden Boot Debate', 'Rank the scorers', 'FR'],
    ['Player Watch', 'Big-name, big-game energy', 'BR'],
    ['Group Chaos', 'Who survives the group?', 'DE'],
    ['Upset Watch', 'Back the dark horse', 'JP'],
    ['Custom Fan Card', 'Your words, your flag', 'AR'],
  ];
  return (
    <NightBackdrop style={{ width: 1280, fontFamily: NT.ui, color: NT.ink }}>
      <NNav />
      <div style={{ padding: '16px 46px 56px' }}>
        <NKick>The money page · poster studio</NKick>
        <div style={{ fontFamily: NT.disp, fontSize: 62, lineHeight: 1.08, textTransform: 'uppercase', marginTop: 14, letterSpacing: '-.5px' }}>
          <div style={{ whiteSpace: 'nowrap' }}>Create football cards</div>
          <div style={{ whiteSpace: 'nowrap' }}>fans actually <span style={{ color: NT.gold }}>share.</span></div>
        </div>
        <div style={{ fontSize: 17, color: NT.sub, marginTop: 20, maxWidth: 560 }}>Pick a template, drop your country, post it in seconds. Built for Instagram Story, X, WhatsApp & Telegram.</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          {['Instagram Story', 'X / Twitter', 'WhatsApp', 'Telegram'].map((p) => <Chip key={p} bg="rgba(255,255,255,.06)" color={NT.sub} style={{ fontSize: 11 }}>{p}</Chip>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginTop: 34 }}>
          {templates.map(([t, d, code], i) => (
            <div key={t} style={{ background: NT.panel, borderRadius: 16, overflow: 'hidden', border: `1px solid ${NT.line}` }}>
              <div style={{ height: 168, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(80% 60% at 50% 0%, ${shadeN(NT.bg2, 14)}, ${NT.bg})` }} />
                <Pitch color="rgba(120,180,140,.1)" />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 50% at 50% 6%, rgba(231,195,107,.16), transparent 70%)' }} />
                <div style={{ position: 'absolute', left: 18, top: 16 }}><Flag code={code} w={44} ring radius={5} /></div>
                <div style={{ position: 'absolute', left: 18, bottom: 16, right: 18, fontFamily: NT.disp, fontSize: 23, color: NT.ink, textTransform: 'uppercase', lineHeight: .9 }}>{t}</div>
              </div>
              <div style={{ padding: '15px 18px 18px' }}>
                <div style={{ fontSize: 13.5, color: NT.sub, lineHeight: 1.35, minHeight: 38 }}>{d}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <span style={{ fontFamily: NT.ui, fontWeight: 800, fontSize: 13, color: NT.gold }}>Use template →</span>
                  <span style={{ fontFamily: NT.mono, fontSize: 11, color: NT.sub }}>9:16</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28 }}><Disclaimer color="rgba(245,240,228,.4)" /></div>
      </div>
    </NightBackdrop>
  );
}

// ───────────────────────── MOBILE ─────────────────────────
function NightMobile() {
  return (
    <NightBackdrop style={{ width: 390, fontFamily: NT.ui, color: NT.ink }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
        <span style={{ fontFamily: NT.disp, fontSize: 22 }}>WC<span style={{ color: NT.gold }}>26</span></span>
        <NBtn gold style={{ fontSize: 12, padding: '8px 14px' }}>Create card</NBtn>
      </div>
      <div style={{ padding: '8px 20px 22px' }}>
        <Chip bg="rgba(231,195,107,.14)" color={NT.gold} style={{ fontSize: 10 }}>★ 48 teams · fan-made</Chip>
        <div style={{ fontFamily: NT.disp, fontSize: 44, lineHeight: 1.04, textTransform: 'uppercase', marginTop: 14, whiteSpace: 'nowrap' }}>
          <div>Pick your <span style={{ color: NT.gold }}>country.</span></div>
          <div>Build the hype.</div>
          <div>Share the <span style={{ color: NT.gold }}>road.</span></div>
        </div>
        <div style={{ fontSize: 14.5, color: NT.sub, marginTop: 14, lineHeight: 1.5 }}>Fan-made posters for any of 48 teams — roads, predictions, player-watch & group-stage cards.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
          <NBtn gold big style={{ justifyContent: 'center' }}>Create a fan card →</NBtn>
          <NBtn big style={{ justifyContent: 'center' }}>Pick your country</NBtn>
        </div>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 44px rgba(0,0,0,.5)' }}><NCardRoad code="TR" w={350} /></div>
      </div>
      <div style={{ padding: '20px' }}>
        <NKick>Trending now</NKick>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 24px rgba(0,0,0,.4)' }}><NCardMenu w={167} /></div>
          <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 24px rgba(0,0,0,.4)' }}><NCardBoot w={167} /></div>
        </div>
        <div style={{ marginTop: 18 }}><Disclaimer color="rgba(245,240,228,.4)" /></div>
      </div>
    </NightBackdrop>
  );
}

window.Night = { NightHome, NightCards, NightMobile, NCardRoad, NCardMenu, NCardBoot, NT };
