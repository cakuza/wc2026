// wc-poster.jsx — Direction 3: BOLD FAN-PAGE POSTER.
// High-contrast collage, huge type, stickers, halftone, tape. Exports window.Poster.
const { Flag, COUNTRY, Pitch, Floodlights, Confetti, Halo, JerseyBack, Disclaimer, Chip } = window;
const shadeP = window.Festival.shade;

const PT = {
  paper: '#EDE6D6',
  ink: '#16120D',
  lime: '#C6F23E',
  pink: '#FF2E6E',
  blue: '#2F6BFF',
  orange: '#FF6A00',
  cream: '#FBF7EE',
  disp: 'Anton, sans-serif',
  ui: 'Archivo, sans-serif',
  mono: '"Space Mono", monospace',
};

// halftone dots overlay
function Halftone({ color = 'rgba(0,0,0,.16)', size = 9, style = {} }) {
  const bg = `radial-gradient(${color} 28%, transparent 29%)`;
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: bg, backgroundSize: `${size}px ${size}px`, ...style }} />;
}
// rotated sticker
function Sticker({ children, bg = PT.lime, color = PT.ink, rot = -4, style = {} }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: bg, color, fontFamily: PT.mono, fontWeight: 700, fontSize: 12, letterSpacing: '.5px', textTransform: 'uppercase', padding: '7px 13px', border: `2.5px solid ${PT.ink}`, transform: `rotate(${rot}deg)`, boxShadow: `3px 3px 0 ${PT.ink}`, ...style }}>{children}</span>;
}
function PBtn({ children, bg = PT.ink, color = PT.cream, big = false, style = {} }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap', background: bg, color, fontFamily: PT.ui, fontWeight: 900, fontSize: big ? 16 : 13.5, letterSpacing: '.3px', padding: big ? '15px 26px' : '11px 18px', border: `2.5px solid ${PT.ink}`, boxShadow: `4px 4px 0 ${PT.ink}`, ...style }}>{children}</span>;
}
// starburst
function Burst({ color = PT.pink, size = 70, style = {} }) {
  const pts = []; const n = 12;
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2; const r = i % 2 ? 50 : 30; pts.push(`${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`); }
  return <svg viewBox="0 0 100 100" width={size} height={size} style={style}><polygon points={pts.join(' ')} fill={color} stroke={PT.ink} strokeWidth="3" /></svg>;
}

// ───────── share-card: Group Chaos ─────────
function PCardChaos({ w = 540, grp = 'D', teams = ['BR', 'DE', 'MA', 'US'] }) {
  const s = w / 540;
  return (
    <div style={{ width: w, height: w * 16 / 9, position: 'relative', overflow: 'hidden', background: PT.pink, fontFamily: PT.ui }}>
      <Halftone color="rgba(0,0,0,.14)" size={9 * s} />
      <Floodlights tint="rgba(255,255,255,.18)" />
      <div style={{ position: 'absolute', inset: 0, padding: 30 * s, display: 'flex', flexDirection: 'column', color: PT.ink }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Sticker bg={PT.lime} rot={-5} style={{ fontSize: 12 * s }}>Group Stage</Sticker>
          <Sticker bg={PT.cream} rot={4} style={{ fontSize: 12 * s }}>★ Save</Sticker>
        </div>
        <div style={{ fontFamily: PT.disp, fontSize: 118 * s, lineHeight: .8, textTransform: 'uppercase', marginTop: 14 * s, letterSpacing: '-2px' }}>Group<br />{grp} is<br /><span style={{ WebkitTextStroke: `${3 * s}px ${PT.ink}`, color: PT.lime }}>loaded</span></div>
        <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 * s }}>
          {teams.map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 * s, background: PT.cream, border: `2.5px solid ${PT.ink}`, boxShadow: `3px 3px 0 ${PT.ink}`, padding: `${9 * s}px ${11 * s}px` }}>
              <Flag code={t} w={40 * s} radius={3} />
              <span style={{ fontFamily: PT.disp, fontSize: 22 * s, textTransform: 'uppercase' }}>{COUNTRY[t].name}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 * s, marginTop: 18 * s }}>
          <div style={{ fontFamily: PT.disp, fontSize: 40 * s, textTransform: 'uppercase', background: PT.ink, color: PT.lime, padding: `${2 * s}px ${14 * s}px`, transform: 'rotate(-2deg)' }}>Who survives?</div>
        </div>
        <Disclaimer color="rgba(22,18,13,.55)" style={{ marginTop: 14 * s, fontSize: 9 * s }} />
      </div>
    </div>
  );
}

