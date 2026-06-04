// wc-poster-upgrade.jsx — ULTRAS STADIUM BANNER poster templates for WC26 Hub
// Requires: wc-shared.jsx (window.Flag, window.COUNTRY, window.groupOf, window.playersOf, window.DATES)
// Exports: window.WCPosterUpgrade

const { Flag: UFlag, COUNTRY: UC, groupOf: uGroupOf, playersOf: uPlayersOf } = window;
const uDATES = window.DATES || ['Jun 13', 'Jun 19', 'Jun 25'];

const UP_DARK  = '#0E0C0A';
const UP_GOLD  = '#E7C36B';
const UP_ANTON = 'var(--font-anton, Anton, sans-serif)';
const UP_UI    = 'Archivo, system-ui, sans-serif';
const UP_MONO  = '"Space Mono", monospace';

// ── Helpers ─────────────────────────────────────────────────────────────────

function upShade(hex, pct) {
  const n = parseInt(hex.replace('#',''), 16);
  let r = (n>>16)&255, g = (n>>8)&255, b = n&255;
  const f = pct/100;
  r = Math.round(r + (f>0 ? 255-r : r)*f);
  g = Math.round(g + (f>0 ? 255-g : g)*f);
  b = Math.round(b + (f>0 ? 255-b : b)*f);
  return `rgb(${Math.max(0,Math.min(255,r))},${Math.max(0,Math.min(255,g))},${Math.max(0,Math.min(255,b))})`;
}

// Heavy grain overlay — unique filter per template instance
function UGrain({ id = 'u', opacity = 0.5 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%',
               pointerEvents:'none', mixBlendMode:'overlay', display:'block' }}
      preserveAspectRatio="xMidYMid slice">
      <filter id={`ugr-${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#ugr-${id})`} opacity={opacity} />
    </svg>
  );
}

// Floodlight beams from top corners
function ULights({ tint = 'rgba(255,255,255,.18)' }) {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      <div style={{ position:'absolute', top:'-28%', left:'-12%', width:'62%', height:'125%',
                    background:`linear-gradient(175deg, ${tint} 0%, transparent 50%)`,
                    transform:'rotate(22deg)', filter:'blur(18px)' }} />
      <div style={{ position:'absolute', top:'-28%', right:'-12%', width:'62%', height:'125%',
                    background:`linear-gradient(185deg, ${tint} 0%, transparent 50%)`,
                    transform:'rotate(-22deg)', filter:'blur(18px)' }} />
    </div>
  );
}

// Radial vignette
function UVig({ opacity = 0.6 }) {
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none',
                  background:`radial-gradient(ellipse 118% 112% at 50% 50%, transparent 28%, rgba(0,0,0,${opacity}) 100%)` }} />
  );
}

// Abstract boot silhouette (no brand, rights-safe)
function BootSVG({ color = '#fff', opacity = 0.06, style = {} }) {
  return (
    <svg viewBox="0 0 180 260" xmlns="http://www.w3.org/2000/svg"
      style={{ position:'absolute', opacity, ...style }}>
      <rect x="44" y="8" width="50" height="150" rx="10" fill={color} />
      <path d="M44,145 Q44,186 68,193 L168,193 Q184,193 184,178 L184,165 Q184,153 168,153 L82,153 Q76,153 76,146 L76,118" fill={color} />
      <rect x="42" y="189" width="144" height="18" rx="5" fill={color} opacity="0.5" />
      {[60,88,116,144].map(x => <circle key={x} cx={x} cy={218} r={5} fill={color} opacity="0.35" />)}
    </svg>
  );
}

