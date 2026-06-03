// wc-studio.jsx — Card studio (ratio + theme + Pro) and share sheet. Exports window.WCStudio.
const WB = window.WCApp;
const { Tappable: T2, PillBtn: PB, Kicker: KK, TopBar: TB, StudioCard: SC, TEMPLATES: TPL, RATIOS, ALL_CODES: CODES, WHITE: W } = WB;
const { Flag: F2, COUNTRY: CO2, groupOf: gOf2, playersOf: plOf } = window;
const { useState: u2, Fragment: Frag } = React;
const RATIO = window.Cards2.RATIO;

// preview box width per ratio so the card always fits the studio viewport
function previewW(ratio) { return ratio === '16:9' ? 290 : ratio === '1:1' ? 210 : 162; }

// horizontal flag picker
function FlagScroller({ value, onChange, label }) {
  return (
    <div>
      {label && <KK color={W.sub} style={{ marginBottom: 9 }}>{label}</KK>}
      <div style={{ display: 'flex', gap: 9, overflowX: 'auto', paddingBottom: 4 }}>
        {CODES.map((c) => (
          <T2 key={c} onClick={() => onChange(c)} style={{ flexShrink: 0, borderRadius: 8, padding: 3, boxShadow: value === c ? `0 0 0 3px ${W.pink}` : `0 0 0 1px ${W.line}` }}>
            <F2 code={c} w={42} radius={5} shadow={false} />
          </T2>
        ))}
      </div>
    </div>
  );
}

