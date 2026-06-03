// wc-screens.jsx — white-chrome screens with bold poster outputs. Exports window.WCScreens.
const WA = window.WCApp;
const { Tappable, PillBtn, Kicker, TopBar, TOP, ALL_CODES, WHITE: W } = WA;
const C2 = window.Cards2;
const { Flag: SFlag, COUNTRY: SCO, groupOf: sGroupOf } = window;
const FX = window.FX;
const { useState: uS } = React;
const Disclaimer = window.Disclaimer;

// poster tile wrapper — rounded, deep shadow, tappable
function Poster({ children, onClick, radius = 16, lift = true, style = {} }) {
  return (
    <Tappable onClick={onClick} style={{ borderRadius: radius, overflow: 'hidden', boxShadow: lift ? '0 18px 40px rgba(14,12,10,.22)' : '0 8px 20px rgba(14,12,10,.14)', ...style }}>
      {children}
    </Tappable>
  );
}

// ─────────────────────────── HOME ───────────────────────────
function HomeScreen({ go }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.base }}>
      <TopBar right={<Tappable onClick={() => go('studio', {})} style={{ fontFamily: W.ui, fontWeight: 800, fontSize: 13, color: '#fff', background: W.ink, padding: '9px 15px', borderRadius: 999 }}>Create</Tappable>} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 28px' }}>
        {/* hero */}
        <div style={{ fontFamily: W.disp, fontSize: 56, lineHeight: .94, textTransform: 'uppercase', letterSpacing: '-1px', color: W.ink, marginTop: 6 }}>
          <div style={{ whiteSpace: 'nowrap' }}>Pick your</div>
          <div style={{ whiteSpace: 'nowrap', color: W.pink }}>country.</div>
          <div style={{ whiteSpace: 'nowrap' }}>Build the</div>
          <div style={{ whiteSpace: 'nowrap', color: W.tang }}>hype.</div>
        </div>
        <div style={{ fontFamily: W.ui, fontSize: 15, lineHeight: 1.5, color: W.sub, marginTop: 14 }}>
          Fan-made World Cup 2026 posters for any of 48 teams — roads, prediction battles, player-watch cards & group chaos.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
          <PillBtn bg={W.ink} onClick={() => go('studio', {})}>Create a fan card →</PillBtn>
          <PillBtn bg="transparent" color={W.ink} shadow={false} onClick={() => go('picker', {})} style={{ boxShadow: 'inset 0 0 0 2px rgba(14,12,10,.14)' }}>Pick your country</PillBtn>
        </div>
        {/* trending flag rail — primary hook */}
        <div style={{ marginTop: 24 }}>
          <Kicker color={W.sub}>Trending teams · tap to open</Kicker>
          <div style={{ display: 'flex', gap: 10, marginTop: 10, overflowX: 'auto', paddingBottom: 6 }}>
            {['BR', 'AR', 'FR', 'EN', 'MX', 'JP', 'MA', 'TR', 'PT', 'DE', 'ES', 'NL'].map((c) => (
              <Tappable key={c} onClick={() => go('country', { code: c })} style={{ flexShrink: 0 }}>
                <SFlag code={c} w={52} radius={7} />
              </Tappable>
            ))}
          </div>
        </div>
        {/* featured poster */}
        <div style={{ marginTop: 20 }}>
          <Kicker>Featured · tap to remix</Kicker>
          <Poster onClick={() => go('studio', { template: 'road', code: 'TR' })} radius={18} style={{ marginTop: 10 }}>
            <C2.Road code="TR" ratio="16:9" w={354} />
          </Poster>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <Poster onClick={() => go('studio', { template: 'upset', code: 'JP' })} radius={14}><C2.Upset code="JP" ratio="9:16" w={171} /></Poster>
          <Poster onClick={() => go('studio', { template: 'prediction', code: 'MX', opp: 'ZA' })} radius={14}><C2.Prediction a="MX" b="ZA" ratio="9:16" w={171} /></Poster>
        </div>
        <Disclaimer color={W.sub} style={{ marginTop: 20, fontSize: 9 }} />
      </div>
    </div>
  );
}