// ───────── share-card: Upset Watch ─────────
function PCardUpset({ code = 'JP', w = 540 }) {
  const s = w / 540; const c = COUNTRY[code];
  return (
    <div style={{ width: w, height: w * 16 / 9, position: 'relative', overflow: 'hidden', background: PT.blue, fontFamily: PT.ui }}>
      <Halftone color="rgba(0,0,0,.16)" size={9 * s} />
      <div style={{ position: 'absolute', top: 24 * s, right: 24 * s }}><Burst color={PT.lime} size={88 * s} /></div>
      <div style={{ position: 'absolute', top: 44 * s, right: 44 * s, fontFamily: PT.disp, fontSize: 22 * s, color: PT.ink, transform: 'rotate(-8deg)', textAlign: 'center', lineHeight: .85 }}>DARK<br />HORSE</div>
      <div style={{ position: 'absolute', inset: 0, padding: 30 * s, display: 'flex', flexDirection: 'column', color: PT.cream }}>
        <Sticker bg={PT.orange} color={PT.ink} rot={-5} style={{ fontSize: 12 * s }}>Upset Watch · Group E</Sticker>
        <div style={{ marginTop: 22 * s }}><Flag code={code} w={120 * s} ring radius={6} style={{ transform: 'rotate(-3deg)', boxShadow: `5px 5px 0 ${PT.ink}` }} /></div>
        <div style={{ fontFamily: PT.disp, fontSize: 104 * s, lineHeight: .8, textTransform: 'uppercase', marginTop: 20 * s, letterSpacing: '-1.5px' }}>{c.name}<br /><span style={{ color: PT.lime, WebkitTextStroke: `${2.5 * s}px ${PT.ink}` }}>can shock</span><br />the group</div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 9 * s, flexWrap: 'wrap' }}>
          <Sticker bg={PT.cream} rot={-3} style={{ fontSize: 11 * s }}>Believe ★</Sticker>
          <Sticker bg={PT.pink} color={PT.cream} rot={3} style={{ fontSize: 11 * s }}>No fear</Sticker>
        </div>
        <Disclaimer color="rgba(251,247,238,.6)" style={{ marginTop: 14 * s, fontSize: 9 * s }} />
      </div>
    </div>
  );
}

// ───────── share-card: Player Watch ─────────
function PCardPlayer({ name = 'MBAPPÉ', code = 'FR', number = '10', w = 540 }) {
  const s = w / 540; const c = COUNTRY[code];
  return (
    <div style={{ width: w, height: w * 16 / 9, position: 'relative', overflow: 'hidden', background: PT.lime, fontFamily: PT.ui }}>
      <Halftone color="rgba(0,0,0,.14)" size={9 * s} />
      <div style={{ position: 'absolute', top: '6%', left: '-4%', right: '-4%', textAlign: 'center', fontFamily: PT.disp, fontSize: 150 * s, lineHeight: .8, color: 'rgba(22,18,13,.07)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>WATCH</div>
      <div style={{ position: 'absolute', top: 28 * s, left: 30 * s }}><Sticker bg={PT.ink} color={PT.lime} rot={-4} style={{ fontSize: 12 * s }}>Player Watch · {c.name}</Sticker></div>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%) rotate(-2deg)' }}>
        <JerseyBack name={name} number={number} fill={PT.cream} ink={PT.ink} accent={c.c1} w={236 * s} />
      </div>
      <div style={{ position: 'absolute', bottom: 28 * s, left: 30 * s, right: 30 * s }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 * s }}>
          <Flag code={code} w={54 * s} radius={4} style={{ boxShadow: `4px 4px 0 ${PT.ink}` }} />
          <Sticker bg={PT.pink} color={PT.cream} rot={3} style={{ fontSize: 11 * s }}>Big-game energy</Sticker>
        </div>
        <div style={{ fontFamily: PT.disp, fontSize: 96 * s, lineHeight: .82, textTransform: 'uppercase', letterSpacing: '-1px', color: PT.ink, marginTop: 8 * s }}>{name}</div>
        <Disclaimer color="rgba(22,18,13,.5)" style={{ marginTop: 8 * s, fontSize: 9 * s }} />
      </div>
    </div>
  );
}