// ── Shared label / disclaimer ────────────────────────────────────────────────
function UKicker({ children, color = UP_GOLD, s = 1 }) {
  return <div style={{ fontFamily:UP_MONO, fontSize:10*s, letterSpacing:'3px', color, textTransform:'uppercase' }}>{children}</div>;
}
function UDisc({ s = 1 }) {
  return <div style={{ fontFamily:UP_MONO, fontSize:7*s, color:'rgba(255,255,255,.18)', letterSpacing:'.3px' }}>WC26 HUB · FAN-MADE · NOT AFFILIATED WITH FIFA</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. COUNTRY ROAD
// ─────────────────────────────────────────────────────────────────────────────
function URoadCard({ code = 'TR', w = 540 }) {
  const c = UC[code]; const s = w/540;
  const h = Math.round(w*16/9);
  const flagH = Math.round(h*0.40);
  const { group, opponents: opp } = uGroupOf(code);
  const namePx = Math.min(86*s, Math.round((w-56*s)/(Math.max(c.name.length,1)*0.38)));

  return (
    <div style={{ width:w, height:h, position:'relative', overflow:'hidden', background:UP_DARK, fontFamily:UP_UI }}>
      {/* Full-width flag top 40% */}
      <div style={{ position:'absolute', top:0, left:0, width:'100%', height:flagH, overflow:'hidden' }}>
        <UFlag code={code} w={w} radius={0} shadow={false} style={{ display:'block', width:'100%', height:'100%' }} />
        {/* Fade flag → dark */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'82%',
                      background:`linear-gradient(to bottom, transparent, ${UP_DARK})` }} />
      </div>
      {/* Team color atmosphere */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:flagH*1.3,
                    background:`radial-gradient(ellipse 110% 100% at 50% 0%, ${c.c1}22 0%, transparent 70%)` }} />
      <ULights tint={`${c.c1}1c`} />
      <UGrain id={`road-${code}`} opacity={0.5} />
      <UVig opacity={0.55} />

      {/* Content — from below flag edge to bottom */}
      <div style={{ position:'absolute', top:flagH-38*s, bottom:0, left:30*s, right:30*s,
                    display:'flex', flexDirection:'column', color:'#fff' }}>
        <UKicker s={s}>Road to 2026</UKicker>
        <div style={{ fontFamily:UP_ANTON, fontSize:namePx, lineHeight:.86,
                      textTransform:'uppercase', letterSpacing:'-1px', marginTop:7*s,
                      textShadow:'0 4px 22px rgba(0,0,0,.5)' }}>{c.name}</div>
        <div style={{ fontFamily:UP_MONO, fontSize:9*s, color:'rgba(255,255,255,.38)',
                      letterSpacing:'2px', marginTop:9*s }}>GROUP {group} · MATCHDAYS 1–3</div>

        {/* Match rows pushed to bottom */}
        <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', gap:8*s }}>
          {opp.map((o, i) => (
            <div key={o} style={{ display:'flex', alignItems:'center', gap:10*s,
                                  background:'rgba(255,255,255,.07)', backdropFilter:'blur(8px)',
                                  border:'1px solid rgba(255,255,255,.09)',
                                  borderRadius:7*s, padding:`${10*s}px ${13*s}px` }}>
              <span style={{ fontFamily:UP_MONO, fontSize:9*s, color:UP_GOLD, minWidth:26*s }}>MD{i+1}</span>
              <UFlag code={o} w={32*s} radius={3} shadow={false} />
              <span style={{ fontFamily:UP_UI, fontWeight:700, fontSize:13*s, flex:1,
                             textTransform:'uppercase', letterSpacing:'.3px',
                             whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>vs {UC[o].name}</span>
              <span style={{ fontFamily:UP_MONO, fontSize:9*s, color:'rgba(255,255,255,.34)' }}>{uDATES[i]}</span>
            </div>
          ))}
          <UDisc s={s} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PREDICTION BATTLE
// ─────────────────────────────────────────────────────────────────────────────
function UPredCard({ a = 'MX', b = 'ZA', scoreA = 2, scoreB = 1, w = 540 }) {
  const s = w/540; const h = Math.round(w*16/9);
  const A = UC[a], B = UC[b];
  const { group } = uGroupOf(a);

  return (
    <div style={{ width:w, height:h, position:'relative', overflow:'hidden', background:UP_DARK, fontFamily:UP_UI }}>
      {/* Split colour backgrounds */}
      <div style={{ position:'absolute', inset:0,
                    background:`linear-gradient(to right, ${A.c1}cc 0%, ${UP_DARK} 50%, ${B.c1}cc 100%)` }} />
      {/* Dark centre band */}
      <div style={{ position:'absolute', inset:0,
                    background:'linear-gradient(to right, rgba(14,12,10,.25) 0%, rgba(14,12,10,.94) 46%, rgba(14,12,10,.94) 54%, rgba(14,12,10,.25) 100%)' }} />
      <UGrain id={`pred-${a}${b}`} opacity={0.52} />
      <UVig opacity={0.38} />

      <div style={{ position:'absolute', inset:0, padding:`${30*s}px ${28*s}px`,
                    display:'flex', flexDirection:'column', color:'#fff' }}>
        <UKicker s={s} color="rgba(231,195,107,.9)">Prediction · Group {group}</UKicker>

        {/* Flags + VS + Scores */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'space-between',
                      gap:10*s, marginTop:18*s }}>
          {/* Team A */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:10*s }}>
            <UFlag code={a} w={96*s} radius={8} ring shadow={false} />
            <div style={{ fontFamily:UP_ANTON, fontSize:20*s, textTransform:'uppercase', textAlign:'center',
                          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%' }}>{A.name}</div>
            <div style={{ background:'#fff', color:'#000', fontFamily:UP_ANTON, fontSize:76*s, lineHeight:1,
                          width:'100%', textAlign:'center', padding:`${6*s}px 0`,
                          borderRadius:4*s, boxShadow:'0 8px 28px rgba(0,0,0,.44)' }}>{scoreA}</div>
          </div>

          {/* VS */}
          <div style={{ flexShrink:0, textAlign:'center' }}>
            <div style={{ fontFamily:UP_ANTON, fontSize:118*s, color:UP_GOLD, lineHeight:.82,
                          textShadow:`0 0 44px ${UP_GOLD}55` }}>VS</div>
          </div>

          {/* Team B */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:10*s }}>
            <UFlag code={b} w={96*s} radius={8} ring shadow={false} />
            <div style={{ fontFamily:UP_ANTON, fontSize:20*s, textTransform:'uppercase', textAlign:'center',
                          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%' }}>{B.name}</div>
            <div style={{ background:'#fff', color:'#000', fontFamily:UP_ANTON, fontSize:76*s, lineHeight:1,
                          width:'100%', textAlign:'center', padding:`${6*s}px 0`,
                          borderRadius:4*s, boxShadow:'0 8px 28px rgba(0,0,0,.44)' }}>{scoreB}</div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ paddingTop:18*s, borderTop:'1px solid rgba(255,255,255,.1)',
                      display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontFamily:UP_MONO, fontSize:9*s, color:'rgba(255,255,255,.42)',
                        letterSpacing:'1.5px', textTransform:'uppercase' }}>
            {A.name} vs {B.name} · Group {group}
          </div>
          <div style={{ fontFamily:UP_MONO, fontSize:9*s, color:UP_GOLD }}>MY CALL ★</div>
        </div>
        <div style={{ marginTop:8*s }}><UDisc s={s} /></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PLAYER WATCH
// ─────────────────────────────────────────────────────────────────────────────
function UPlayerCard({ name = 'MBAPPÉ', code = 'FR', number = '10', w = 540 }) {
  const s = w/540; const h = Math.round(w*16/9);
  const c = UC[code];
  const namePx = Math.min(88*s, Math.round((w-50*s)/(Math.max(name.length,1)*0.44)));

  return (
    <div style={{ width:w, height:h, position:'relative', overflow:'hidden', background:UP_DARK, fontFamily:UP_UI }}>
      {/* Team colour flood top-left */}
      <div style={{ position:'absolute', inset:0,
                    background:`linear-gradient(158deg, ${c.c1}52 0%, ${UP_DARK} 52%)` }} />
      {/* Jersey number — huge watermark */}
      <div style={{ position:'absolute', right:-10*s, bottom:'8%',
                    fontFamily:UP_ANTON, fontSize:280*s, color:'#fff', opacity:0.095,
                    lineHeight:1, pointerEvents:'none', userSelect:'none', letterSpacing:'-8px' }}>
        {number}
      </div>
      <ULights tint={`${c.c1}24`} />
      <UGrain id={`player-${code}`} opacity={0.5} />
      <UVig opacity={0.5} />

      <div style={{ position:'absolute', inset:0, padding:`${30*s}px ${30*s}px ${32*s}px`,
                    display:'flex', flexDirection:'column', color:'#fff' }}>
        {/* Top row */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10*s }}>
            <UFlag code={code} w={72*s} radius={6} ring shadow={false} />
            <UKicker s={s}>Player to Watch</UKicker>
          </div>
          <div style={{ fontFamily:UP_MONO, fontSize:9*s, color:'rgba(255,255,255,.28)',
                        letterSpacing:'1.5px', marginTop:4*s, textAlign:'right' }}>WC26 · 2026</div>
        </div>

        {/* Player name + footer pushed to bottom */}
        <div style={{ marginTop:'auto' }}>
          <div style={{ fontFamily:UP_MONO, fontSize:9*s, color:'rgba(255,255,255,.42)',
                        letterSpacing:'2.5px', textTransform:'uppercase', marginBottom:8*s }}>
            {c.name} · WC 2026
          </div>
          <div style={{ fontFamily:UP_ANTON, fontSize:namePx, lineHeight:.84,
                        textTransform:'uppercase', letterSpacing:'-1.5px',
                        textShadow:'0 4px 30px rgba(0,0,0,.65)' }}>
            {name}
          </div>
          <div style={{ marginTop:14*s }}><UDisc s={s} /></div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GROUP OF CHAOS
// ─────────────────────────────────────────────────────────────────────────────
function UChaosCard({ code = 'BR', w = 540 }) {
  const s = w/540; const h = Math.round(w*16/9);
  const { group, teams } = uGroupOf(code);

  return (
    <div style={{ width:w, height:h, position:'relative', overflow:'hidden', background:UP_DARK, fontFamily:UP_UI }}>
      <ULights tint={`${UP_GOLD}16`} />
      <UGrain id={`chaos-${code}`} opacity={0.54} />
      <UVig opacity={0.5} />

      <div style={{ position:'absolute', inset:0, padding:`${32*s}px`, display:'flex', flexDirection:'column', color:'#fff' }}>
        <UKicker s={s}>Group Stage · 2026</UKicker>

        {/* Big angled headline */}
        <div style={{ marginTop:10*s }}>
          <div style={{ fontFamily:UP_ANTON, fontSize:58*s, textTransform:'uppercase', lineHeight:.9 }}>
            Group {group} of
          </div>
          <div style={{ fontFamily:UP_ANTON, fontSize:108*s, textTransform:'uppercase', lineHeight:.78,
                        color:UP_GOLD, transform:'rotate(-2deg)', transformOrigin:'left center',
                        letterSpacing:'-2px', marginTop:4*s }}>
            CHAOS
          </div>
        </div>

        {/* 4 team tiles — each with team primary colour bg */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10*s, marginTop:22*s }}>
          {teams.map((t) => (
            <div key={t} style={{ background:`linear-gradient(140deg, ${UC[t].c1}dd, ${UC[t].c1}88)`,
                                  borderRadius:8*s, padding:`${12*s}px ${14*s}px`,
                                  display:'flex', alignItems:'center', gap:10*s,
                                  border:'1px solid rgba(255,255,255,.10)',
                                  boxShadow:'0 4px 16px rgba(0,0,0,.4)' }}>
              <UFlag code={t} w={36*s} radius={3} shadow={false} />
              <span style={{ fontFamily:UP_ANTON, fontSize:18*s, textTransform:'uppercase',
                             color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                             textShadow:'0 2px 8px rgba(0,0,0,.45)' }}>{UC[t].name}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop:'auto' }}>
          <div style={{ fontFamily:UP_ANTON, fontSize:28*s, textTransform:'uppercase', color:UP_GOLD }}>
            Who survives?
          </div>
          <div style={{ marginTop:8*s }}><UDisc s={s} /></div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GOLDEN BOOT DEBATE
// ─────────────────────────────────────────────────────────────────────────────
function UBootCard({ code = 'FR', w = 540 }) {
  const s = w/540; const h = Math.round(w*16/9);
  let slots = [['MBAPPÉ','FR'],['HAALAND','NO'],['VINÍCIUS JR','BR'],['KANE','EN']];
  if (code !== 'FR') {
    const p = uPlayersOf(code)[0];
    slots = [[p, code], slots[0], slots[1], slots[2]];
  }

  return (
    <div style={{ width:w, height:h, position:'relative', overflow:'hidden', background:UP_DARK, fontFamily:UP_UI }}>
      {/* Boot silhouette watermark */}
      <BootSVG color={UP_GOLD} opacity={0.055}
        style={{ right:-40*s, bottom:-20*s, width:300*s, height:430*s }} />
      <ULights tint={`${UP_GOLD}16`} />
      <UGrain id={`boot-${code}`} opacity={0.5} />
      <UVig opacity={0.55} />

      <div style={{ position:'absolute', inset:0, padding:`${32*s}px`, display:'flex', flexDirection:'column', color:'#fff' }}>
        <UKicker s={s}>The Debate</UKicker>
        <div style={{ fontFamily:UP_ANTON, fontSize:72*s, lineHeight:.86,
                      textTransform:'uppercase', marginTop:8*s }}>
          Golden<br />Boot?
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10*s, marginTop:24*s }}>
          {slots.map(([nm, fc], i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:12*s,
              background: i===0 ? `${UP_GOLD}18` : 'rgba(255,255,255,.06)',
              border: i===0 ? `1px solid ${UP_GOLD}44` : '1px solid rgba(255,255,255,.07)',
              borderRadius:8*s, padding:`${12*s}px ${14*s}px`,
              boxShadow: i===0 ? `0 0 22px ${UP_GOLD}22` : 'none',
            }}>
              <span style={{ fontFamily:UP_ANTON, fontSize:22*s, width:28*s,
                             color: i===0 ? UP_GOLD : 'rgba(255,255,255,.32)' }}>{i+1}</span>
              <UFlag code={fc} w={34*s} radius={3} shadow={false} />
              <span style={{ fontFamily:UP_UI, fontWeight:700, fontSize:16*s, flex:1,
                             textTransform:'uppercase', letterSpacing:'.3px',
                             color: i===0 ? '#fff' : 'rgba(255,255,255,.72)',
                             whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{nm}</span>
              {i===0 && <span style={{ fontFamily:UP_MONO, fontSize:8*s, color:UP_GOLD }}>MY PICK ★</span>}
            </div>
          ))}
        </div>

        <div style={{ marginTop:'auto' }}><UDisc s={s} /></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. UPSET WATCH
// ─────────────────────────────────────────────────────────────────────────────
function UUpsetCard({ code = 'JP', w = 540 }) {
  const s = w/540; const h = Math.round(w*16/9);
  const c = UC[code];
  const { group } = uGroupOf(code);
  const namePx = Math.min(82*s, Math.round((w-56*s)/(Math.max(c.name.length,1)*0.38)));

  return (
    <div style={{ width:w, height:h, position:'relative', overflow:'hidden', background:UP_DARK, fontFamily:UP_UI }}>
      {/* Team colour glow */}
      <div style={{ position:'absolute', inset:0,
                    background:`radial-gradient(ellipse 100% 80% at 28% 28%, ${c.c1}2e 0%, transparent 65%)` }} />
      <ULights tint={`${c.c1}22`} />
      <UGrain id={`upset-${code}`} opacity={0.5} />
      <UVig opacity={0.6} />

      <div style={{ position:'absolute', inset:0, padding:`${32*s}px`, display:'flex', flexDirection:'column', color:'#fff' }}>
        <UKicker s={s}>Upset Watch · Group {group}</UKicker>
        <div style={{ marginTop:20*s }}>
          <UFlag code={code} w={100*s} radius={8} ring shadow={false} />
        </div>
        <div style={{ fontFamily:UP_ANTON, fontSize:namePx, lineHeight:.86,
                      textTransform:'uppercase', letterSpacing:'-1px', marginTop:18*s,
                      textShadow:'0 4px 22px rgba(0,0,0,.5)' }}>{c.name}</div>
        <div style={{ fontFamily:UP_ANTON, fontSize:34*s, textTransform:'uppercase',
                      lineHeight:.9, color:c.c1, marginTop:10*s }}>
          Can shock<br />the group
        </div>
        <div style={{ display:'flex', gap:8*s, marginTop:18*s, flexWrap:'wrap' }}>
          {['Dark Horse', 'Believe ★', `Group ${group}`].map((chip) => (
            <span key={chip} style={{ fontFamily:UP_MONO, fontSize:9*s,
                                      color:'rgba(255,255,255,.62)',
                                      background:'rgba(255,255,255,.08)',
                                      border:'1px solid rgba(255,255,255,.1)',
                                      borderRadius:4*s, padding:`${5*s}px ${10*s}px`,
                                      letterSpacing:'1px', textTransform:'uppercase' }}>{chip}</span>
          ))}
        </div>
        <div style={{ marginTop:'auto' }}><UDisc s={s} /></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MATCHDAY MENU
// ─────────────────────────────────────────────────────────────────────────────
function UMenuCard({ code = 'MX', w = 540 }) {
  const s = w/540; const h = Math.round(w*16/9);
  const { group, teams } = uGroupOf(code);
  const fix = [[teams[0], teams[1], '17:00'], [teams[2], teams[3], '20:00']];

  return (
    <div style={{ width:w, height:h, position:'relative', overflow:'hidden', background:UP_DARK, fontFamily:UP_UI }}>
      <div style={{ position:'absolute', inset:0,
                    background:`radial-gradient(ellipse 100% 60% at 50% 0%, rgba(231,195,107,.08) 0%, transparent 60%)` }} />
      <ULights tint={`${UP_GOLD}18`} />
      <UGrain id={`menu-${code}`} opacity={0.5} />
      <UVig opacity={0.55} />

      <div style={{ position:'absolute', inset:0, padding:`${32*s}px`, display:'flex', flexDirection:'column', color:'#fff' }}>
        <UKicker s={s}>Matchday Menu</UKicker>
        <div style={{ fontFamily:UP_ANTON, fontSize:84*s, lineHeight:.84,
                      textTransform:'uppercase', letterSpacing:'-1px', marginTop:10*s }}>
          Group {group}
        </div>
        <div style={{ fontFamily:UP_MONO, fontSize:10*s, color:'rgba(255,255,255,.34)',
                      letterSpacing:'2px', marginTop:8*s }}>ALL KICKOFFS · LOCAL TIME</div>

        <div style={{ display:'flex', flexDirection:'column', gap:12*s, marginTop:28*s }}>
          {fix.map(([a, b, t], i) => (
            <div key={i} style={{ background:'rgba(255,255,255,.07)', backdropFilter:'blur(8px)',
                                  border:'1px solid rgba(255,255,255,.09)',
                                  borderRadius:10*s, padding:`${16*s}px ${18*s}px` }}>
              <div style={{ fontFamily:UP_MONO, fontSize:9*s, color:UP_GOLD,
                            letterSpacing:'2px', marginBottom:10*s }}>MATCH {i+1} · {uDATES[i]}</div>
              <div style={{ display:'flex', alignItems:'center', gap:12*s }}>
                <UFlag code={a} w={40*s} radius={4} shadow={false} />
                <span style={{ fontFamily:UP_ANTON, fontSize:20*s, textTransform:'uppercase', flex:1,
                               whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{UC[a].name}</span>
                <span style={{ fontFamily:UP_MONO, fontSize:12*s, color:UP_GOLD, flexShrink:0 }}>{t}</span>
                <span style={{ fontFamily:UP_ANTON, fontSize:20*s, textTransform:'uppercase', flex:1,
                               textAlign:'right', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{UC[b].name}</span>
                <UFlag code={b} w={40*s} radius={4} shadow={false} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:'auto' }}><UDisc s={s} /></div>
      </div>
    </div>
  );
}

Object.assign(window, {
  WCPosterUpgrade: { URoadCard, UPredCard, UPlayerCard, UChaosCard, UBootCard, UUpsetCard, UMenuCard, upShade }
});
