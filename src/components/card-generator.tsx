"use client";

import { Copy, Download, Share2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PosterPreviewCard, posterRatios, type PosterTheme, type PosterVariant } from "@/components/poster-engine";
import type { MatchWithTeams, PlayerWithStats, Standing, Team } from "@/lib/types";
import { GROUPS } from "@/lib/types";
import { QUICK_TIMEZONES, formatKickoff, getBrowserTimezone } from "@/lib/timezones";
import { type SquadEntry, findSquadPlayer, getStarPlayer, getTeamSquad } from "@/lib/squads";

type CardType =
  | "player-watch"
  | "jersey-star"
  | "team-schedule"
  | "today"
  | "top-scorers"
  | "match-result"
  | "group-standings"
  | "match-preview"
  | "legacy"
  | "fan-mode";
type CardSize = "story" | "square" | "twitter";
type CardTemplate = PosterTheme;
type CaptionSet = Record<"caption" | "hype" | "banter" | "x" | "telegram" | "whatsapp" | "hashtags" | "custom", string>;
const pendingTimeCopy = "Local time ready";

const cardSizes = posterRatios;

const templatePresets: Array<{
  label: string;
  useCase: string;
  bestFor: string;
  hook: string;
  cardType: CardType;
  template: CardTemplate;
  size: CardSize;
  headline: string;
  subtitle: string;
  playerName: string;
  countryName: string;
  shirtNumber: string;
  jerseyName: string;
  teamHook: string;
  matchTime: string;
  scorePrediction: string;
  footer: string;
}> = [
  {
    label: "Player Watch",
    useCase: "Star hype card",
    bestFor: "Instagram Story / fan pages",
    hook: "Huge-name player watch for Stories and fan pages.",
    cardType: "player-watch",
    template: "festival",
    size: "story",
    headline: "MBAPPE WATCH",
    subtitle: "Big-game energy. The name is enough.",
    playerName: "MBAPPE",
    countryName: "France",
    shirtNumber: "10",
    jerseyName: "MBAPPE",
    teamHook: "France player to watch",
    matchTime: pendingTimeCopy,
    scorePrediction: "Big game energy",
    footer: "Player watch / WC26 Hub"
  },
  {
    label: "Messi Watch",
    useCase: "Global star watch",
    bestFor: "Story / X",
    hook: "A player-name poster for Argentina fans anywhere.",
    cardType: "player-watch",
    template: "festival",
    size: "story",
    headline: "MESSI WATCH",
    subtitle: "Save this before kick-off.",
    playerName: "MESSI",
    countryName: "Argentina",
    shirtNumber: "10",
    jerseyName: "MESSI",
    teamHook: "Argentina player watch",
    matchTime: pendingTimeCopy,
    scorePrediction: "Legacy night?",
    footer: "Player watch / WC26 Hub"
  },
  {
    label: "Ronaldo Watch",
    useCase: "Legacy watch",
    bestFor: "WhatsApp / X",
    hook: "Portugal No.7 debate for the group chat.",
    cardType: "legacy",
    template: "festival",
    size: "square",
    headline: "PORTUGAL NO.7 WATCH",
    subtitle: "Legacy debate mode.",
    playerName: "RONALDO",
    countryName: "Portugal",
    shirtNumber: "7",
    jerseyName: "RONALDO",
    teamHook: "Portugal No.7 watch",
    matchTime: "Big-game watch",
    scorePrediction: "Last dance?",
    footer: "Legacy debate / WC26 Hub"
  },
  {
    label: "Back-of-Jersey Star",
    useCase: "Jersey-back poster",
    bestFor: "Story / WhatsApp",
    hook: "A safer jersey-back concept: number, name, nation colors, no crest.",
    cardType: "jersey-star",
    template: "festival",
    size: "story",
    headline: "ARDA GULER PLAYER TO WATCH",
    subtitle: "Save this before kick-off.",
    playerName: "ARDA GULER",
    countryName: "Turkey",
    shirtNumber: "8",
    jerseyName: "ARDA",
    teamHook: "Turkey fans, save this",
    matchTime: pendingTimeCopy,
    scorePrediction: "Player to watch",
    footer: "Fan-made jersey-back card / WC26 Hub"
  },
  {
    label: "Country Road",
    useCase: "Team save-the-date card",
    bestFor: "Instagram Story / fan pages",
    hook: "Your team's group-stage road in one share.",
    cardType: "team-schedule",
    template: "festival",
    size: "story",
    headline: "BRAZIL'S ROAD STARTS HERE",
    subtitle: "Fan-made schedule card. Save it before matchday.",
    playerName: "VINICIUS JR.",
    countryName: "Brazil",
    shirtNumber: "7",
    jerseyName: "VINI",
    teamHook: "Brazil fans, save this",
    matchTime: pendingTimeCopy,
    scorePrediction: "Group stage",
    footer: "Fan-made schedule / WC26 Hub"
  },
  {
    label: "Morocco Road",
    useCase: "Team schedule card",
    bestFor: "Story / WhatsApp",
    hook: "Morocco fans get the same save-this flow.",
    cardType: "team-schedule",
    template: "festival",
    size: "story",
    headline: "MOROCCO ROAD TO GLORY",
    subtitle: "Your team's road starts here.",
    playerName: "MOROCCO",
    countryName: "Morocco",
    shirtNumber: "26",
    jerseyName: "MAR",
    teamHook: "Morocco fans, save this",
    matchTime: pendingTimeCopy,
    scorePrediction: "Group stage",
    footer: "Fan-made schedule / WC26 Hub"
  },
  {
    label: "Matchday Menu",
    useCase: "Daily match card",
    bestFor: "Instagram Story / WhatsApp",
    hook: "Football all day. Save the menu with real local times.",
    cardType: "today",
    template: "festival",
    size: "story",
    headline: "MATCHDAY MENU",
    subtitle: "Clear your calendar. Save the matchups.",
    playerName: "MATCHDAY",
    countryName: "Fan zone",
    shirtNumber: "26",
    jerseyName: "LOCAL",
    teamHook: "Tonight's football menu",
    matchTime: pendingTimeCopy,
    scorePrediction: "Pick your game",
    footer: "Matchday menu / WC26 Hub"
  },
  {
    label: "USA Matchday",
    useCase: "Local-time menu",
    bestFor: "Story / group chat",
    hook: "Which match are we watching?",
    cardType: "today",
    template: "festival",
    size: "story",
    headline: "USA MATCHDAY MENU",
    subtitle: "Clear your calendar.",
    playerName: "USA",
    countryName: "United States",
    shirtNumber: "26",
    jerseyName: "USA",
    teamHook: "USA matchday menu",
    matchTime: pendingTimeCopy,
    scorePrediction: "Pick your match",
    footer: "Local-time menu / WC26 Hub"
  },
  {
    label: "Mexico Save This",
    useCase: "Team save card",
    bestFor: "WhatsApp / Story",
    hook: "Mexico fans, save this before kick-off.",
    cardType: "team-schedule",
    template: "festival",
    size: "story",
    headline: "MEXICO FANS, SAVE THIS",
    subtitle: "Your team's road starts here.",
    playerName: "MEXICO",
    countryName: "Mexico",
    shirtNumber: "26",
    jerseyName: "MEX",
    teamHook: "Mexico fans, save this",
    matchTime: pendingTimeCopy,
    scorePrediction: "Group stage",
    footer: "Fan-made schedule / WC26 Hub"
  },
  {
    label: "Argentina Road",
    useCase: "Group-stage road",
    bestFor: "Story / fan pages",
    hook: "Argentina's group-stage road in one card.",
    cardType: "team-schedule",
    template: "festival",
    size: "square",
    headline: "ARGENTINA GROUP-STAGE ROAD",
    subtitle: "Your team's road starts here.",
    playerName: "ARGENTINA",
    countryName: "Argentina",
    shirtNumber: "10",
    jerseyName: "ARG",
    teamHook: "Argentina fans, save this",
    matchTime: pendingTimeCopy,
    scorePrediction: "Group stage",
    footer: "Fan-made schedule / WC26 Hub"
  },
  {
    label: "Golden Boot Debate",
    useCase: "Prediction starter",
    bestFor: "X / WhatsApp / fan pages",
    hook: "No official stats needed. Make everyone pick a side.",
    cardType: "top-scorers",
    template: "festival",
    size: "square",
    headline: "GOLDEN BOOT DEBATE",
    subtitle: "Pick your No. 1 before the tournament gets loud.",
    playerName: "PICK YOUR NO. 1",
    countryName: "All teams",
    shirtNumber: "9",
    jerseyName: "GOALS",
    teamHook: "Who wins the Golden Boot?",
    matchTime: "Debate card",
    scorePrediction: "Top 5 watch",
    footer: "Prediction debate / WC26 Hub"
  },
  {
    label: "Prediction Battle",
    useCase: "Editable score card",
    bestFor: "WhatsApp / Instagram Story",
    hook: "Drop your score before kick-off. Receipts matter.",
    cardType: "match-result",
    template: "festival",
    size: "story",
    headline: "DROP YOUR SCORE PREDICTION",
    subtitle: "Who takes this one?",
    playerName: "PREDICTION",
    countryName: "Matchday",
    shirtNumber: "90",
    jerseyName: "PICK",
    teamHook: "Brazil vs Argentina",
    matchTime: pendingTimeCopy,
    scorePrediction: "2 - 1",
    footer: "Prediction card / WC26 Hub"
  },
  {
    label: "Group Chaos",
    useCase: "Group-stage argument",
    bestFor: "X image / WhatsApp",
    hook: "One group. No easy games.",
    cardType: "group-standings",
    template: "festival",
    size: "square",
    headline: "GROUP OF CHAOS",
    subtitle: "Who survives this group?",
    playerName: "CHAOS",
    countryName: "Group stage",
    shirtNumber: "4",
    jerseyName: "GROUP",
    teamHook: "One group. No easy games.",
    matchTime: "Fan debate mode",
    scorePrediction: "Pick your top two",
    footer: "Group debate / WC26 Hub"
  },
  {
    label: "Upset Watch",
    useCase: "Pre-match danger game",
    bestFor: "X image / fan pages",
    hook: "Danger game energy with simple fan-made copy.",
    cardType: "match-preview",
    template: "festival",
    size: "twitter",
    headline: "UPSET WATCH",
    subtitle: "This one could get weird.",
    playerName: "DANGER GAME",
    countryName: "Fan watch",
    shirtNumber: "11",
    jerseyName: "UPSET",
    teamHook: "USA vs England",
    matchTime: pendingTimeCopy,
    scorePrediction: "Danger game?",
    footer: "Fan-made preview / WC26 Hub"
  },
  {
    label: "Japan Upset Watch",
    useCase: "Opponent watch card",
    bestFor: "X / Story",
    hook: "Japan upset watch for global fans.",
    cardType: "match-preview",
    template: "festival",
    size: "twitter",
    headline: "JAPAN UPSET WATCH",
    subtitle: "This one could get weird.",
    playerName: "JAPAN",
    countryName: "Japan",
    shirtNumber: "11",
    jerseyName: "JPN",
    teamHook: "Japan upset watch",
    matchTime: pendingTimeCopy,
    scorePrediction: "Danger game?",
    footer: "Opponent watch / WC26 Hub"
  },
  {
    label: "Germany Pressure",
    useCase: "Pressure-night debate",
    bestFor: "X / WhatsApp",
    hook: "Pressure night card for Germany fans.",
    cardType: "legacy",
    template: "festival",
    size: "square",
    headline: "GERMANY PRESSURE NIGHT",
    subtitle: "Drop your prediction.",
    playerName: "GERMANY",
    countryName: "Germany",
    shirtNumber: "13",
    jerseyName: "GER",
    teamHook: "Germany pressure night",
    matchTime: pendingTimeCopy,
    scorePrediction: "Who steps up?",
    footer: "Fan debate / WC26 Hub"
  },
  {
    label: "Spain Golden Pick",
    useCase: "Golden Boot pick",
    bestFor: "X / fan pages",
    hook: "Spain Golden Boot pick? Start the debate.",
    cardType: "top-scorers",
    template: "festival",
    size: "square",
    headline: "SPAIN GOLDEN BOOT PICK",
    subtitle: "Pick your No. 1.",
    playerName: "SPAIN",
    countryName: "Spain",
    shirtNumber: "9",
    jerseyName: "GOALS",
    teamHook: "Spain Golden Boot pick",
    matchTime: "Debate card",
    scorePrediction: "Pick your No. 1",
    footer: "Golden Boot debate / WC26 Hub"
  },
  {
    label: "Last Dance",
    useCase: "Legacy debate card",
    bestFor: "X / fan pages",
    hook: "Legacy, pressure, one more tournament. Perfect debate bait.",
    cardType: "legacy",
    template: "festival",
    size: "square",
    headline: "LAST DANCE?",
    subtitle: "Legacy debate mode. Who owns the big moment?",
    playerName: "BELLINGHAM",
    countryName: "England",
    shirtNumber: "10",
    jerseyName: "JUDE",
    teamHook: "Bellingham tonight?",
    matchTime: "Big-game watch",
    scorePrediction: "Legacy moment?",
    footer: "Legacy debate / WC26 Hub"
  },
  {
    label: "Custom Fan Card",
    useCase: "Manual Fan Mode",
    bestFor: "Anything",
    hook: "Edit the text, player, team, number, score, time, and caption.",
    cardType: "fan-mode",
    template: "festival",
    size: "story",
    headline: "MY MATCHDAY PICK",
    subtitle: "Text-only fan card. Edit everything before you share.",
    playerName: "YOUR PLAYER",
    countryName: "Your team",
    shirtNumber: "10",
    jerseyName: "FAN",
    teamHook: "My team, my pick",
    matchTime: pendingTimeCopy,
    scorePrediction: "2 - 1",
    footer: "Custom fan card / WC26 Hub"
  }
];

