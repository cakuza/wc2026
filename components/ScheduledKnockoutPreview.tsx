import React from "react";
import Link from "next/link";
import { type Match } from "@/lib/matches";
import { type ResolvedParticipantLookup, getResolvedHomeTeam, getResolvedAwayTeam, getResolvedHomeCode, getResolvedAwayCode, isKnockoutMatch } from "@/lib/participant-resolution";
import { countryName } from "@/lib/i18n";
import { Flag } from "@/components/Flag";
import type { KnockoutPreviewData } from "@/lib/scheduledKnockoutPreview";

const VENUE_CITIES: Record<string, string> = {
  "Estadio Azteca": "Mexico City",
  "Estadio Akron": "Guadalajara",
  "Estadio BBVA": "Monterrey",
  "BMO Field": "Toronto",
  "BC Place": "Vancouver",
  "Mercedes-Benz Stadium": "Atlanta",
  "Gillette Stadium": "Boston",
  "AT&T Stadium": "Dallas",
  "NRG Stadium": "Houston",
  "GEHA Field at Arrowhead Stadium": "Kansas City",
  "SoFi Stadium": "Los Angeles",
  "Hard Rock Stadium": "Miami",
  "MetLife Stadium": "New York / New Jersey",
  "Lincoln Financial Field": "Philadelphia",
  "Levi's Stadium": "San Francisco Bay Area",
  "Lumen Field": "Seattle",
};

interface Props {
  match: Match;
  resolvedParticipants?: ResolvedParticipantLookup;
  previewData: KnockoutPreviewData;
}