function Stepper({ label, value, onChange }) {
  const btn = (txt, fn) => (
    <T2 onClick={fn} style={{ width: 42, height: 42, borderRadius: 12, background: W.wash, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: W.disp, fontSize: 24, color: W.ink }}>{txt}</T2>
  );
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: W.mono, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', color: W.sub, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {btn('–', () => onChange(Math.max(0, value - 1)))}
        <div style={{ fontFamily: W.disp, fontSize: 30, color: W.ink, minWidth: 28, textAlign: 'center' }}>{value}</div>
        {btn('+', () => onChange(Math.min(9, value + 1)))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, maxLength = 16 }) {
  return (
    <div>
      <div style={{ fontFamily: W.mono, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', color: W.sub, marginBottom: 7 }}>{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}
        style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', background: W.wash, borderRadius: 12, padding: '13px 14px', fontFamily: W.ui, fontWeight: 700, fontSize: 16, color: W.ink }} />
    </div>
  );
}

// segmented control (ratio + theme)
function Segmented({ options, value, onChange, render }) {
  return (
    <div style={{ display: 'flex', gap: 6, background: W.wash, padding: 4, borderRadius: 14 }}>
      {options.map((o) => {
        const active = value === o.id;
        return (
          <T2 key={o.id} onClick={() => onChange(o.id)} style={{ flex: 1, borderRadius: 11, padding: '9px 6px', background: active ? W.base : 'transparent', boxShadow: active ? '0 2px 8px rgba(14,12,10,.1)' : 'none', textAlign: 'center' }}>
            {render(o, active)}
          </T2>
        );
      })}
    </div>
  );
}

function StudioScreen({ cfg, setCfg, ratio, setRatio, theme, setTheme, pro, setPro, go, back, onShare }) {
  const set = (patch) => setCfg((p) => ({ ...p, ...patch }));
  const players = plOf(cfg.code);
  const pw = previewW(ratio);
  const isNight = theme === 'night';
  const locked = isNight && !pro;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.base }}>
      <TopBar onBack={back} title="Card studio" right={
        <T2 onClick={onShare} style={{ fontFamily: W.ui, fontWeight: 800, fontSize: 13, color: '#fff', background: W.pink, padding: '9px 15px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 14 14"><path d="M7 1v9M3.5 4.5L7 1l3.5 3.5M2 9v3a1 1 0 001 1h8a1 1 0 001-1V9" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Share
        </T2>} />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
        {/* preview */}
        <div style={{ padding: '2px 18px 14px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: 250 }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(58% 38% at 50% 32%, ${(TPL.find(t=>t.id===cfg.template)||TPL[0]).tone}1f, transparent 70%)` }}></div>
          <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 44px rgba(14,12,10,.26)', position: 'relative' }}>
            <SC cfg={cfg} w={pw} ratio={ratio} theme={theme} pro={pro} />
            {locked && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,6,4,.5)', backdropFilter: 'blur(3px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#fff' }}>
                <svg width="22" height="22" viewBox="0 0 24 24"><path d="M6 11V8a6 6 0 0112 0v3M5 11h14v9H5z" fill="none" stroke={W.gold} strokeWidth="2" strokeLinejoin="round" /></svg>
                <div style={{ fontFamily: W.disp, fontSize: 20, color: W.gold, textTransform: 'uppercase' }}>Pro theme</div>
              </div>
            )}
          </div>
        </div>

        {/* controls panel */}
        <div style={{ background: W.base, borderTop: `1px solid ${W.line}`, borderRadius: '26px 26px 0 0', marginTop: 2, padding: '16px 18px 16px', boxShadow: '0 -10px 30px rgba(14,12,10,.05)' }}>
          {/* ratio toggle — the critical X-format fix */}
          <KK color={W.sub} style={{ marginBottom: 9 }}>Format · resizes for every app</KK>
          <Segmented options={RATIOS} value={ratio} onChange={setRatio} render={(o, a) => (
            <Frag>
              <div style={{ fontFamily: W.disp, fontSize: 17, color: a ? W.ink : W.sub, lineHeight: 1 }}>{o.label}</div>
              <div style={{ fontFamily: W.mono, fontSize: 9, color: a ? W.pink : W.sub, marginTop: 3, letterSpacing: '.5px', textTransform: 'uppercase' }}>{o.sub}</div>
            </Frag>
          )} />

          {/* theme toggle — Festival vs Night/Gold (Pro) */}
          <KK color={W.sub} style={{ margin: '16px 0 9px' }}>Theme</KK>
          <Segmented options={[{ id: 'color', label: 'Festival' }, { id: 'night', label: 'Night · Gold' }]} value={theme} onChange={setTheme} render={(o, a) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: o.id === 'night' ? 'linear-gradient(135deg,#E7C36B,#0E0C0A)' : 'linear-gradient(135deg,#FF2D6B,#FF6A1A)' }}></span>
              <span style={{ fontFamily: W.ui, fontWeight: 800, fontSize: 13, color: a ? W.ink : W.sub }}>{o.label}</span>
              {o.id === 'night' && <span style={{ fontFamily: W.mono, fontSize: 8, fontWeight: 700, color: '#fff', background: W.gold, padding: '2px 5px', borderRadius: 999 }}>PRO</span>}
            </div>
          )} />

          {/* template chips */}
          <KK color={W.sub} style={{ margin: '18px 0 9px' }}>Template</KK>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
            {TPL.map((t) => (
              <T2 key={t.id} onClick={() => set({ template: t.id })} style={{ flexShrink: 0, fontFamily: W.ui, fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', color: cfg.template === t.id ? '#fff' : W.ink, background: cfg.template === t.id ? W.ink : W.wash, padding: '10px 15px', borderRadius: 999 }}>{t.name}</T2>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FlagScroller label={cfg.template === 'prediction' ? 'Your team' : 'Country'} value={cfg.code} onChange={(c) => set({ code: c, ...(cfg.template === 'player' ? { playerName: plOf(c)[0] } : {}) })} />

            {cfg.template === 'prediction' && (
              <Frag>
                <FlagScroller label="Opponent" value={cfg.opp} onChange={(c) => set({ opp: c })} />
                <div style={{ display: 'flex', gap: 14 }}>
                  <Stepper label={CO2[cfg.code].name} value={cfg.scoreA} onChange={(v) => set({ scoreA: v })} />
                  <Stepper label={CO2[cfg.opp].name} value={cfg.scoreB} onChange={(v) => set({ scoreB: v })} />
                </div>
              </Frag>
            )}

            {cfg.template === 'player' && (
              <Frag>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}><Field label="Player name" value={cfg.playerName} onChange={(v) => set({ playerName: v.toUpperCase() })} placeholder="SURNAME" /></div>
                  <div style={{ width: 84 }}><Field label="Number" value={cfg.playerNum} onChange={(v) => set({ playerNum: v.replace(/[^0-9]/g, '').slice(0, 2) })} placeholder="10" maxLength={2} /></div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {players.map((p) => (
                    <T2 key={p} onClick={() => set({ playerName: p })} style={{ fontFamily: W.mono, fontSize: 11, fontWeight: 700, color: W.ink, background: W.wash, padding: '7px 12px', borderRadius: 999 }}>{p}</T2>
                  ))}
                </div>
              </Frag>
            )}

            {cfg.template === 'custom' && (
              <Frag>
                <Field label="Headline" value={cfg.headline} onChange={(v) => set({ headline: v.toUpperCase() })} placeholder="WE BELIEVE" maxLength={22} />
                <Field label="Sub-line" value={cfg.sub} onChange={(v) => set({ sub: v })} placeholder="Vamos · 2026" maxLength={28} />
              </Frag>
            )}

            {/* monetization: Pro upsell — subtle, not spammy */}
            {!pro && (
              <div onClick={() => setPro(true)} style={{ cursor: 'pointer', background: 'linear-gradient(120deg,#161310,#0E0C0A)', borderRadius: 16, padding: '15px 16px', display: 'flex', alignItems: 'center', gap: 13, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 80% at 90% 10%, rgba(231,195,107,.3), transparent 70%)' }}></div>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(231,195,107,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 7l4 4 5-7 5 7 4-4-2 12H5z" fill={W.gold} /></svg>
                </div>
                <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: W.ui, fontWeight: 800, fontSize: 14.5, color: '#fff' }}>Go Pro</div>
                  <div style={{ fontFamily: W.ui, fontSize: 12.5, color: 'rgba(255,255,255,.62)', marginTop: 2, lineHeight: 1.3 }}>Remove watermark · Night/Gold · premium packs</div>
                </div>
                <div style={{ fontFamily: W.mono, fontSize: 11, fontWeight: 700, color: W.ink, background: W.gold, padding: '8px 12px', borderRadius: 999, position: 'relative', whiteSpace: 'nowrap' }}>$2.99/mo</div>
              </div>
            )}
            {pro && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: W.mono, fontSize: 11, fontWeight: 700, color: '#0a8c54', background: 'rgba(10,140,84,.1)', padding: '11px 14px', borderRadius: 12 }}>
                ★ PRO ACTIVE · watermark removed · all themes unlocked
                <span onClick={() => setPro(false)} style={{ marginLeft: 'auto', cursor: 'pointer', color: W.sub, textDecoration: 'underline' }}>reset</span>
              </div>
            )}

            <PB bg={W.pink} onClick={onShare} style={{ marginTop: 2 }}>Share this card →</PB>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── SHARE SHEET ───────────────────────────
const SHARE_TARGETS = [
  { id: 'ig', name: 'Instagram', tone: '#E1306C', glyph: 'ig' },
  { id: 'x', name: 'X', tone: '#000', glyph: 'x' },
  { id: 'wa', name: 'WhatsApp', tone: '#25D366', glyph: 'wa' },
  { id: 'tg', name: 'Telegram', tone: '#2AABEE', glyph: 'tg' },
  { id: 'copy', name: 'Copy link', tone: '#6C4CFF', glyph: 'link' },
  { id: 'dl', name: 'Download', tone: '#14100C', glyph: 'dl' },
];
function TargetGlyph({ g }) {
  const s = { width: 22, height: 22, fill: 'none', stroke: '#fff', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (g === 'ig') return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" /></svg>;
  if (g === 'x') return <svg viewBox="0 0 24 24" style={{ ...s, strokeWidth: 0, fill: '#fff' }}><path d="M17 3h3l-6.5 7.5L21 21h-5.5l-4-5-4.7 5H3.5l7-7.6L3 3h5.6l3.6 4.7L17 3z" /></svg>;
  if (g === 'wa') return <svg viewBox="0 0 24 24" style={s}><path d="M3 21l1.6-4.5A8 8 0 1112 20a8 8 0 01-4.3-1.2L3 21z" /><path d="M9 9c0 4 2 6 6 6" /></svg>;
  if (g === 'tg') return <svg viewBox="0 0 24 24" style={s}><path d="M21 4L3 11l5 2 2 6 3-4 5 4 3-15z" /></svg>;
  if (g === 'link') return <svg viewBox="0 0 24 24" style={s}><path d="M9 15l6-6M10 6l1-1a4 4 0 016 6l-1 1M14 18l-1 1a4 4 0 01-6-6l1-1" /></svg>;
  return <svg viewBox="0 0 24 24" style={s}><path d="M12 3v11M8 10l4 4 4-4M5 19h14" /></svg>;
}

function ShareSheet({ cfg, ratio, theme, pro, onClose, onToast, exportRef }) {
  const doShare = async (t) => {
    if (t.id === 'dl') {
      try {
        const node = exportRef.current;
        if (window.htmlToImage && node) {
          const url = await window.htmlToImage.toPng(node, { pixelRatio: 2, cacheBust: true });
          const a = document.createElement('a');
          a.href = url; a.download = `wc26-${cfg.template}-${ratio.replace(':', 'x')}.png`; a.click();
          onToast('Card saved as PNG ★');
        } else { onToast('Saved to your photos ★'); }
      } catch (e) { onToast('Saved to your photos ★'); }
    } else if (t.id === 'copy') {
      onToast('Link copied to clipboard');
    } else {
      onToast(`Shared to ${t.name} ★`);
    }
    setTimeout(onClose, 650);
  };
  const ratioLabel = { '9:16': '9:16 Story', '1:1': '1:1 Square', '16:9': '16:9 X / feed' }[ratio];
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(14,12,10,.5)', backdropFilter: 'blur(2px)', animation: 'wcFade .2s ease' }}></div>
      <div style={{ position: 'relative', background: W.base, borderRadius: '26px 26px 0 0', padding: '14px 20px calc(34px + 16px)', animation: 'wcSheet .28s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: W.line, margin: '0 auto 16px' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 20px rgba(14,12,10,.18)', flexShrink: 0 }}><SC cfg={cfg} w={ratio === '16:9' ? 104 : 60} ratio={ratio} theme={theme} pro={pro} /></div>
          <div>
            <div style={{ fontFamily: W.disp, fontSize: 25, textTransform: 'uppercase', color: W.ink, lineHeight: 1 }}>Share it</div>
            <div style={{ fontFamily: W.ui, fontSize: 13, color: W.sub, marginTop: 4 }}>{ratioLabel} · ready to post</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 20 }}>
          {SHARE_TARGETS.map((t) => (
            <T2 key={t.id} onClick={() => doShare(t)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: t.tone, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(14,12,10,.16)' }}><TargetGlyph g={t.glyph} /></div>
              <span style={{ fontFamily: W.ui, fontWeight: 700, fontSize: 12.5, color: W.ink }}>{t.name}</span>
            </T2>
          ))}
        </div>
        <Disc color={W.sub} style={{ marginTop: 18, fontSize: 9 }} />
      </div>
    </div>
  );
}
const Disc = window.Disclaimer;

window.WCStudio = { StudioScreen, ShareSheet, previewW };