// ─────────────────────────── PICKER ───────────────────────────
function PickerScreen({ go, back }) {
  const [q, setQ] = uS('');
  const list = ALL_CODES.filter((c) => SCO[c].name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.base }}>
      <TopBar onBack={back} title="Pick your country" />
      <div style={{ padding: '4px 18px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: W.wash, borderRadius: 14, padding: '12px 15px' }}>
          <svg width="17" height="17" viewBox="0 0 17 17"><circle cx="7" cy="7" r="5.5" stroke={W.sub} strokeWidth="2" fill="none" /><path d="M11 11l4 4" stroke={W.sub} strokeWidth="2" strokeLinecap="round" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 48 teams"
            style={{ border: 'none', outline: 'none', fontFamily: W.ui, fontSize: 16, flex: 1, background: 'transparent', color: W.ink }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 18px 30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {list.map((c) => {
            const co = SCO[c]; const { group } = sGroupOf(c);
            return (
              <Tappable key={c} onClick={() => go('country', { code: c })} style={{ background: W.base, borderRadius: 16, padding: 13, boxShadow: '0 6px 16px rgba(14,12,10,.07)', border: `1px solid ${W.line}`, display: 'flex', alignItems: 'center', gap: 11 }}>
                <SFlag code={c} w={42} radius={5} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: W.ui, fontWeight: 800, fontSize: 14.5, color: W.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{co.name}</div>
                  <div style={{ fontFamily: W.mono, fontSize: 10, color: W.sub }}>GROUP {group}</div>
                </div>
              </Tappable>
            );
          })}
        </div>
        {list.length === 0 && <div style={{ fontFamily: W.ui, color: W.sub, textAlign: 'center', marginTop: 30 }}>No teams match “{q}”.</div>}
      </div>
    </div>
  );
}

// ─────────────────────────── COUNTRY HUB ───────────────────────────
function CountryScreen({ code, go, back }) {
  const c = SCO[code]; const { group, teams, opponents } = sGroupOf(code);
  const dates = window.DATES, times = window.TIMES;
  const [reminders, setReminders] = uS({ 0: true });
  const toggle = (i) => setReminders((r) => ({ ...r, [i]: !r[i] }));
  const nextOpp = opponents[0];
  const sh = C2.shade;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.base }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* full-bleed team hero */}
        <div style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(158deg, ${sh(c.c1, 8)}, ${sh(c.c1, -34)})`, color: '#fff' }}>
          <FX.Floods tint="rgba(255,248,222,.4)" />
          <FX.PitchArc color="rgba(255,255,255,.13)" stroke={2} />
          <FX.Streamers n={26} seed={4} style={{ opacity: .7 }} />
          <FX.Vignette strength={.42} />
          <FX.Grain opacity={.12} />
          <div style={{ position: 'relative' }}>
            <TopBar onBack={back} dark right={<Tappable style={{ fontFamily: W.mono, fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#fff', background: 'rgba(255,255,255,.18)', padding: '8px 12px', borderRadius: 999 }}>★ Following</Tappable>} />
            <div style={{ padding: '6px 18px 22px' }}>
              <Kicker color="rgba(255,255,255,.85)">My World Cup hub · Group {group}</Kicker>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                <SFlag code={code} w={90} ring radius={9} />
                <div style={{ fontFamily: W.disp, fontSize: 58, lineHeight: .82, textTransform: 'uppercase', letterSpacing: '-1px', textShadow: '0 8px 24px rgba(0,0,0,.35)' }}>{c.name}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
                <PillBtn bg="#fff" color={W.ink} onClick={() => go('studio', { template: 'road', code })}>Create schedule poster</PillBtn>
                <PillBtn bg="rgba(255,255,255,.18)" color="#fff" shadow={false} onClick={() => go('studio', { template: 'prediction', code, opp: nextOpp })}>Create prediction card</PillBtn>
              </div>
            </div>
          </div>
        </div>
        {/* group path */}
        <div style={{ padding: '22px 18px 8px' }}>
          <Kicker color={c.ink}>Group {group} · the path</Kicker>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
            {teams.map((g, i) => (
              <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 12, background: g === code ? c.c1 : W.base, color: g === code ? '#fff' : W.ink, borderRadius: 14, padding: '12px 14px', border: g === code ? 'none' : `1px solid ${W.line}` }}>
                <SFlag code={g} w={38} radius={5} />
                <div style={{ fontFamily: W.ui, fontWeight: 800, fontSize: 15.5 }}>{SCO[g].name}</div>
                <div style={{ marginLeft: 'auto', fontFamily: W.mono, fontSize: 10, opacity: .7 }}>{['SEED', 'POT 2', 'POT 3', 'POT 4'][i]}</div>
              </div>
            ))}
          </div>
        </div>
        {/* exactly 3 matchups */}
        <div style={{ padding: '14px 18px 8px' }}>
          <Kicker color={c.ink}>Three matchups</Kicker>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {opponents.map((o, i) => (
              <div key={o} style={{ background: W.base, borderRadius: 18, overflow: 'hidden', border: `1px solid ${W.line}`, boxShadow: '0 6px 16px rgba(14,12,10,.05)' }}>
                <div style={{ padding: '15px 16px' }}>
                  <div style={{ fontFamily: W.mono, fontSize: 10, color: W.sub, letterSpacing: '1px' }}>MATCHDAY {i + 1} · {dates[i]} · {times[i]}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 10 }}>
                    <SFlag code={code} w={40} radius={5} />
                    <span style={{ fontFamily: W.disp, fontSize: 22, color: W.sub }}>vs</span>
                    <SFlag code={o} w={40} radius={5} />
                    <span style={{ fontFamily: W.ui, fontWeight: 800, fontSize: 15, marginLeft: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{SCO[o].name}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderTop: `1px solid ${W.line}` }}>
                  <Tappable onClick={() => go('studio', { template: 'prediction', code, opp: o })} style={{ fontFamily: W.ui, fontWeight: 800, fontSize: 13, color: c.ink }}>Make matchday card →</Tappable>
                  <Tappable onClick={() => toggle(i)} style={{ fontFamily: W.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: reminders[i] ? '#fff' : W.ink, background: reminders[i] ? '#11B886' : W.wash, padding: '7px 11px', borderRadius: 999 }}>{reminders[i] ? '★ Reminder set' : '+ Remind me'}</Tappable>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* opponent watch */}
        <div style={{ padding: '14px 18px 28px' }}>
          <div style={{ background: W.ink, color: '#fff', borderRadius: 20, padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 50% at 85% 12%, rgba(255,45,107,.3), transparent 70%)' }}></div>
            <Kicker color={W.gold}>Opponent watch · next up</Kicker>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
              <SFlag code={nextOpp} w={56} ring radius={7} />
              <div style={{ fontFamily: W.disp, fontSize: 32, textTransform: 'uppercase', lineHeight: .9 }}>{SCO[nextOpp].name}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {[['Talking point', 'Set-piece threat from the back line'], ['Watch the gap', 'High press can leave space in behind'], ['Fan verdict', '“Winnable. Loud. Believe.”']].map(([h, b]) => (
                <div key={h} style={{ background: 'rgba(255,255,255,.07)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontFamily: W.mono, fontSize: 9.5, letterSpacing: '1px', color: 'rgba(255,255,255,.55)' }}>{h.toUpperCase()}</div>
                  <div style={{ fontFamily: W.ui, fontSize: 13.5, marginTop: 4, lineHeight: 1.35 }}>{b}</div>
                </div>
              ))}
            </div>
          </div>
          <Disclaimer color={W.sub} style={{ marginTop: 18, fontSize: 9 }} />
        </div>
      </div>
    </div>
  );
}

window.WCScreens = { HomeScreen, PickerScreen, CountryScreen, Poster };