const featuredTemplateLabels = new Set(["Country Road", "Player Watch", "Prediction Battle", "Group Chaos", "Golden Boot Debate", "Matchday Menu", "Custom Fan Card"]);

function mapTemplateParam(value: string): CardType {
  const normalized = value.toLowerCase();
  if (normalized === "prediction") return "match-result";
  if (normalized === "golden-boot") return "top-scorers";
  if (normalized === "opponent-watch") return "match-preview";
  if (normalized === "group-chaos") return "group-standings";
  if (normalized === "custom-player" || normalized === "custom-fan-card") return "fan-mode";
  const allowed: CardType[] = ["player-watch", "jersey-star", "team-schedule", "today", "top-scorers", "match-result", "group-standings", "match-preview", "legacy", "fan-mode"];
  return allowed.includes(normalized as CardType) ? (normalized as CardType) : "fan-mode";
}

function cardTypeToPosterVariant(value: CardType): PosterVariant {
  if (value === "match-result") return "prediction";
  if (value === "player-watch" || value === "jersey-star") return "player";
  if (value === "group-standings") return "chaos";
  if (value === "team-schedule") return "road";
  if (value === "today") return "menu";
  if (value === "top-scorers" || value === "legacy") return "boot";
  if (value === "match-preview") return "upset";
  return "custom";
}

