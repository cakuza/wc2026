// wc-homepage-hero.jsx — Homepage Hero Upgrade for WC26 Hub
// Requires: wc-shared.jsx + wc-poster-upgrade.jsx + wc-chips.jsx loaded first
// Exports: window.WCHero = { UpgradeHero }

const { Flag: HFlag, COUNTRY: HC, Disclaimer: HDisc } = window;
const { URoadCard: HRoad, UPredCard: HPred, UPlayerCard: HPlayer } = window.WCPosterUpgrade || {};
const { ScoreboardChipRow: HChips } = window.WCChips || {};

const HR_PAPER  = '#FBF6EC';
const HR_INK    = '#14100C';
const HR_PINK   = '#FF2D6B';
const HR_TANG   = '#FF7A1A';
const HR_GRASS  = '#11B886';
const HR_GOLD   = '#E7C36B';
const HR_DARK   = '#0E0C0A';
const HR_ANTON  = 'var(--font-anton, Anton, sans-serif)';
const HR_UI     = 'Archivo, system-ui, sans-serif';
const HR_MONO   = '"Space Mono", monospace';

// Floating Instagram-Story poster card
function StoryCard({ CardComponent, code, w, rot, lift = 0 }) {
  const cardH = Math.round(w * 16/9);
  const shadow = '0 36px 70px rgba(14,12,10,.30), 0 10px 24px rgba(14,12,10,.20)';

  const inner = CardComponent
    ? <CardComponent code={code} w={w} />
    : <div style={{ width: w, height: cardH, background: HR_DARK, borderRadius: 12 }} />;

  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      transform: `rotate(${rot}deg) translateY(${lift}px)`,
      boxShadow: shadow,
      flex: '0 0 auto',
    }}>
      {inner}
    </div>
  );
}

