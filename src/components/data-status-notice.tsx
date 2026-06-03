import { AlertCircle, Clock, Database, FileSearch, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const notices = {
  scheduleReady: {
    icon: Clock,
    title: "Kickoffs in your local time",
    copy: "Official WC2026 group stage fixtures convert to your timezone automatically.",
    action: "Create local-time cards"
  },
  schedulePending: {
    icon: Clock,
    title: "Times coming soon",
    copy: "Matchups are ready to save now. Kick-off times and venues fill in closer to the tournament.",
    action: "Save the road today"
  },
  squadPending: {
    icon: Users,
    title: "Player cards ready",
    copy: "Pick any player from the squad list, or type your own name. Build a Player Watch card in seconds.",
    action: "Create a Player Watch card"
  },
  preTournament: {
    icon: ShieldCheck,
    title: "Pre-tournament table",
    copy: "Standings are intentionally zeroed until matches are played or manually updated.",
    action: "No fake results shown"
  },
  sampleData: {
    icon: Database,
    title: "Structured launch mode",
    copy: "This surface uses structured launch data and avoids pretending unconfirmed details are final.",
    action: "Source labels keep data honest"
  },
  manualMode: {
    icon: FileSearch,
    title: "Manual update mode",
    copy: "Reviewed updates can be added from trusted sources without needing a paid API first.",
    action: "Keep source labels and URLs"
  },
  newsWatchPending: {
    icon: AlertCircle,
    title: "Opponent prompt",
    copy: "Use the matchup now with original fan copy. Add your own takes before you share.",
    action: "Create prediction or opponent-watch card"
  }
};

export type DataStatusNoticeVariant = keyof typeof notices;

export function DataStatusNotice({
  variant,
  className,
  compact = false
}: {
  variant: DataStatusNoticeVariant;
  className?: string;
  compact?: boolean;
}) {
  const item = notices[variant];
  const Icon = item.icon;
  return (
    <div className={cn("rounded-lg border border-[#E7C36B]/30 bg-[#E7C36B]/10 p-4", compact && "p-3", className)}>
      <div className="flex gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#E7C36B]/18 text-[#8A6400]">
          <Icon size={17} />
        </span>
        <div>
          <p className="text-sm font-black text-[#0E0C0A]">{item.title}</p>
          <p className={cn("mt-1 text-sm leading-6 text-[#0E0C0A]/62", compact && "leading-5")}>{item.copy}</p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#8A6400]">{item.action}</p>
        </div>
      </div>
    </div>
  );
}