function publicKickoffLabel(value?: string | null) {
  return value ? formatKickoff(value, "Europe/Istanbul") : "Local time unavailable";
}

function roadHeadline(teamName: string) {
  return `${teamName.toUpperCase()}'S ROAD STARTS HERE`;
}

function firstFixture(matches: MatchWithTeams[], team: Team) {
  return matches.find((match) => match.homeTeamId === team.id || match.awayTeamId === team.id);
}

type PersonalizedFields = {
  headline: string;
  playerName: string;
  jerseyName: string;
  countryName: string;
  teamHook: string;
  group?: string;
  matchId?: string;
  matchTime?: string;
};

// Re-skin a preset so every visible card reflects the selected team: their key
// player, their group, their first fixture, their road.
function personalizePreset(preset: (typeof templatePresets)[number], team: Team, matches: MatchWithTeams[]): PersonalizedFields {
  const out: PersonalizedFields = {
    headline: preset.headline,
    playerName: preset.playerName,
    jerseyName: preset.jerseyName,
    countryName: preset.countryName,
    teamHook: preset.teamHook
  };

  if (preset.cardType === "team-schedule") {
    out.headline = roadHeadline(team.name);
    out.countryName = team.name;
    out.teamHook = `${team.name} fans, save this`;
  } else if (preset.cardType === "player-watch" || preset.cardType === "jersey-star") {
    const player = team.featuredPlayer || team.name;
    out.playerName = player.toUpperCase();
    out.jerseyName = (team.featuredPlayer ? player.split(" ")[0] : team.fifaCode).toUpperCase();
    out.headline = `${player.toUpperCase()} WATCH`;
    out.countryName = team.name;
    out.teamHook = `${team.name} player to watch`;
  } else if (preset.cardType === "group-standings") {
    out.group = team.group;
  } else if (preset.cardType === "match-result") {
    const fixture = firstFixture(matches, team);
    if (fixture) {
      out.matchId = fixture.id;
      out.countryName = `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`;
      out.teamHook = `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`;
      out.jerseyName = fixture.homeTeam.fifaCode;
      out.matchTime = publicKickoffLabel(fixture.kickoffUtc);
    }
  }

  return out;
}