function UpgradeHero({ width = 1280 }) {
  const padH = 48;
  const chips = [
    { label: 'Teams',   value: '48 TEAMS'    },
    { label: 'Matches', value: '104 MATCHES'  },
    { label: 'Format',  value: 'STORY · X · WA' },
    { label: 'Cost',    value: 'FREE'         },
  ];

  // Inline scoreboard chip for when wc-chips.jsx isn't loaded
  function FallbackChipRow() {
    return (
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {chips.map(({ label, value }) => (
          <div key={label} style={{ background: HR_DARK, borderRadius: 5, padding: '9px 16px 11px',
                                    border: '1px solid rgba(231,195,107,.15)',
                                    borderTop: `2px solid ${HR_GOLD}55` }}>
            <div style={{ fontFamily:HR_MONO, fontSize:8, letterSpacing:'2.5px',
                          color:`${HR_GOLD}99`, textTransform:'uppercase', marginBottom:5 }}>{label}</div>
            <div style={{ fontFamily:HR_ANTON, fontSize:20, color:HR_GOLD, lineHeight:1,
                          letterSpacing:'-.3px', whiteSpace:'nowrap' }}>{value}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ width, background: HR_PAPER, fontFamily: HR_UI, color: HR_INK, overflow: 'hidden' }}>

      {/* ── Nav ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:`22px ${padH}px` }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontFamily:HR_ANTON, fontSize:28, color:HR_INK, letterSpacing:'.5px' }}>
            WC<span style={{ color:HR_PINK }}>26</span>
          </span>
          <span style={{ width:1, height:18, background:'rgba(20,16,12,.18)' }} />
          <span style={{ fontFamily:HR_MONO, fontSize:11, letterSpacing:'2px', color:'rgba(20,16,12,.52)' }}>FAN HUB</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:30, fontFamily:HR_UI, fontWeight:700, fontSize:14, color:HR_INK }}>
          <span>Countries</span>
          <span>Cards</span>
          <span>Matchday</span>
          <span style={{ background:HR_PINK, color:'#fff', padding:'11px 22px', borderRadius:999,
                         fontWeight:800, fontSize:14, cursor:'pointer', whiteSpace:'nowrap' }}>
            Create a fan card
          </span>
        </div>
      </div>

      {/* ── Hero grid ── */}
      <div style={{ padding:`10px ${padH}px 56px`,
                    display:'grid', gridTemplateColumns:'1.08fr .92fr', gap:44, alignItems:'start' }}>

        {/* LEFT: Typography */}
        <div>
          {/* Badge row */}
          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:20 }}>
            <span style={{ background:HR_INK, color:'#fff', fontFamily:HR_MONO, fontSize:11,
                           fontWeight:700, letterSpacing:'.5px', padding:'5px 12px', borderRadius:999 }}>
              ★ 48 teams · fan-made
            </span>
            <span style={{ background:'rgba(20,16,12,.07)', color:HR_INK, fontFamily:HR_MONO,
                           fontSize:11, fontWeight:700, letterSpacing:'.5px',
                           padding:'5px 12px', borderRadius:999 }}>Not FIFA</span>
          </div>

          {/* Headline — fills the space */}
          <div style={{ fontFamily:HR_ANTON, fontSize:82, lineHeight:.98,
                        textTransform:'uppercase', letterSpacing:'-2px' }}>
            <div>Pick your <span style={{ color:HR_PINK }}>country.</span></div>
            <div>Build the <span style={{ color:HR_TANG }}>hype.</span></div>
            <div>Share the <span style={{ color:HR_GRASS }}>road.</span></div>
          </div>

          <div style={{ fontSize:17, lineHeight:1.52, color:'rgba(20,16,12,.58)', marginTop:22,
                        maxWidth:476, fontWeight:500 }}>
            Fan-made World Cup 2026 poster studio — pick your country, build a
            shareable card, post it everywhere. No signup. Free forever.
          </div>

          {/* CTAs */}
          <div style={{ display:'flex', gap:12, marginTop:28 }}>
            <span style={{ background:HR_INK, color:'#fff', fontFamily:HR_UI, fontWeight:800,
                           fontSize:16, padding:'15px 26px', borderRadius:999,
                           cursor:'pointer', whiteSpace:'nowrap' }}>
              Create a fan card →
            </span>
            <span style={{ background:'transparent', color:HR_INK, fontFamily:HR_UI, fontWeight:800,
                           fontSize:16, padding:'15px 26px', borderRadius:999,
                           cursor:'pointer', whiteSpace:'nowrap',
                           boxShadow:'inset 0 0 0 2px rgba(20,16,12,.2)' }}>
              Pick your country
            </span>
          </div>

          {/* Stadium scoreboard chips */}
          <div style={{ marginTop:24 }}>
            {HChips
              ? <HChips chips={chips} />
              : <FallbackChipRow />}
          </div>

          {/* Trending flags */}
          <div style={{ display:'flex', gap:8, marginTop:24, alignItems:'center' }}>
            <span style={{ fontFamily:HR_MONO, fontSize:11, color:'rgba(20,16,12,.46)',
                           letterSpacing:'1px', marginRight:4 }}>TRENDING</span>
            {['BR','AR','FR','EN','MX','JP','MA','TR'].map((c) => (
              <HFlag key={c} code={c} w={34} radius={4} />
            ))}
          </div>

          <div style={{ marginTop:22 }}>
            {HDisc && <HDisc color="rgba(20,16,12,.38)" />}
          </div>
        </div>

        {/* RIGHT: Floating Instagram-Story posters */}
        <div style={{ position:'relative', height:660, display:'flex',
                      alignItems:'center', justifyContent:'center' }}>
          {/* Back-left */}
          <div style={{ position:'absolute', left:'3%', top:72, zIndex:1 }}>
            <StoryCard CardComponent={HPred}
              code="FR" w={188} rot={-6} />
          </div>
          {/* Back-right */}
          <div style={{ position:'absolute', right:'3%', top:44, zIndex:2 }}>
            <StoryCard CardComponent={HPlayer}
              code="TR" w={188} rot={5} />
          </div>
          {/* Front-center */}
          <div style={{ position:'relative', zIndex:3 }}>
            <StoryCard CardComponent={HRoad}
              code="BR" w={204} rot={-1} />
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { WCHero: { UpgradeHero } });