function PPreview({ kind, w, rot = 0 }) {
  const map = { chaos: <PCardChaos w={w} />, upset: <PCardUpset w={w} />, player: <PCardPlayer w={w} /> };
  return <div style={{ overflow: 'hidden', transform: `rotate(${rot}deg)`, border: `3px solid ${PT.ink}`, boxShadow: `8px 8px 0 ${PT.ink}` }}>{map[kind]}</div>;
}

function PNav() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 44px', borderBottom: `3px solid ${PT.ink}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: PT.disp, fontSize: 28, color: PT.ink, letterSpacing: '.5px' }}>WC<span style={{ background: PT.pink, color: PT.cream, padding: '0 4px' }}>26</span></span>
        <span style={{ width: 2, height: 18, background: PT.ink, opacity: .25 }}></span>
        <span style={{ fontFamily: PT.mono, fontSize: 11, letterSpacing: '2px', color: PT.ink, fontWeight: 700 }}>FAN HUB</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 26, fontFamily: PT.ui, fontWeight: 800, fontSize: 14, color: PT.ink }}>
        <span>Countries</span><span>Cards</span><span>Matchday</span>
        <PBtn bg={PT.lime} color={PT.ink}>Create a fan card</PBtn>
      </div>
    </div>
  );
}

// ───────────────────────── HOMEPAGE ─────────────────────────
function PosterHome() {
  return (
    <div style={{ width: 1280, background: PT.paper, fontFamily: PT.ui, color: PT.ink, position: 'relative', overflow: 'hidden' }}>
      <Halftone color="rgba(0,0,0,.05)" size={11} />
      <div style={{ position: 'relative' }}>
        <PNav />
        <div style={{ padding: '40px 44px 56px', display: 'grid', gridTemplateColumns: '1.04fr .96fr', gap: 30, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 26 }}>
              <Sticker bg={PT.lime} rot={-4}>★ 48 teams</Sticker>
              <Sticker bg={PT.cream} rot={3}>Fan-made</Sticker>
            </div>
            <div style={{ fontFamily: PT.disp, fontSize: 62, lineHeight: 1.22, textTransform: 'uppercase', letterSpacing: '-1.5px' }}>
              <div>Pick your</div>
              <div><span style={{ color: PT.cream, WebkitTextStroke: `2px ${PT.ink}`, background: PT.pink, padding: '2px 10px', display: 'inline-block', transform: 'rotate(-1.5deg)' }}>country.</span></div>
              <div>Build the <span style={{ background: PT.blue, color: PT.cream, padding: '2px 8px' }}>hype.</span></div>
              <div>Share the <span style={{ background: PT.ink, color: PT.lime, padding: '2px 8px' }}>road.</span></div>
            </div>
            <div style={{ fontSize: 17.5, lineHeight: 1.5, color: 'rgba(22,18,13,.75)', marginTop: 26, maxWidth: 470, fontWeight: 500 }}>
              Create fan-made World Cup 2026 posters for any of 48 teams — country roads, prediction battles, player-watch cards, and group-stage matchups.
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 30 }}>
              <PBtn bg={PT.ink} color={PT.cream} big>Create a fan card →</PBtn>
              <PBtn bg={PT.cream} color={PT.ink} big>Pick your country</PBtn>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 30, alignItems: 'center' }}>
              <span style={{ fontFamily: PT.mono, fontSize: 12, fontWeight: 700, letterSpacing: '1px' }}>TRENDING</span>
              {['BR', 'AR', 'FR', 'EN', 'MX', 'JP', 'MA', 'TR'].map((cc) => <Flag key={cc} code={cc} w={34} radius={3} style={{ border: `2px solid ${PT.ink}` }} />)}
            </div>
          </div>
          <div style={{ position: 'relative', height: 640, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: '-3%', top: 60, zIndex: 1 }}><PPreview kind="upset" w={196} rot={-6} /></div>
            <div style={{ position: 'absolute', right: '-3%', top: 90, zIndex: 1 }}><PPreview kind="player" w={196} rot={6} /></div>
            <div style={{ position: 'relative', zIndex: 3 }}><PPreview kind="chaos" w={250} rot={-1.5} /></div>
            <div style={{ position: 'absolute', left: '42%', top: -6, zIndex: 4 }}><Burst color={PT.lime} size={64} /></div>
          </div>
        </div>
        <div style={{ padding: '0 44px 40px' }}><Disclaimer color="rgba(22,18,13,.55)" /></div>
      </div>
    </div>
  );
}

