// wc-fx.jsx — bold poster texture primitives. Exports window.FX.
// Grain, halftone, vignette, strong floodlights, varied streamers, watermark, focal flag.
const { Flag: FXFlag } = window;

// grayscale film grain as an inline SVG data-URI (renders in real browsers)
const GRAIN_URI = "data:image/svg+xml," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>"
);
function Grain({ opacity = 0.14, blend = 'overlay', style = {} }) {
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `url("${GRAIN_URI}")`, backgroundSize: '180px 180px', opacity, mixBlendMode: blend, ...style }} />;
}

// halftone dot field, fading in one direction
function Halftone({ color = 'rgba(0,0,0,.22)', size = 8, fade = 'to bottom', style = {} }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', WebkitMaskImage: `linear-gradient(${fade}, #000, transparent)`, maskImage: `linear-gradient(${fade}, #000, transparent)`, backgroundImage: `radial-gradient(${color} 30%, transparent 31%)`, backgroundSize: `${size}px ${size}px`, ...style }} />
  );
}

// dark vignette pulling focus to center
function Vignette({ strength = 0.55, x = '50%', y = '42%', style = {} }) {
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(125% 95% at ${x} ${y}, transparent 38%, rgba(8,6,4,${strength}) 100%)`, ...style }} />;
}

// strong stadium floodlights — bright beams + corner glows
function Floods({ tint = 'rgba(255,248,222,.5)', style = {} }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}>
      <div style={{ position: 'absolute', top: '-34%', left: '6%', width: '46%', height: '150%', transform: 'rotate(20deg)', background: `linear-gradient(180deg, ${tint}, transparent 56%)`, filter: 'blur(20px)', opacity: .9 }} />
      <div style={{ position: 'absolute', top: '-34%', right: '6%', width: '46%', height: '150%', transform: 'rotate(-20deg)', background: `linear-gradient(180deg, ${tint}, transparent 56%)`, filter: 'blur(20px)', opacity: .9 }} />
      <div style={{ position: 'absolute', top: '-12%', left: '50%', width: '70%', height: '50%', transform: 'translateX(-50%)', background: `radial-gradient(60% 100% at 50% 0%, ${tint}, transparent 70%)`, filter: 'blur(8px)' }} />
    </div>
  );
}

// varied confetti / streamers — mix of ribbons, dots, chevrons (not uniform squares)
function Streamers({ colors = ['#FF2D6B', '#FFC524', '#06D6A0', '#1FA9F6', '#fff'], n = 40, seed = 7, style = {} }) {
  const rnd = (i) => { const x = Math.sin(seed * 71 + i * 29.13) * 10000; return x - Math.floor(x); };
  const items = [];
  for (let i = 0; i < n; i++) {
    const left = rnd(i) * 100, top = rnd(i + 90) * 100, rot = rnd(i + 180) * 360;
    const c = colors[Math.floor(rnd(i + 270) * colors.length)], o = 0.55 + rnd(i + 360) * 0.45;
    const kind = rnd(i + 450); const sz = 5 + rnd(i + 540) * 8;
    let el;
    if (kind < 0.42) { // ribbon (curved streamer)
      const len = 14 + rnd(i + 630) * 26, th = 2.5 + rnd(i + 720) * 2.5;
      el = <span style={{ display: 'block', width: len, height: th, background: c, borderRadius: th, transform: `rotate(${rot}deg)` }} />;
    } else if (kind < 0.72) { // dot
      el = <span style={{ display: 'block', width: sz * 0.8, height: sz * 0.8, background: c, borderRadius: '50%' }} />;
    } else if (kind < 0.88) { // rounded confetti rect
      el = <span style={{ display: 'block', width: sz, height: sz * 1.5, background: c, borderRadius: 2, transform: `rotate(${rot}deg)` }} />;
    } else { // chevron tick
      el = <span style={{ display: 'block', width: sz, height: sz, borderLeft: `2.5px solid ${c}`, borderBottom: `2.5px solid ${c}`, transform: `rotate(${rot}deg)` }} />;
    }
    items.push(<span key={i} style={{ position: 'absolute', left: left + '%', top: top + '%', opacity: o }}>{el}</span>);
  }
  return <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}>{items}</div>;
}

// subtle pitch arc (single dramatic curve, not a faint full diagram)
function PitchArc({ color = 'rgba(255,255,255,.16)', stroke = 2, style = {} }) {
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }}>
      <g fill="none" stroke={color} strokeWidth={stroke}>
        <circle cx="200" cy="210" r="120" />
        <line x1="-20" y1="210" x2="420" y2="210" />
        <circle cx="200" cy="210" r="4" fill={color} stroke="none" />
      </g>
    </svg>
  );
}

// watermark — wc26.app with ball glyph; Pro tier hides it
function Watermark({ light = true, s = 1, hidden = false, style = {} }) {
  if (hidden) return null;
  const col = light ? 'rgba(255,255,255,.62)' : 'rgba(14,12,10,.5)';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 * s, fontFamily: '"Space Mono", monospace', fontSize: 11 * s, fontWeight: 700, letterSpacing: '.5px', color: col, ...style }}>
      <svg width={11 * s} height={11 * s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke={col} strokeWidth="2" /><path d="M12 6l4 3-1.5 4.5h-5L8 9z" fill={col} /></svg>
      wc26.app
    </div>
  );
}

function Disc2({ light = true, s = 1, style = {} }) {
  return <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 8.5 * s, letterSpacing: '.3px', color: light ? 'rgba(255,255,255,.5)' : 'rgba(14,12,10,.42)', ...style }}>FAN-MADE · NOT AFFILIATED WITH FIFA OR ANY OFFICIAL ORGANIZER</div>;
}

window.FX = { Grain, Halftone, Vignette, Floods, Streamers, PitchArc, Watermark, Disc2, GRAIN_URI };
