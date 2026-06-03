import type { Standing, Team } from "@/lib/types";
import { goalDifference, sortStandings } from "@/lib/utils";

export function StandingsTable({ rows, teams, highlightTeamId }: { rows: Standing[]; teams: Team[]; highlightTeamId?: string }) {
  const sorted = sortStandings(rows);

  return (
    <div className="overflow-hidden rounded-lg border border-[rgba(14,12,10,.10)] bg-white">
      <table className="w-full min-w-[620px] border-collapse text-sm">
        <thead className="bg-[#F6F4F1] text-xs uppercase tracking-[0.14em] text-[#0E0C0A]/55">
          <tr>
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
          {sorted.map((row) => {
            const team = teams.find((item) => item.id === row.teamId);
            return (
              <tr key={row.teamId} className={row.teamId === highlightTeamId ? "bg-[#E7C36B]/12 text-[#0E0C0A]" : "text-[#0E0C0A]/82"}>
                <td className="px-3 py-3 font-bold text-[#0E0C0A]">
                  <span className="mr-2 text-[#B48A00]">{team?.fifaCode}</span>
                  {team?.name || row.teamId}
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
