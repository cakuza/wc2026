// wc-chips.jsx — Stadium Scoreboard Stat Chips for WC26 Hub
// Self-contained, no dependencies.
// Exports: window.WCChips = { ScoreboardChip, ScoreboardChipRow, ChipDemo }

const WCC_GOLD  = '#E7C36B';
const WCC_DARK  = '#0E0C0A';
const WCC_MONO  = '"Space Mono", monospace';
const WCC_ANTON = 'var(--font-anton, Anton, sans-serif)';

function ScoreboardChip({ label, value, accent = WCC_GOLD, style = {} }) {
  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      background: 'rgba(14,12,10,.94)',
      border: '1px solid rgba(231,195,107,.15)',
      borderTop: `2px solid ${accent}55`,
      borderRadius: 5,
      padding: '9px 16px 11px',
      minWidth: 84,
      boxShadow: '0 2px 14px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.03)',
      ...style,
    }}>
      <span style={{
        fontFamily: WCC_MONO,
        fontSize: 8,
        letterSpacing: '2.5px',
        color: `${accent}99`,
        textTransform: 'uppercase',
        lineHeight: 1,
        marginBottom: 5,
        whiteSpace: 'nowrap',
      }}>{label}</span>
      <span style={{
        fontFamily: WCC_ANTON,
        fontSize: 20,
        color: accent,
        lineHeight: 1,
        letterSpacing: '-.3px',
        whiteSpace: 'nowrap',
      }}>{value}</span>
    </div>
  );
}

function ScoreboardChipRow({ chips = [], gap = 8, style = {} }) {
  return (
    <div style={{ display: 'flex', gap, flexWrap: 'wrap', alignItems: 'stretch', ...style }}>
      {chips.map(({ label, value, accent }) => (
        <ScoreboardChip key={label} label={label} value={value} accent={accent} />
      ))}
    </div>
  );
}

// Showcase artboard for design review
function ChipDemo({ width = 860 }) {
  return (
    <div style={{ width, background: WCC_DARK, padding: '38px 44px 42px', fontFamily: WCC_MONO }}>
      <div style={{ fontSize: 9, letterSpacing: '3px', color: 'rgba(231,195,107,.35)', textTransform: 'uppercase', marginBottom: 26 }}>
        wc-chips.jsx · Stadium Scoreboard Chips · Component Showcase
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 8, letterSpacing: '2px', color: 'rgba(255,255,255,.22)', marginBottom: 12 }}>GOLD · DEFAULT</div>
        <ScoreboardChipRow chips={[
          { label: 'Teams',   value: '48 TEAMS'   },
          { label: 'Matches', value: '104 MATCHES' },
          { label: 'Groups',  value: '12 GROUPS'  },
          { label: 'Your time', value: 'LOCAL TIME' },
          { label: 'Cost',    value: 'FREE'        },
        ]} />
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 8, letterSpacing: '2px', color: 'rgba(255,255,255,.22)', marginBottom: 12 }}>WHITE · LIVE / ALERT STATE</div>
        <ScoreboardChipRow chips={[
          { label: 'Live now',    value: '3 MATCHES', accent: '#fff' },
          { label: 'Next kick-off', value: '21:00',  accent: '#fff' },
          { label: 'Goals today', value: '6',        accent: '#fff' },
        ]} />
      </div>

      <div style={{ marginTop: 24, fontSize: 9, color: 'rgba(255,255,255,.18)', letterSpacing: '1px', lineHeight: 1.7 }}>
        {'<ScoreboardChip label="Teams" value="48 TEAMS" />'}<br />
        {'<ScoreboardChipRow chips={[{ label, value, accent? }]} />'}
      </div>
    </div>
  );
}

Object.assign(window, { WCChips: { ScoreboardChip, ScoreboardChipRow, ChipDemo } });