export function ScheduledKnockoutPreview({ match, resolvedParticipants, previewData }: Props) {
  if (!isKnockoutMatch(match)) {
    return null;
  }

  const {
    homeRecentForm,
    awayRecentForm,
    homeJourney,
    awayJourney,
    homeTopScorers,
    awayTopScorers,
    stats,
    winnerDestination,
    loserDestination,
  } = previewData;

  const homeKey = getResolvedHomeTeam(match, resolvedParticipants);
  const awayKey = getResolvedAwayTeam(match, resolvedParticipants);
  
  const homeCode = homeKey ? (getResolvedHomeCode(match, resolvedParticipants) ?? match.homeCode) : "";
  const awayCode = awayKey ? (getResolvedAwayCode(match, resolvedParticipants) ?? match.awayCode) : "";
  
  const homeName = homeKey ? countryName(homeKey, "en") : "TBD";
  const awayName = awayKey ? countryName(awayKey, "en") : "TBD";
  
  const isResolved = Boolean(homeKey && awayKey);
  const hasBracketDestination = Boolean(winnerDestination || loserDestination);

  return (
    <>
      
      {hasBracketDestination && <div className="mb-4 bg-canvas/40 p-4 rounded-lg border border-line">
        <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-faint mb-2">Bracket Destination</h4>
        {winnerDestination && (
           <p className="text-sm text-ink">
             <span className="text-accent font-bold">Winner</span> advances to: <Link href={winnerDestination.href} className="underline decoration-white/20 hover:text-ink transition">{winnerDestination.displayLabel}</Link>
           </p>
        )}
        {loserDestination && (
           <p className="text-sm text-ink mt-1">
             <span className="text-red-400 font-bold">Loser</span> drops to: <Link href={loserDestination.href} className="underline decoration-white/20 hover:text-ink transition">{loserDestination.displayLabel}</Link>
           </p>
        )}
      </div>}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Home Team */}
        <div className="rounded-lg bg-canvas/60 p-4 text-center border border-line">
          <Flag code={homeCode} name={homeName} width={60} height={42} className="mx-auto rounded-sm shadow-md" />
          <p className="mt-3 font-heading text-sm font-extrabold uppercase tracking-wide text-ink">
            {homeName}
          </p>
          <div className="mt-4 text-left border-t border-line pt-3">
            <h4 className="text-[10px] uppercase text-faint mb-2">Recent Form</h4>
            {homeRecentForm && homeRecentForm.length > 0 ? (
              <div className="flex gap-1">
                {homeRecentForm.map((result, idx) => (
                  <span key={idx} className={`w-4 h-4 rounded-sm flex items-center justify-center font-bold text-[9px] ${result === 'W' ? 'bg-green-600 text-white' : result === 'L' ? 'bg-red-600 text-white' : 'bg-gray-500 text-white'}`}>
                    {result}
                  </span>
                ))}
              </div>
            ) : <p className="mt-1 text-[10px] text-faint">Unavailable</p>}
          </div>

          <div className="mt-4 text-left border-t border-line pt-3">
            <h4 className="text-[10px] uppercase text-faint mb-2">Tournament Journey</h4>
            {homeJourney && homeJourney.length > 0 ? (
              <div className="flex flex-col gap-2">
                {homeJourney.map((j, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] bg-surface-raised rounded px-2 py-1.5">
                    <div className="flex flex-col text-left flex-1 min-w-0 pr-2">
                      <span className="font-bold text-ink whitespace-nowrap overflow-hidden text-ellipsis">{j.stage} vs {countryName(j.opponentName, "en")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {j.scoreLabel ? (
                        <span className="font-mono text-ink">{j.scoreLabel}</span>
                      ) : (
                        <span className="font-mono text-faint text-[9px]">TBD</span>
                      )}
                      <span className={`w-4 h-4 rounded-sm flex items-center justify-center font-bold text-[9px] ${j.result === 'W' ? 'bg-green-600 text-white' : j.result === 'L' ? 'bg-red-600 text-white' : j.result === 'UPCOMING' ? 'bg-surface-subtle text-faint' : 'bg-gray-500 text-white'}`}>
                        {j.result === 'UPCOMING' ? '-' : j.result}
                      </span>
                      {j.matchHref && (
                        <Link href={j.matchHref} className="ml-1 text-accent opacity-50 hover:opacity-100">→</Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="mt-1 text-[10px] text-faint">Unavailable</p>}
          </div>
          <div className="mt-3 text-left border-t border-line pt-2">
            <h4 className="text-[10px] uppercase text-faint mb-1">Top Scorers</h4>
            {homeTopScorers.length > 0 ? homeTopScorers.map(p => (
              <p key={p.playerName} className="text-[11px] text-ink">{p.playerName} ({p.goals}G)</p>
            )) : <p className="text-[11px] text-faint">Unavailable</p>}
          </div>
        </div>

        {/* Away Team */}
        <div className="rounded-lg bg-canvas/60 p-4 text-center border border-line">
          <Flag code={awayCode} name={awayName} width={60} height={42} className="mx-auto rounded-sm shadow-md" />
          <p className="mt-3 font-heading text-sm font-extrabold uppercase tracking-wide text-ink">
            {awayName}
          </p>
          <div className="mt-4 text-left border-t border-line pt-3">
            <h4 className="text-[10px] uppercase text-faint mb-2">Recent Form</h4>
            {awayRecentForm && awayRecentForm.length > 0 ? (
              <div className="flex gap-1">
                {awayRecentForm.map((result, idx) => (
                  <span key={idx} className={`w-4 h-4 rounded-sm flex items-center justify-center font-bold text-[9px] ${result === 'W' ? 'bg-green-600 text-white' : result === 'L' ? 'bg-red-600 text-white' : 'bg-gray-500 text-white'}`}>
                    {result}
                  </span>
                ))}
              </div>
            ) : <p className="mt-1 text-[10px] text-faint">Unavailable</p>}
          </div>

          <div className="mt-4 text-left border-t border-line pt-3">
            <h4 className="text-[10px] uppercase text-faint mb-2">Tournament Journey</h4>
            {awayJourney && awayJourney.length > 0 ? (
              <div className="flex flex-col gap-2">
                {awayJourney.map((j, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] bg-surface-raised rounded px-2 py-1.5">
                    <div className="flex flex-col text-left flex-1 min-w-0 pr-2">
                      <span className="font-bold text-ink whitespace-nowrap overflow-hidden text-ellipsis">{j.stage} vs {countryName(j.opponentName, "en")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {j.scoreLabel ? (
                        <span className="font-mono text-ink">{j.scoreLabel}</span>
                      ) : (
                        <span className="font-mono text-faint text-[9px]">TBD</span>
                      )}
                      <span className={`w-4 h-4 rounded-sm flex items-center justify-center font-bold text-[9px] ${j.result === 'W' ? 'bg-green-600 text-white' : j.result === 'L' ? 'bg-red-600 text-white' : j.result === 'UPCOMING' ? 'bg-surface-subtle text-faint' : 'bg-gray-500 text-white'}`}>
                        {j.result === 'UPCOMING' ? '-' : j.result}
                      </span>
                      {j.matchHref && (
                        <Link href={j.matchHref} className="ml-1 text-accent opacity-50 hover:opacity-100">→</Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="mt-1 text-[10px] text-faint">Unavailable</p>}
          </div>
          <div className="mt-3 text-left border-t border-line pt-2">
            <h4 className="text-[10px] uppercase text-faint mb-1">Top Scorers</h4>
            {awayTopScorers.length > 0 ? awayTopScorers.map(p => (
              <p key={p.playerName} className="text-[11px] text-ink">{p.playerName} ({p.goals}G)</p>
            )) : <p className="text-[11px] text-faint">Unavailable</p>}
          </div>
        </div>
      </div>

      {/* Stats Comparison */}
      {isResolved && stats.length > 0 && (
        <div className="mt-6 border-t border-line pt-4">
          <h4 className="font-heading text-[11px] font-extrabold uppercase tracking-widest text-faint mb-3 text-center">Tournament Stats Comparison</h4>
          <div className="flex flex-col gap-2">
            {stats.map((s, idx) => {
              const isEquivalentComplete = s.home.coverageStatus === "COMPLETE" && s.away.coverageStatus === "COMPLETE";
              const homeVal = s.home.value ?? 0;
              const awayVal = s.away.value ?? 0;
              // Assuming higher is better. If it's goals conceded, lower is better. We can check the label.
              const lowerIsBetter = s.label === "Goals Conceded";
              const homeWinner = lowerIsBetter ? homeVal < awayVal : homeVal > awayVal;
              const awayWinner = lowerIsBetter ? awayVal < homeVal : awayVal > homeVal;

              const renderItem = (item: typeof s.home, isWinner: boolean) => {
                if (item.coverageStatus === "NONE" || item.value === null) {
                  return <span className="text-faint" title="Unavailable">—</span>;
                }
                if (item.coverageStatus === "PARTIAL" || item.coverageStatus === "COMPLETE") {
                  return (
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-ink font-bold">{item.value}</span>
                      <span className="text-[8px] text-faint uppercase whitespace-nowrap mt-0.5">
                        {item.matchesCovered} of {item.completedMatches} matches covered
                      </span>
                    </div>
                  );
                }
                
                // COMPLETE
                let colorClass = "text-ink font-bold";
                if (isEquivalentComplete) {
                  if (isWinner) colorClass = "text-green-400 font-bold";
                  else if (homeVal !== awayVal) colorClass = "text-muted";
                }
                return <span className={colorClass}>{item.value}</span>;
              };

              return (
                <div key={idx} className="flex items-center justify-between text-sm rounded bg-surface-raised px-3 py-2">
                  <div className="w-20 flex justify-center text-center">{renderItem(s.home, homeWinner)}</div>
                  <span className="text-muted text-[11px] uppercase tracking-wider text-center flex-1">{s.label}</span>
                  <div className="w-20 flex justify-center text-center">{renderItem(s.away, awayWinner)}</div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 text-center">
             <Link href={`/stats/compare?team1=${homeKey}&team2=${awayKey}`} className="text-[11px] font-bold uppercase tracking-widest text-faint hover:text-ink transition">
               View Full Comparison →
             </Link>
          </div>
        </div>
      )}
      
      {!isResolved && (
        <div className="mt-4 text-center text-sm text-faint">
          Matchup not yet fully determined.
        </div>
      )}
    </>
  );
}
