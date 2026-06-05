import Link from "next/link";
import { TeamFlag } from "@/components/team-flag";
import type { Group, Team } from "@/lib/types";

// Plain-English, pre-tournament qualification scenarios. Identical rules for every team —
// only the group and team name change — so this is safe to auto-generate for all 48 teams.
function ScenarioList({ group }: { group: Group }) {
  return (
    <ul className="grid gap-2.5">
      <li className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#1FA960] text-xs font-black text-white">1-2</span>
        <span className="text-sm font-bold leading-6 text-[#0E0C0A]/80">
          <span className="font-black text-[#0E0C0A]">Finish 1st or 2nd in Group {group}</span> → automatic qualification for the Round of 32.
        </span>
      </li>
      <li className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E7C36B] text-xs font-black text-[#0E0C0A]">3</span>
        <span className="text-sm font-bold leading-6 text-[#0E0C0A]/80">
          <span className="font-black text-[#0E0C0A]">Finish 3rd in Group {group}</span> → may still qualify as one of the 8 best third-place teams.
        </span>
      </li>
      <li className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#0E0C0A]/12 text-xs font-black text-[#0E0C0A]/60">4</span>
        <span className="text-sm font-bold leading-6 text-[#0E0C0A]/80">
          <span className="font-black text-[#0E0C0A]">Finish 4th</span> → eliminated.
        </span>
      </li>
    </ul>
  );
}

// Single-team section for the team page (placed between fixtures and the group table).
export function QualificationScenario({ team }: { team: Team }) {
  return (
    <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Qualification scenarios</p>
      <h2 className="mt-1 mb-4 text-2xl font-black text-[#0E0C0A]">What {team.name} needs to qualify</h2>
      <ScenarioList group={team.group} />
    </section>
  );
}

// Group-page section showing the scenarios for all four teams in the group.
export function GroupQualificationScenarios({ teams }: { teams: Team[] }) {
  return (
    <section className="mb-8">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">How teams advance</p>
      <h2 className="mt-1 mb-4 text-2xl font-black text-[#0E0C0A]">What each team needs to qualify</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {teams.map((team) => (
          <div key={team.id} className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 shadow-[0_8px_18px_rgba(14,12,10,.05)]">
            <div className="mb-3 flex items-center gap-2.5">
              <TeamFlag team={team} width={28} />
              <span className="font-black text-[#0E0C0A]">{team.name}</span>
            </div>
            <ScenarioList group={team.group} />
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm font-bold text-[#0E0C0A]/70">
        <Link href="/world-cup-2026-format" className="text-[#B48A00] underline-offset-2 hover:underline">Tournament format</Link>
        {" · "}
        <Link href="/world-cup-2026-tiebreakers" className="text-[#B48A00] underline-offset-2 hover:underline">Tiebreaker rules</Link>
      </p>
    </section>
  );
}
