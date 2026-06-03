// wc-gallery.jsx — static mockup pieces for the Final Direction canvas. Exports window.WCGallery.
const GA = window.WCApp;
const { Tappable: GT, PillBtn: GPB, Kicker: GK, WHITE: GW } = GA;
const GC2 = window.Cards2;
const { Flag: GFlag, COUNTRY: GCO } = window;
const GFX = window.FX;

// ─────────── CARDS PAGE (money page) — full poster previews, 2-up ───────────
function CardsPage() {
  const tiles = [
    { t: 'Prediction Battle', d: 'Drop your scoreline', el: <GC2.Prediction a="MX" b="ZA" ratio="9:16" w={166} /> },
    { t: 'Player Watch', d: 'Big-name, big-game energy', el: <GC2.Player name={'MBAPP\u00C9'} code="FR" number="10" ratio="9:16" w={166} /> },
    { t: 'Group Chaos', d: 'Who survives the group?', el: <GC2.Chaos code="BR" ratio="9:16" w={166} /> },
    { t: 'Country Road', d: 'Your full group path', el: <GC2.Road code="TR" ratio="9:16" w={166} /> },
    { t: 'Matchday Menu', d: 'Every kickoff, local time', el: <GC2.Menu code="MX" ratio="9:16" w={166} /> },
    { t: 'Golden Boot', d: 'Rank the scorers', el: <GC2.Boot code="FR" ratio="9:16" w={166} /> },
    { t: 'Upset Watch', d: 'Back the dark horse', el: <GC2.Upset code="JP" ratio="9:16" w={166} /> },
    { t: 'Custom Fan Card', d: 'Your words, your flag', el: <GC2.Custom code="AR" ratio="9:16" w={166} /> },
  ];
  return (
    <div style={{ width: 390, background: GW.base, fontFamily: GW.ui }}>
      <div style={{ padding: '54px 18px 8px', display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ fontFamily: GW.disp, fontSize: 24, color: GW.ink, lineHeight: 1 }}>WC<span style={{ color: GW.pink }}>26</span></span>
        <span style={{ width: 1, height: 16, background: GW.line }}></span>
        <span style={{ fontFamily: GW.mono, fontSize: 10, letterSpacing: '2px', color: GW.sub }}>CARDS</span>
      </div>
      <div style={{ padding: '8px 18px 22px' }}>
        <GK color={GW.pink}>The money page</GK>
        <div style={{ fontFamily: GW.disp, fontSize: 42, lineHeight: .96, textTransform: 'uppercase', letterSpacing: '-.5px', color: GW.ink, marginTop: 8 }}>
          <div>Cards fans</div>
          <div>actually <span style={{ color: GW.pink }}>share.</span></div>
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 14, flexWrap: 'wrap' }}>
          {['Instagram', 'X', 'WhatsApp', 'Telegram'].map((p) => (
            <span key={p} style={{ fontFamily: GW.mono, fontSize: 10, fontWeight: 700, color: GW.ink, background: GW.wash, padding: '6px 10px', borderRadius: 999 }}>{p}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
          {tiles.map((c) => (
            <div key={c.t}>
              <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 12px 28px rgba(14,12,10,.18)' }}>{c.el}</div>
              <div style={{ fontFamily: GW.ui, fontWeight: 800, fontSize: 13.5, color: GW.ink, marginTop: 8 }}>{c.t}</div>
              <div style={{ fontFamily: GW.ui, fontSize: 11.5, color: GW.sub, marginTop: 1 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────── PRO / WATERMARK UI ───────────
function ProSheet() {
  const feat = [
    ['Remove the wc26.app watermark', 'Clean posters, your brand only'],
    ['Night / Gold premium theme', 'Cinematic finals-night look'],
    ['Premium card packs', 'Animated & foil templates, monthly drops'],
    ['Fan-page toolkit', 'Bulk export every matchday in one tap'],
  ];
  return (
    <div style={{ width: 390, background: GW.base, fontFamily: GW.ui, borderRadius: 22, overflow: 'hidden', boxShadow: '0 20px 50px rgba(14,12,10,.18)' }}>
      {/* hero band */}
      <div style={{ background: 'linear-gradient(135deg,#161310,#0E0C0A)', padding: '26px 22px 22px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 90% at 85% 0%, rgba(231,195,107,.35), transparent 70%)' }}></div>
        <GFX.Grain opacity={.1} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(231,195,107,.16)', padding: '6px 12px', borderRadius: 999 }}>
            <svg width="13" height="13" viewBox="0 0 24 24"><path d="M3 7l4 4 5-7 5 7 4-4-2 12H5z" fill={GW.gold} /></svg>
            <span style={{ fontFamily: GW.mono, fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: GW.gold }}>WC26 PRO</span>
          </div>
          <div style={{ fontFamily: GW.disp, fontSize: 40, lineHeight: .92, textTransform: 'uppercase', color: '#fff', marginTop: 14 }}>Make it<br /><span style={{ color: GW.gold }}>yours.</span></div>
          <div style={{ fontFamily: GW.ui, fontSize: 14, color: 'rgba(255,255,255,.66)', marginTop: 10 }}>Unlock the gold theme, drop the watermark, and post like a real fan page.</div>
        </div>
      </div>
      <div style={{ padding: '18px 22px 22px' }}>
        {feat.map(([h, d], i) => (
          <div key={h} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderTop: i ? `1px solid ${GW.line}` : 'none' }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(231,195,107,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <svg width="13" height="13" viewBox="0 0 14 14"><path d="M2 7.5l3.5 3.5L12 3" stroke={GC2.shade(GW.gold, -22)} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <div style={{ fontFamily: GW.ui, fontWeight: 800, fontSize: 14.5, color: GW.ink }}>{h}</div>
              <div style={{ fontFamily: GW.ui, fontSize: 12.5, color: GW.sub, marginTop: 1 }}>{d}</div>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: GW.ink, color: '#fff', borderRadius: 16, padding: '15px', marginTop: 14, fontFamily: GW.ui, fontWeight: 800, fontSize: 16 }}>
          Go Pro · <span style={{ color: GW.gold }}>$2.99</span><span style={{ fontWeight: 500, color: 'rgba(255,255,255,.6)', fontSize: 14 }}>/mo</span>
        </div>
        <div style={{ textAlign: 'center', fontFamily: GW.mono, fontSize: 10, color: GW.sub, marginTop: 10 }}>CANCEL ANYTIME · OR $14.99/TOURNAMENT</div>
      </div>
    </div>
  );
}

// before/after watermark
function WatermarkCompare() {
  return (
    <div style={{ width: 760, background: GW.base, fontFamily: GW.ui, padding: 28, borderRadius: 20 }}>
      <GK color={GW.pink}>Watermark · free vs Pro</GK>
      <div style={{ display: 'flex', gap: 24, marginTop: 16, alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 14px 30px rgba(14,12,10,.18)' }}><GC2.Player name={'MBAPP\u00C9'} code="FR" number="10" ratio="9:16" w={210} /></div>
          <div style={{ fontFamily: GW.mono, fontSize: 11, color: GW.sub, marginTop: 10, letterSpacing: '1px' }}>FREE · wc26.app tag</div>
        </div>
        <div style={{ fontFamily: GW.disp, fontSize: 40, color: GW.ink }}>→</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 14px 30px rgba(231,195,107,.3)' }}><GC2.Player name={'MBAPP\u00C9'} code="FR" number="10" ratio="9:16" w={210} theme="night" pro /></div>
          <div style={{ fontFamily: GW.mono, fontSize: 11, color: GC2.shade(GW.gold, -26), marginTop: 10, letterSpacing: '1px', fontWeight: 700 }}>PRO · clean + gold theme</div>
        </div>
      </div>
    </div>
  );
}

window.WCGallery = { CardsPage, ProSheet, WatermarkCompare };