export function CardGenerator({
  matches,
  teams,
  standings,
  players
}: {
  matches: MatchWithTeams[];
  teams: Team[];
  standings: Standing[];
  players: PlayerWithStats[];
}) {
  const [cardType, setCardType] = useState<CardType>("player-watch");
  const [teamId, setTeamId] = useState("turkey");
  const [squadIndex, setSquadIndex] = useState(0);
  const [matchId, setMatchId] = useState(matches[0]?.id || "");
  const [group, setGroup] = useState("A");
  const [size, setSize] = useState<CardSize>("story");
  const [template, setTemplate] = useState<CardTemplate>("festival");
  const [showWatermark, setShowWatermark] = useState(true);
  const [headline, setHeadline] = useState("MBAPPE WATCH");
  const [subtitle, setSubtitle] = useState("Big-game energy. The name is enough.");
  const [footer, setFooter] = useState("Player watch / WC26 Hub");
  const [playerName, setPlayerName] = useState("MBAPPE");
  const [countryName, setCountryName] = useState("France");
  const [shirtNumber, setShirtNumber] = useState("10");
  const [jerseyName, setJerseyName] = useState("MBAPPE");
  const [teamHook, setTeamHook] = useState("France player to watch");
  const [matchTime, setMatchTime] = useState(pendingTimeCopy);
  const [scorePrediction, setScorePrediction] = useState("Big game energy");
  const [customCaption, setCustomCaption] = useState("Player watch mode. Save this before kick-off.");
  const [customHashtags, setCustomHashtags] = useState("#WorldCup2026 #FanCard #Football #FanMade");
  const [status, setStatus] = useState("");
  // Poster kickoff times render in this zone. SSR starts on a fixed zone to avoid a
  // hydration mismatch, then we switch to the viewer's own zone on mount so the
  // exported PNG shows their local kickoff — not a hardcoded GMT+3.
  const [timeZone, setTimeZone] = useState("Europe/Istanbul");
  // Web Share with files only exists on most mobile browsers; detect once on mount so the
  // Share button is hidden where it would not work (most desktops).
  const [canShareFiles, setCanShareFiles] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<HTMLElement>(null);

  const selectedTeam = teams.find((team) => team.id === teamId) || teams[0];
  const squad = useMemo(() => getTeamSquad(selectedTeam?.id || ""), [selectedTeam?.id]);
  const selectedMatch = matches.find((match) => match.id === matchId) || matches[0];

  const isPlayerCard = cardType === "player-watch" || cardType === "jersey-star";

  // Push a squad pick into the jersey/player fields. Pass the team explicitly because the
  // team-change handler runs before selectedTeam re-derives from the new teamId.
  function applySquadEntry(entry: SquadEntry, withHeadline: boolean, teamName?: string) {
    const upper = entry.name.toUpperCase();
    setPlayerName(upper);
    setJerseyName(entry.name.split(" ").slice(-1)[0].toUpperCase());
    setShirtNumber(entry.number != null ? String(entry.number) : "");
    if (teamName) setCountryName(teamName);
    setTeamHook(`${teamName || selectedTeam?.name || "Team"} player to watch`);
    if (withHeadline) setHeadline(`${upper} WATCH`);
  }
  const featuredPresets = Array.from(featuredTemplateLabels)
    .map((label) => templatePresets.find((preset) => preset.label === label))
    .filter(Boolean) as typeof templatePresets;
  const captions = useMemo(
    () => buildCaptions(cardType, selectedMatch, selectedTeam, playerName, customCaption, customHashtags),
    [cardType, selectedMatch, selectedTeam, playerName, customCaption, customHashtags]
  );

  const frameOptions = useMemo(
    () => ({
      size: cardSizes[size],
      template,
      showWatermark,
      headline,
      subtitle,
      footer,
      playerName,
      countryName,
      shirtNumber,
      jerseyName,
      teamHook,
      matchTime,
      scorePrediction
    }),
    [countryName, footer, headline, jerseyName, matchTime, playerName, scorePrediction, shirtNumber, showWatermark, size, subtitle, teamHook, template]
  );

  const card = useMemo(() => {
    const variant = cardTypeToPosterVariant(cardType);
    const teamMatches = matches.filter((match) => match.homeTeamId === selectedTeam.id || match.awayTeamId === selectedTeam.id);
    return (
      <PosterPreviewCard
        variant={variant}
        ratio={size}
        theme={template}
        pro={!showWatermark}
        team={selectedTeam}
        opponent={selectedMatch.awayTeam}
        match={selectedMatch}
        matches={cardType === "today" ? matches.slice(0, 4) : teamMatches}
        teams={teams}
        standings={standings}
        players={players}
        group={group}
        headline={headline}
        subtitle={subtitle}
        playerName={playerName}
        jerseyName={jerseyName}
        shirtNumber={shirtNumber}
        scorePrediction={scorePrediction}
        footer={frameOptions.footer}
        timeZone={timeZone}
      />
    );
  }, [cardType, frameOptions.footer, group, headline, jerseyName, matches, playerName, players, scorePrediction, selectedMatch, selectedTeam, showWatermark, size, standings, subtitle, teams, template, shirtNumber, timeZone]);

  useEffect(() => {
    setTimeZone(getBrowserTimezone());
    try {
      const probe = new File([new Blob()], "probe.png", { type: "image/png" });
      setCanShareFiles(typeof navigator !== "undefined" && typeof navigator.canShare === "function" && navigator.canShare({ files: [probe] }));
    } catch {
      setCanShareFiles(false);
    }
  }, []);

  // On first load (default card is Player Watch), seed the jersey with the team's star
  // player from the imported squad — unless a deep link is already dictating the card.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("player") || params.get("template") || params.get("match")) return;
    const sq = getTeamSquad(teamId);
    if (!sq.length) return;
    const star = getStarPlayer(teamId);
    if (!star) return;
    setSquadIndex(sq.indexOf(star));
    applySquadEntry(star, true, selectedTeam?.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateParam = params.get("template");
    const teamParam = params.get("team");
    const playerParam = params.get("player");
    const nameParam = params.get("name");
    const matchParam = params.get("match");
    const fallbackMatchCopy = {
      matchTime: "Local time unavailable",
      subtitle: "Save this matchup now. Local time will show when available.",
      scorePrediction: "Your call",
      footer: "Matchday prediction / WC26 Hub"
    };

    if (teamParam && teams.some((team) => team.id === teamParam || team.slug === teamParam)) {
      const team = teams.find((item) => item.id === teamParam || item.slug === teamParam);
      if (team) {
        setTeamId(team.id);
        setCountryName(team.name);
        setJerseyName(team.fifaCode);
        setPlayerName("YOUR PLAYER");
        setTeamHook(`${team.name} fans, save this`);
        setHeadline(roadHeadline(team.name));
        setSubtitle(`${team.name}'s road starts here. Save the group-stage path now.`);
        setMatchTime(publicKickoffLabel(matches.find((match) => match.homeTeamId === team.id || match.awayTeamId === team.id)?.kickoffUtc));
        setScorePrediction("Group stage");
        setFooter("Fan-made schedule / WC26 Hub");
        // A bare team deep link (?team=...) has no card type, so it used to land on the
        // default Player Watch with a road headline — an incoherent card. Country Road is
        // the logical home for a team link. A template/match param still wins below.
        if (!templateParam && !matchParam) setCardType("team-schedule");
      }
    }

    if (matchParam && matches.some((match) => match.id === matchParam)) {
      const match = matches.find((item) => item.id === matchParam);
      if (match) {
        setMatchId(match.id);
        setTeamId(match.homeTeamId);
        setCountryName(`${match.homeTeam.name} vs ${match.awayTeam.name}`);
        setJerseyName(match.homeTeam.fifaCode);
        setHeadline(`${match.homeTeam.fifaCode} VS ${match.awayTeam.fifaCode}`);
        setTeamHook(`${match.homeTeam.name} vs ${match.awayTeam.name}`);
        if (!match.kickoffUtc) {
          setSubtitle(fallbackMatchCopy.subtitle);
          setMatchTime(fallbackMatchCopy.matchTime);
          setScorePrediction(fallbackMatchCopy.scorePrediction);
          setFooter(fallbackMatchCopy.footer);
        } else {
          setMatchTime(publicKickoffLabel(match.kickoffUtc));
        }
      }
      setCardType("match-result");
    }

    if (playerParam) {
      // Resolve the slug against the imported squad of the linked team first.
      const linkedTeam = teamParam ? teams.find((item) => item.id === teamParam || item.slug === teamParam) : undefined;
      const squadTeamId = linkedTeam?.id || teamId;
      const squadEntry = findSquadPlayer(squadTeamId, playerParam);
      const customName = nameParam || (playerParam === "custom" ? "Custom player" : playerParam.replace(/[-_]+/g, " "));
      if (squadEntry) {
        const upper = squadEntry.name.toUpperCase();
        if (linkedTeam) setTeamId(linkedTeam.id);
        setPlayerName(upper);
        setJerseyName(squadEntry.name.split(" ").slice(-1)[0].toUpperCase());
        setShirtNumber(squadEntry.number != null ? String(squadEntry.number) : "");
        setCountryName(linkedTeam?.name || "");
        setTeamHook(`${linkedTeam?.name || "Fan"} player to watch`);
        setHeadline(`${upper} WATCH`);
        setSubtitle("Big-game energy. The name is enough.");
        setFooter("Player watch / WC26 Hub");
        setCardType("player-watch");
      } else {
        setCardType("fan-mode");
        setPlayerName(customName.toUpperCase());
        setJerseyName(customName.split(" ").slice(-1)[0].toUpperCase());
        setHeadline(`${customName.toUpperCase()} WATCH`);
        setSubtitle("Custom fan card. Pick your player and send it to the group.");
        setMatchTime(pendingTimeCopy);
        setFooter("Custom fan card / WC26 Hub");
        setStatus("Custom fan card loaded. Type any name in Customize card text.");
      }
    }

    if (templateParam) {
      const mapped = mapTemplateParam(templateParam);
      setCardType(mapped);
      if (mapped === "fan-mode") setFooter("Custom fan card / WC26 Hub");
      if (mapped === "top-scorers") {
        setHeadline("GOLDEN BOOT DEBATE");
        setSubtitle("Pick your No. 1 before the tournament gets loud.");
        setPlayerName("PICK YOUR NO. 1");
        setTeamHook("Every country can join the debate");
        setMatchTime("Debate card");
        setScorePrediction("Top 5 watch");
        setFooter("Prediction debate / WC26 Hub");
      }
      if (mapped === "match-preview") {
        setHeadline("OPPONENT WATCH");
        setSubtitle("Save the matchup now. Add reviewed opponent notes before matchday.");
        setMatchTime(publicKickoffLabel(matches.find((match) => match.id === matchParam)?.kickoffUtc || matches[0]?.kickoffUtc));
        setScorePrediction("Danger game?");
        setFooter("Opponent watch / WC26 Hub");
      }
    }
  }, [matches, players, teams]);

  // Capture the poster as a PNG data URL. The poster body is fully gradient-filled, but
  // the rounded-[16px] frame leaves transparent corners that read as a white background
  // on a light feed — square the frame for the capture only, then restore it.
  async function capturePngDataUrl(): Promise<string | null> {
    if (!cardRef.current) return null;
    const frame = cardRef.current.firstElementChild as HTMLElement | null;
    const prevRadius = frame?.style.borderRadius ?? "";
    if (frame) frame.style.borderRadius = "0";
    try {
      const { toPng } = await import("html-to-image");
      const target = cardSizes[size];
      return await toPng(cardRef.current, {
        backgroundColor: undefined,
        pixelRatio: target.width / target.previewWidth,
        cacheBust: true
      });
    } finally {
      if (frame) frame.style.borderRadius = prevRadius;
    }
  }

  function downloadDataUrl(dataUrl: string) {
    const link = document.createElement("a");
    link.download = `wc26-fan-card-${cardType}-${size}.png`;
    link.href = dataUrl;
    link.click();
  }

  async function exportPng() {
    setStatus("");
    try {
      const dataUrl = await capturePngDataUrl();
      if (!dataUrl) return;
      downloadDataUrl(dataUrl);
      setStatus("PNG exported.");
    } catch {
      setStatus("PNG export was blocked in this browser. The visual preview is ready; try Chrome or Edge for download.");
    }
  }

  // One-tap mobile share: hand the PNG to the OS share sheet. Falls back to download if
  // the device can't share files.
  async function sharePng() {
    setStatus("");
    try {
      const dataUrl = await capturePngDataUrl();
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "wc26-poster.png", { type: "image/png" });
      if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: headline, text: captions.whatsapp || captions.caption });
        setStatus("Shared.");
      } else {
        downloadDataUrl(dataUrl);
        setStatus("PNG exported.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return; // user dismissed the share sheet
      setStatus("Sharing was blocked in this browser. Try Download instead.");
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}/cards?template=${cardType}&team=${teamId}${matchId ? `&match=${matchId}` : ""}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Card link copied.");
    } catch {
      setStatus(url);
    }
  }

  function applyMatch(matchIdValue: string) {
    const match = matches.find((item) => item.id === matchIdValue);
    setMatchId(matchIdValue);
    if (!match) return;
    const title = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
    setTeamId(match.homeTeamId);
    setCountryName(title);
    setJerseyName(match.homeTeam.fifaCode);
    setHeadline(`${match.homeTeam.fifaCode} VS ${match.awayTeam.fifaCode}`);
    setTeamHook(title);
    setSubtitle(`Group ${match.group} storyline. Save the matchup and drop your call.`);
    setMatchTime(publicKickoffLabel(match.kickoffUtc));
    setFooter(match.kickoffUtc ? "Matchday prediction / WC26 Hub" : "Fan-made matchup card / WC26 Hub");
  }

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(`${label} copied.`);
    } catch {
      setStatus("Copy failed in this browser. Select the text manually.");
    }
  }

  function applyPreset(preset: (typeof templatePresets)[number]) {
    const personalized = personalizePreset(preset, selectedTeam, matches);
    setCardType(preset.cardType);
    setTemplate(preset.template);
    setSize(preset.size);
    setHeadline(personalized.headline);
    setSubtitle(preset.subtitle);
    setPlayerName(personalized.playerName);
    setCountryName(personalized.countryName);
    setShirtNumber(preset.shirtNumber);
    setJerseyName(personalized.jerseyName);
    setTeamHook(personalized.teamHook);
    setMatchTime(personalized.matchTime ?? preset.matchTime);
    setScorePrediction(preset.scorePrediction);
    setFooter(preset.footer);
    if (personalized.group) setGroup(personalized.group);
    if (personalized.matchId) setMatchId(personalized.matchId);
    setCustomCaption(`${preset.hook} Save this and send it to the group.`);
    setCustomHashtags(`#WorldCup2026 #${preset.label.replace(/\s+/g, "")} #Football #FanMade`);
    setShowWatermark(true);
    setStatus(`${preset.label} loaded.`);
    studioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function applyCardTypeFromSelect(value: CardType) {
    const preset = templatePresets.find((item) => item.cardType === value);
    if (preset) {
      applyPreset(preset);
      return;
    }
    setCardType(value);
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4">
        <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Start with a shareable template</p>
            <h2 className="text-3xl font-black text-[#0E0C0A] md:text-4xl">Pick a poster. Make it yours. Share it.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#0E0C0A]/58">Full poster previews first. One click loads the studio; advanced settings stay below the poster.</p>
        </div>
        <div className="grid justify-items-center gap-x-5 gap-y-8 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          {featuredPresets.map((preset) => (
            <TemplatePosterButton key={preset.label} preset={preset} onUse={applyPreset} featured sampleTeam={selectedTeam} sampleMatch={selectedMatch} matches={matches} teams={teams} standings={standings} players={players} group={group} timeZone={timeZone} />
          ))}
        </div>
      </section>

      <section ref={studioRef} className="grid scroll-mt-4 gap-5 lg:grid-cols-[380px_1fr]">
        <aside className="order-2 grid content-start gap-4 rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 shadow-[0_16px_40px_rgba(14,12,10,.07)] lg:order-1">
          <Select label="Card category" value={cardType} onChange={(value) => applyCardTypeFromSelect(value as CardType)}>
            <option value="player-watch">Player Watch</option>
            <option value="jersey-star">Back-of-Jersey Star</option>
            <option value="team-schedule">Team Schedule / Road to Glory</option>
            <option value="today">Matchday Menu</option>
            <option value="top-scorers">Golden Boot Debate</option>
            <option value="match-result">Prediction Battle</option>
            <option value="group-standings">Group of Chaos</option>
            <option value="match-preview">Upset Watch</option>
            <option value="legacy">Last Dance / Legacy Debate</option>
            <option value="fan-mode">Custom Fan Card</option>
          </Select>
          <SegmentedControl
            label="Format - resizes for every app"
            value={size}
            options={Object.entries(cardSizes).map(([key, item]) => ({ value: key, label: item.short, sub: item.label.replace(`${item.short} `, "") }))}
            onChange={(value) => setSize(value as CardSize)}
          />
          <SegmentedControl
            label="Theme"
            value={template}
            options={[
              { value: "festival", label: "Festival", sub: "Free", swatch: "linear-gradient(135deg,#FF2D6B,#FF6A1A)" },
              { value: "night-gold", label: "Night / Gold", sub: "Preview", swatch: "linear-gradient(135deg,#E7C36B,#0E0C0A)" }
            ]}
            onChange={(value) => setTemplate(value as CardTemplate)}
          />
          <Select label="Local time on poster" value={timeZone} onChange={setTimeZone}>
            {!QUICK_TIMEZONES.includes(timeZone) ? <option value={timeZone}>Your timezone</option> : null}
            {QUICK_TIMEZONES.map((zone) => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </Select>
              <Select label="Team / country" value={teamId} onChange={(value) => {
                const team = teams.find((item) => item.id === value);
                setTeamId(value);
                if (team) {
                  const preset = templatePresets.find((item) => item.cardType === cardType);
                  if (preset) {
                    const personalized = personalizePreset(preset, team, matches);
                    setHeadline(personalized.headline);
                    setPlayerName(personalized.playerName);
                    setJerseyName(personalized.jerseyName);
                    setCountryName(personalized.countryName);
                    setTeamHook(personalized.teamHook);
                    if (personalized.group) setGroup(personalized.group);
                    if (personalized.matchId) setMatchId(personalized.matchId);
                    if (personalized.matchTime) setMatchTime(personalized.matchTime);
                  } else {
                    setCountryName(team.name);
                    setJerseyName(team.fifaCode);
                    setTeamHook(`${team.name} fan card`);
                  }
                  // Load the new team's star player into the jersey/picker.
                  const star = getStarPlayer(value);
                  const newSquad = getTeamSquad(value);
                  setSquadIndex(star ? newSquad.indexOf(star) : 0);
                  if (star) applySquadEntry(star, cardType === "player-watch" || cardType === "jersey-star", team.name);
                }
              }}>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </Select>
          {cardType === "player-watch" && squad.length ? (
            <Select
              label="Squad player"
              value={String(squadIndex)}
              onChange={(value) => {
                const index = Number(value);
                setSquadIndex(index);
                const entry = squad[index];
                if (entry) {
                  // Picking a squad player always drives the headline + jersey name, and
                  // switches to Player Watch so the poster shows "<NAME> WATCH".
                  if (!isPlayerCard) setCardType("player-watch");
                  applySquadEntry(entry, true, selectedTeam?.name);
                  setStatus(`${entry.name} loaded into the card.`);
                }
              }}
            >
              {squad.map((player, index) => (
                <option key={`${player.name}-${index}`} value={index}>
                  {player.name} - {player.position}
                </option>
              ))}
            </Select>
          ) : null}
          {(cardType === "match-preview" || cardType === "match-result") ? (
            <Select label="Match" value={matchId} onChange={applyMatch}>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>{match.homeTeam.name} vs {match.awayTeam.name}</option>
              ))}
            </Select>
          ) : null}
          {cardType === "group-standings" ? (
            <Select label="Group" value={group} onChange={setGroup}>
              {GROUPS.map((item) => (
                <option key={item} value={item}>Group {item}</option>
              ))}
            </Select>
          ) : null}
          <details className="rounded-lg border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-3">
            <summary className="cursor-pointer text-sm font-black text-[#0E0C0A]">Customize card text</summary>
            <div className="mt-4 grid gap-4">
              <EditableField label="Player name" value={playerName} onChange={setPlayerName} />
              <EditableField label="Team / country text" value={countryName} onChange={setCountryName} />
              <EditableField label="Shirt number" value={shirtNumber} onChange={setShirtNumber} />
              <EditableField label="Jersey-back name" value={jerseyName} onChange={setJerseyName} />
              <EditableField label="Headline" value={headline} onChange={setHeadline} />
              <EditableField label="Subtitle" value={subtitle} onChange={setSubtitle} />
              <EditableField label="Team hook" value={teamHook} onChange={setTeamHook} />
              <EditableField label="Match time" value={matchTime} onChange={setMatchTime} />
              <EditableField label="Score prediction / prompt" value={scorePrediction} onChange={setScorePrediction} />
              <EditableField label="Footer" value={footer} onChange={setFooter} />
              <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#0E0C0A]/55">
                Caption
                <textarea
                  value={customCaption}
                  onChange={(event) => setCustomCaption(event.target.value)}
                  className="focus-ring min-h-24 rounded-md border border-[rgba(14,12,10,.10)] bg-white px-3 py-3 text-sm normal-case tracking-normal text-[#0E0C0A]"
                />
              </label>
              <EditableField label="Hashtags" value={customHashtags} onChange={setCustomHashtags} />
              <label className="flex items-center gap-3 rounded-md border border-[rgba(14,12,10,.10)] bg-white px-3 py-3 text-sm font-bold text-[#0E0C0A]/75">
                <input type="checkbox" checked={showWatermark} onChange={(event) => setShowWatermark(event.target.checked)} />
                Show subtle fan-made footer
              </label>
            </div>
          </details>
          <button onClick={copyLink} className="focus-ring flex items-center justify-center gap-2 rounded-md border border-[rgba(14,12,10,.12)] px-4 py-3 font-bold text-[#0E0C0A]">
            <Copy size={17} />
            Copy link
          </button>
          <div className="grid gap-2 sm:grid-cols-2">
            {canShareFiles ? (
              <button onClick={sharePng} className="focus-ring flex items-center justify-center gap-2 rounded-md bg-[#FF2D6B] px-4 py-3 font-black text-white">
                <Share2 size={17} />
                Share
              </button>
            ) : null}
            <button onClick={exportPng} className={`focus-ring flex items-center justify-center gap-2 rounded-md bg-[#0E0C0A] px-4 py-3 font-black text-white ${canShareFiles ? "" : "sm:col-span-2"}`}>
              <Download size={17} />
              Download PNG
            </button>
          </div>
          {status ? <p className="text-sm text-[#0E0C0A]/55">{status}</p> : null}
        </aside>
        <div className="order-1 overflow-x-auto rounded-lg border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-4 lg:order-2 lg:sticky lg:top-4 lg:self-start">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B48A00]">Preview / {cardSizes[size].label}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={copyLink} className="focus-ring inline-flex items-center gap-2 rounded-md border border-[rgba(14,12,10,.12)] px-3 py-2 text-xs font-bold text-[#0E0C0A]">
                <Copy size={14} />
                Copy link
              </button>
              {canShareFiles ? (
                <button onClick={sharePng} className="focus-ring inline-flex items-center gap-2 rounded-md bg-[#FF2D6B] px-3 py-2 text-xs font-black text-white">
                  <Share2 size={14} />
                  Share
                </button>
              ) : null}
              <button onClick={exportPng} className="focus-ring inline-flex items-center gap-2 rounded-md bg-[#0E0C0A] px-3 py-2 text-xs font-black text-white">
                <Download size={14} />
                Download
              </button>
            </div>
          </div>
          <div className="relative inline-block" ref={cardRef}>
            {card}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Copy kit</p>
          <h2 className="text-xl font-black text-[#0E0C0A]">Every card includes caption, X, WhatsApp-style copy, and hashtags.</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(captions).map(([label, value]) => (
            <div key={label} className="rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#B48A00]">{label}</p>
                <button onClick={() => copyText(value, label)} className="focus-ring rounded-md border border-[rgba(14,12,10,.10)] px-2 py-1 text-xs font-bold text-[#0E0C0A]/75">
                  Copy
                </button>
              </div>
              <p className="whitespace-pre-line text-sm leading-6 text-[#0E0C0A]/70">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TemplatePosterButton({
  preset,
  onUse,
  featured = false,
  sampleTeam,
  sampleMatch,
  matches,
  teams,
  standings,
  players,
  group,
  timeZone
}: {
  preset: (typeof templatePresets)[number];
  onUse: (preset: (typeof templatePresets)[number]) => void;
  featured?: boolean;
  sampleTeam: Team;
  sampleMatch: MatchWithTeams;
  matches: MatchWithTeams[];
  teams: Team[];
  standings: Standing[];
  players: PlayerWithStats[];
  group: string;
  timeZone: string;
}) {
  const variant = cardTypeToPosterVariant(preset.cardType);
  const width = featured ? 260 : 190;
  const personalized = personalizePreset(preset, sampleTeam, matches);
  const previewMatch = (personalized.matchId && matches.find((match) => match.id === personalized.matchId)) || sampleMatch;
  const previewGroup = personalized.group ?? group;

  return (
    <button onClick={() => onUse(preset)} className="focus-ring group block text-left">
      <div className="transition group-hover:-translate-y-1">
        <PosterPreviewCard
          variant={variant}
          ratio="story"
          width={width}
          theme="festival"
          pro={false}
          team={sampleTeam}
          opponent={previewMatch.awayTeam}
          match={previewMatch}
          matches={variant === "menu" ? matches.slice(0, 4) : matches.filter((match) => match.homeTeamId === sampleTeam.id || match.awayTeamId === sampleTeam.id)}
          teams={teams}
          standings={standings}
          players={players}
          group={previewGroup}
          headline={personalized.headline}
          subtitle={preset.subtitle}
          playerName={personalized.playerName}
          jerseyName={personalized.jerseyName}
          shirtNumber={preset.shirtNumber}
          scorePrediction={preset.scorePrediction}
          footer={preset.footer}
          timeZone={timeZone}
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3" style={{ width }}>
        <p className="truncate text-base font-black text-[#0E0C0A]">{preset.label}</p>
        <span className="shrink-0 text-[11px] font-black uppercase tracking-[0.14em] text-[#FF2D6B] group-hover:text-[#FF6A1A]">Use →</span>
      </div>
      <p className="mt-1 text-sm leading-5 text-[#0E0C0A]/58" style={{ width }}>{preset.hook}</p>
    </button>
  );
}

function SegmentedControl({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string; sub: string; swatch?: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0E0C0A]/55">{label}</p>
      <div className={`grid ${options.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-1 rounded-xl bg-[#F6F4F1] p-1`}>
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`focus-ring min-w-0 rounded-lg px-2 py-2 text-center transition ${active ? "bg-white shadow-[0_2px_8px_rgba(14,12,10,.10)]" : "text-[#0E0C0A]/55 hover:bg-white/55"}`}
            >
              <span className="flex min-w-0 items-center justify-center gap-1.5">
                {option.swatch ? <span className="h-3 w-3 shrink-0 rounded-[3px]" style={{ background: option.swatch }} /> : null}
                <span className="min-w-0 truncate text-sm font-black uppercase leading-none text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif]">{option.label}</span>
              </span>
              <span className={`mt-1 block truncate text-[9px] font-black uppercase tracking-[0.08em] ${active ? "text-[#FF2D6B]" : "text-[#0E0C0A]/45"}`}>{option.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#0E0C0A]/55">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] px-3 py-3 text-sm normal-case tracking-normal text-[#0E0C0A]"
      >
        {children}
      </select>
    </label>
  );
}

function EditableField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#0E0C0A]/55">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring rounded-md border border-[rgba(14,12,10,.10)] bg-white px-3 py-3 text-sm normal-case tracking-normal text-[#0E0C0A]"
      />
    </label>
  );
}

