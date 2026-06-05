import Link from "next/link";
import { TeamFlag } from "@/components/team-flag";
import type { Standing, Team } from "@/lib/types";
import { goalDifference, sortStandings } from "@/lib/utils";

export function StandingsTable({
  rows,
  teams,
  highlightTeamId,
  showFlags = false,
  qualifyCount
}: {
  rows: Standing[];
  teams: Team[];
  highlightTeamId?: string;
  // Group-page extras (opt-in so the shared table elsewhere is unchanged):
  showFlags?: boolean; // render flag + linked team name and a leading position column
  qualifyCount?: number; // shade the top N rows as the automatic-qualification zone
}) {
  const sorted = sortStandings(rows);

  return (
    <div className="overflow-hidden rounded-lg border border-[rgba(14,12,10,.10)] bg-white">
      <table className="w-full min-w-[620px] border-collapse text-sm">
        <thead className="bg-[#F6F4F1] text-xs uppercase tracking-[0.14em] text-[#0E0C0A]/55">
          <tr>
            {showFlags ? <th className="px-3 py-3 text-center">#</th> : null}
            <th className="px-3 py-3 text-left">Team</th>
            <th className="px-2 py-3 text-center">P</th>
            <th className="px-2 py-3 text-center">W</th>
            <th className="px-2 py-3 text-center">D</th>
            <th className="px-2 py-3 text-center">L</th>
            <th className="px-2 py-3 text-center">GF</th>
            <th className="px-2 py-3 text-center">GA</th>
            <th className="px-2 py-3 text-center">GD</th>
            <th className="px-3 py-3 text-center text-gold">PTS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(14,12,10,.08)]">
          {sorted.map((row, index) => {
            const team = teams.find((item) => item.id === row.teamId);
            const inQualifyZone = typeof qualifyCount === "number" && index < qualifyCount;
            const rowClass = row.teamId === highlightTeamId
              ? "bg-[#E7C36B]/12 text-[#0E0C0A]"
              : inQualifyZone
                ? "bg-[#1FA96015] text-[#0E0C0A]/82"
                : "text-[#0E0C0A]/82";
            return (
              <tr key={row.teamId} className={rowClass}>
                {showFlags ? (
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-grid h-6 w-6 place-items-center rounded-full text-xs font-black ${inQualifyZone ? "bg-[#1FA960] text-white" : "bg-[#0E0C0A]/8 text-[#0E0C0A]/60"}`}>
                      {index + 1}
                    </span>
                  </td>
                ) : null}
                <td className="px-3 py-3 font-bold text-[#0E0C0A]">
                  {showFlags && team ? (
                    <Link href={`/teams/${team.slug}-world-cup-schedule`} className="flex items-center gap-2.5 hover:text-[#B48A00]">
                      <TeamFlag team={team} width={28} />
                      <span>{team.name}</span>
                      <span className="text-xs font-bold text-[#0E0C0A]/40">{team.fifaCode}</span>
                    </Link>
                  ) : (
                    <>
                      <span className="mr-2 text-[#B48A00]">{team?.fifaCode}</span>
                      {team?.name || row.teamId}
                    </>
                  )}
                </td>
                <td className="px-2 py-3 text-center">{row.played}</td>
                <td className="px-2 py-3 text-center">{row.won}</td>
                <td className="px-2 py-3 text-center">{row.drawn}</td>
                <td className="px-2 py-3 text-center">{row.lost}</td>
                <td className="px-2 py-3 text-center">{row.goalsFor}</td>
                <td className="px-2 py-3 text-center">{row.goalsAgainst}</td>
                <td className="px-2 py-3 text-center">{goalDifference(row)}</td>
                <td className="px-3 py-3 text-center font-black text-[#B48A00]">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