// ───────────────────────── CARDS PAGE ─────────────────────────
function PosterCards() {
  const templates = [
    ['Country Road Poster', 'Full group path', PT.pink, 'TR'],
    ['Matchday Menu', 'Every kickoff, local time', PT.blue, 'MX'],
    ['Prediction Battle', 'Drop your scoreline', PT.orange, 'ZA'],
    ['Golden Boot Debate', 'Rank the scorers', PT.lime, 'FR'],
    ['Player Watch', 'Big-game energy', PT.blue, 'BR'],
    ['Group Chaos', 'Who survives?', PT.pink, 'DE'],
    ['Upset Watch', 'Back the dark horse', PT.orange, 'JP'],
    ['Custom Fan Card', 'Your words, your flag', PT.lime, 'AR'],
  ];
  return (
    <div style={{ width: 1280, background: PT.paper, fontFamily: PT.ui, color: PT.ink, position: 'relative', overflow: 'hidden' }}>
      <Halftone color="rgba(0,0,0,.05)" size={11} />
      <div style={{ position: 'relative' }}>
        <PNav />
        <div style={{ padding: '34px 44px 56px' }}>
          <Sticker bg={PT.lime} rot={-3}>The money page · poster studio</Sticker>
          <div style={{ fontFamily: PT.disp, fontSize: 76, lineHeight: 1.12, textTransform: 'uppercase', marginTop: 18, letterSpacing: '-1.5px' }}>
            <div style={{ whiteSpace: 'nowrap' }}>Create football cards</div>
            <div style={{ whiteSpace: 'nowrap' }}>fans actually <span style={{ background: PT.pink, color: PT.cream, padding: '2px 10px', transform: 'rotate(-1deg)', display: 'inline-block' }}>share.</span></div>
          </div>
          <div style={{ fontSize: 17, color: 'rgba(22,18,13,.75)', marginTop: 18, maxWidth: 560, fontWeight: 500 }}>Pick a template, drop your country, post it to the group chat in seconds. Built for Instagram Story, X, WhatsApp & Telegram.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginTop: 34 }}>
            {templates.map(([t, d, c, code], i) => (
              <div key={t} style={{ background: PT.cream, border: `3px solid ${PT.ink}`, boxShadow: `6px 6px 0 ${PT.ink}`, overflow: 'hidden' }}>
                <div style={{ height: 162, position: 'relative', overflow: 'hidden', background: c, borderBottom: `3px solid ${PT.ink}` }}>
                  <Halftone color="rgba(0,0,0,.14)" size={8} />
                  <div style={{ position: 'absolute', left: 16, top: 14 }}><Flag code={code} w={46} radius={3} style={{ border: `2.5px solid ${PT.ink}`, boxShadow: `3px 3px 0 ${PT.ink}` }} /></div>
                  <div style={{ position: 'absolute', left: 16, bottom: 14, right: 16, fontFamily: PT.disp, fontSize: 25, color: PT.ink, textTransform: 'uppercase', lineHeight: .88 }}>{t}</div>
                </div>
                <div style={{ padding: '14px 16px 16px' }}>
                  <div style={{ fontSize: 13.5, color: 'rgba(22,18,13,.7)', fontWeight: 600, minHeight: 36 }}>{d}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <span style={{ fontFamily: PT.ui, fontWeight: 900, fontSize: 13 }}>Use template →</span>
                    <span style={{ fontFamily: PT.mono, fontSize: 11, fontWeight: 700 }}>9:16</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28 }}><Disclaimer color="rgba(22,18,13,.55)" /></div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── MOBILE ─────────────────────────
function PosterMobile() {
  return (
    <div style={{ width: 390, background: PT.paper, fontFamily: PT.ui, color: PT.ink, position: 'relative', overflow: 'hidden' }}>
      <Halftone color="rgba(0,0,0,.05)" size={10} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `3px solid ${PT.ink}` }}>
          <span style={{ fontFamily: PT.disp, fontSize: 24 }}>WC<span style={{ background: PT.pink, color: PT.cream, padding: '0 4px' }}>26</span></span>
          <PBtn bg={PT.lime} color={PT.ink} style={{ fontSize: 12, padding: '8px 13px', boxShadow: `3px 3px 0 ${PT.ink}` }}>Create card</PBtn>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <Sticker bg={PT.lime} rot={-4} style={{ fontSize: 10 }}>★ 48 teams</Sticker>
            <Sticker bg={PT.cream} rot={3} style={{ fontSize: 10 }}>Fan-made</Sticker>
          </div>
          <div style={{ fontFamily: PT.disp, fontSize: 48, lineHeight: 1.02, textTransform: 'uppercase', letterSpacing: '-1px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 7 }}>
            <div>Pick your</div>
            <div style={{ background: PT.pink, color: PT.cream, padding: '2px 8px', transform: 'rotate(-1.5deg)' }}>country.</div>
            <div>Build the <span style={{ background: PT.blue, color: PT.cream, padding: '2px 6px' }}>hype.</span></div>
          </div>
          <div style={{ fontSize: 14.5, color: 'rgba(22,18,13,.75)', marginTop: 14, fontWeight: 500, lineHeight: 1.45 }}>Fan-made posters for any of 48 teams — roads, predictions, player-watch & group cards.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
            <PBtn bg={PT.ink} color={PT.cream} big style={{ justifyContent: 'center' }}>Create a fan card →</PBtn>
            <PBtn bg={PT.cream} color={PT.ink} big style={{ justifyContent: 'center' }}>Pick your country</PBtn>
          </div>
        </div>
        <div style={{ padding: '0 20px' }}>
          <div style={{ border: `3px solid ${PT.ink}`, boxShadow: `6px 6px 0 ${PT.ink}`, overflow: 'hidden' }}><PCardChaos w={344} /></div>
        </div>
        <div style={{ padding: '24px 20px' }}>
          <Sticker bg={PT.orange} color={PT.ink} rot={-3} style={{ fontSize: 11 }}>Trending now</Sticker>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
            <div style={{ border: `2.5px solid ${PT.ink}`, boxShadow: `4px 4px 0 ${PT.ink}`, overflow: 'hidden' }}><PCardUpset w={161} /></div>
            <div style={{ border: `2.5px solid ${PT.ink}`, boxShadow: `4px 4px 0 ${PT.ink}`, overflow: 'hidden' }}><PCardPlayer w={161} /></div>
          </div>
          <div style={{ marginTop: 18 }}><Disclaimer color="rgba(22,18,13,.55)" /></div>
        </div>
      </div>
    </div>
  );
}

window.Poster = { PosterHome, PosterCards, PosterMobile, PCardChaos, PCardUpset, PCardPlayer, PT };