function buildCaptions(
  cardType: CardType,
  match: MatchWithTeams,
  team: Team,
  playerName: string,
  custom: string,
  customHashtags: string
): CaptionSet {
  const title = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
  const time = publicKickoffLabel(match.kickoffUtc);
  const scheduleHelper = match.kickoffUtc ? `Local time: ${time}.` : "Local time unavailable.";
  const base: CaptionSet = {
    caption: "Matchday is loading up. Save this.",
    hype: "Clear your calendar. This is the kind of matchday the tournament was made for.",
    banter: "Productivity officially cancelled.",
    x: "World Cup 2026 fan-card menu is looking dangerous. Which game are you watching?",
    telegram: `MATCHDAY MENU\n\n${title}\n${time}\n\n${scheduleHelper} Send this to the group.`,
    whatsapp: "Maç listesi hazır. Saatler onaylanınca yerel saate göre güncellenir.",
    hashtags: customHashtags,
    custom
  };

  if (cardType === "player-watch" || cardType === "jersey-star") {
    return {
      caption: `${playerName} watch. Save this before kick-off.`,
      hype: `${playerName} big-game energy. No face needed. The name is enough.`,
      banter: `${playerName} agenda starts now. Receipts will be checked later.`,
      x: `${playerName} watch.\n\nBig-game energy. Who is your player to watch? #WorldCup2026`,
      telegram: `PLAYER WATCH\n\n${playerName}\n${team.name}\n\nSend your player to watch before kick-off.`,
      whatsapp: `${playerName} watch kartı hazır. Gruba atın, herkes kendi oyuncusunu yazsın.`,
      hashtags: customHashtags,
      custom
    };
  }

  if (cardType === "team-schedule") {
    return {
      caption: `${team.name} fans, save this.`,
      hype: `${team.name}'s group-stage road starts here. Save the path with real local times in one clean fan card.`,
      banter: `${team.name} group chat check-in: how many points are we taking?`,
      x: `${team.name}'s World Cup 2026 fan-made schedule card.\n\nSave it before kick-off. #WorldCup2026`,
      telegram: `${team.name} schedule card\n\nSave this and share it before matchday. ${scheduleHelper}`,
      whatsapp: `${team.name} maç yolu burada. Yerel saatler hazır. Gruba atın, kimse kaçırmasın.`,
      hashtags: customHashtags,
      custom
    };
  }

  if (cardType === "top-scorers" || cardType === "legacy") {
    return {
      caption: "Pick your No. 1. No sitting on the fence.",
      hype: "The debate starts before the first whistle. Who owns the big moment?",
      banter: "Drop the agenda now so nobody pretends later.",
      x: "Big tournament debate.\n\nWho owns the moment? #WorldCup2026",
      telegram: "FAN DEBATE\n\nPick your No. 1 and send the card to the group.",
      whatsapp: "Tahminler gelsin. Kim büyük anı alır? Herkes bir isim yazsın.",
      hashtags: customHashtags,
      custom
    };
  }

  if (cardType === "group-standings") {
    return {
      caption: "Group of chaos. Who survives?",
      hype: "One group. No easy games. Pick your top two before the table starts flipping.",
      banter: "This group is not normal. Screenshot your prediction now.",
      x: "Group of chaos.\n\nWho survives this group? #WorldCup2026",
      telegram: "GROUP OF CHAOS\n\nPick your top two and send your prediction before matchday.",
      whatsapp: "Bu grup normal değil. İlk iki tahminlerinizi yazın, sonra kimse inkâr etmesin.",
      hashtags: customHashtags,
      custom
    };
  }

  if (cardType === "match-result" || cardType === "fan-mode") {
    return {
      caption: "Drop your score prediction.",
      hype: `${title}. Big-match call. Pick the score before kick-off.`,
      banter: "Receipts matter. Send your prediction before the excuses arrive.",
      x: `${title}\n\nDrop your score prediction before kick-off. #WorldCup2026`,
      telegram: `PREDICTION BATTLE\n\n${title}\n${time}\n\nDrop your score before kick-off.`,
      whatsapp: "Skor tahminleri gelsin. Maç başlamadan yazın, sonra kimse tahmin değiştirmesin.",
      hashtags: customHashtags,
      custom
    };
  }

  if (cardType === "match-preview") {
    return {
      caption: `${title}. Upset watch?`,
      hype: match.kickoffUtc ? `${title} at ${time}. This one has danger-game energy.` : `${title}. Save the matchup now; this one has danger-game energy.`,
      banter: "This one could get weird. Drop predictions now.",
      x: `${title}\n\nUpset watch? Save the matchup now. #WorldCup2026`,
      telegram: `UPSET WATCH\n\n${title}\n${time}\n\nSend predictions before kick-off.`,
      whatsapp: "Bu maçta sürpriz kokusu var. Tahminleri yazın; saatler onaylanınca güncellenir.",
      hashtags: customHashtags,
      custom
    };
  }

  return base;
}
