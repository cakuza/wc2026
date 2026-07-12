/**
 * Constrained player-name alias table for worldcup26.ir scorer strings.
 *
 * Resolution order (per P0 scorer integrity spec):
 *   1. Provider athlete ID           — not available from worldcup26.ir
 *   2. Provider player ID + team     — not available from worldcup26.ir
 *   3. Exact canonical roster match  — covered by direct name (no corruption)
 *   4. Verified alias constrained by provider + team + event  ← this file
 *   5. Conservative team-scoped match
 *   6. Unresolved → "Scorer unavailable"
 *
 * Every entry is constrained to at least one (matchId, scoringTeam) pair.
 * A raw string never resolves globally across unrelated teams or events.
 *
 * worldcup26.ir corruption classes
 * ─────────────────────────────────
 * RC1  UTF-8 Mojibake: provider sends UTF-8 but some layer re-interprets
 *      bytes as Latin-1. Fixed automatically in fixMojibake() — not listed
 *      here (those entries are only present as fallback for C1-stripped forms).
 *
 * RC2  Persian transliteration: worldcup26.ir stores names in Persian script.
 *      Informal romanisation rules:
 *        • Short vowels (a, e) dropped
 *        • Long "و" (wāw, u/o) → "v"
 *        • "ج" (jim) → "i/ai" in some positions
 *        • Word-final "ه" (he) → "h"
 *        • "خ" (khe) → "kh"; sometimes "چ" (che) → "ch"
 *      Produces consonant-skeleton output: Gonzalo Plata → "Gvnzalv Plata".
 */

export type PlayerAliasEntry = {
  /** Raw string from worldcup26.ir, after fixMojibake() has been applied. */
  rawValue: string;
  /** Canonical player display name, or "Scorer unavailable" if unresolvable. */
  canonical: string;
  provider: "worldcup26.ir";
  /** Provider does not supply athlete IDs — always null. */
  providerPlayerId?: string | null;
  providerAthleteId?: string | null;
  /**
   * internalMatchId values where this alias is valid.
   * An empty array means the alias is accepted for any match (single globally
   * unambiguous name) but team-scoping still applies via scoringTeam.
   */
  matchIds: string[];
  /** Required when a raw value needs event-level disambiguation. */
  eventMinute?: number;
  eventStoppageTime?: number | null;
  /** Team credited with the goal (OG = team that benefits). */
  scoringTeam: string;
  /** Actual player's national team when different from scoringTeam (own goal). */
  playerTeam?: string;
  isOwnGoal?: true;
  /** Primary evidence for the canonical name. */
  source: string;
  confidence: "high" | "medium";
  /** Explanation of how the corruption maps to the canonical name. */
  reason: string;
};

type GoalProvider = PlayerAliasEntry["provider"] | "football-data.org" | "espn";

export type PlayerAliasResolutionContext = {
  provider: GoalProvider;
  matchId?: string;
  eventMinute?: number | null;
  stoppageMinute?: number | null;
  scoringTeam?: string;
  playerTeam?: string;
  rawName: string;
  providerPlayerId?: string | null;
  providerAthleteId?: string | null;
};

export const PLAYER_ALIASES: PlayerAliasEntry[] = [
  // ── Turkey ────────────────────────────────────────────────────────────────
  {
    rawValue: "Baris Alpr Ailmaz",
    canonical: "Barış Alper Yılmaz",
    provider: "worldcup26.ir",
    providerPlayerId: "worldcup26.ir:turkey:baris-alper-yilmaz",
    providerAthleteId: null,
    matchIds: ["turkey-vs-united-states-jun25"],
    eventMinute: 31,
    eventStoppageTime: null,
    scoringTeam: "Turkey",
    source: "task brief + verified correction",
    confidence: "high",
    reason: "RC2: Barış→Baris (ş stripped), Alper preserved, Yılmaz→Ailmaz (Y→Ai, ı→l lost, maz→maz)",
  },
  {
    rawValue: "Kan Aihan",
    canonical: "Kaan Ayhan",
    provider: "worldcup26.ir",
    providerPlayerId: "worldcup26.ir:turkey:kaan-ayhan",
    providerAthleteId: null,
    matchIds: ["turkey-vs-united-states-jun25"],
    eventMinute: 90,
    eventStoppageTime: 8,
    scoringTeam: "Turkey",
    source: "task brief + verified correction",
    confidence: "high",
    reason: "RC2: Kaan→Kan (double-a→single), Ayhan→Aihan (y→i, h→h preserved)",
  },

  // ── Ecuador ───────────────────────────────────────────────────────────────
  {
    rawValue: "Nilsvn Angvlv",
    canonical: "Nilson Angulo",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["ecuador-vs-germany-jun25"],
    scoringTeam: "Ecuador",
    source: "Ecuador 2026 squad; confirmed scorer",
    confidence: "high",
    reason: "RC2: Nilson→Nilsvn (o→v), Angulo→Angvlv (o→v, o→v)",
  },
  {
    rawValue: "Gvnzalv Plata",
    canonical: "Gonzalo Plata",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["ecuador-vs-germany-jun25"],
    scoringTeam: "Ecuador",
    source: "Ecuador 2026 squad; confirmed scorer",
    confidence: "high",
    reason: "RC2: Gonzalo→Gvnzalv (o→v, o→v; a preserved)",
  },

  // ── Netherlands ───────────────────────────────────────────────────────────
  {
    rawValue: "Kvdi Khakpv",
    canonical: "Cody Gakpo",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["netherlands-vs-sweden-jun20"],
    scoringTeam: "Netherlands",
    source: "Netherlands 2026 squad; confirmed scorer (2 goals)",
    confidence: "high",
    reason: "RC2: Cody→Kvdi (C→K, o→v, dy→di), Gakpo→Khakpv (G→Kh, a preserved, o→v)",
  },
  {
    rawValue: "Ian Fn Hkh",
    canonical: "Jan van Hecke",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["tunisia-vs-netherlands-jun25"],
    scoringTeam: "Netherlands",
    source: "Sky Sports Tunisia 1-3 Netherlands match report, June 25 2026",
    confidence: "high",
    reason: "RC2: Jan→Ian (j→i in Arabic/Persian), van→Fn (v→f, a dropped), Hecke→Hkh (e dropped, c→k, e→h)",
  },

  // ── Germany ───────────────────────────────────────────────────────────────
  {
    rawValue: "Dniz Avndav",
    canonical: "Denis Undav",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["germany-vs-ivory-coast-jun20"],
    scoringTeam: "Germany",
    source: "Germany 2026 squad; confirmed scorer (2 goals)",
    confidence: "high",
    reason: "RC2: Denis→Dniz (e dropped, s→z), Undav→Avndav (U→Av, n/d/a/v preserved)",
  },

  // ── Colombia ──────────────────────────────────────────────────────────────
  {
    rawValue: "Dnil Mvnvz",
    canonical: "Daniel Muñoz",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["uzbekistan-vs-colombia-jun17", "colombia-vs-dr-congo-jun23"],
    scoringTeam: "Colombia",
    source: "FIFA match centre Uzbekistan 1-3 Colombia; Colombia 2026 squad",
    confidence: "high",
    reason: "RC2: Daniel→Dnil (a/e dropped), Muñoz→Mvnvz (u→v, ñ→n, o→v, z preserved)",
  },
  {
    rawValue: "Lviiz Diaz",
    canonical: "Luis Díaz",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["uzbekistan-vs-colombia-jun17"],
    scoringTeam: "Colombia",
    source: "Al Jazeera Uzbekistan vs Colombia report; FIFA match centre",
    confidence: "high",
    reason: "RC2: Luis→Lviiz (u→v, i doubled, s→z) + Díaz correct (diacritic preserved in this match)",
  },
  {
    rawValue: "Khamintvn Kampaz",
    canonical: "Jaminton Campaz",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["uzbekistan-vs-colombia-jun17"],
    scoringTeam: "Colombia",
    source: "ESPN Uzbekistan 1-3 Colombia live updates; FOX Sports boxscore",
    confidence: "high",
    reason: "RC2: Jaminton→Khamintvn (J→Kh in ج rendering, a preserved, i/n/t preserved, o→v), Campaz→Kampaz (C→K)",
  },

  // ── Mexico ────────────────────────────────────────────────────────────────
  {
    rawValue: "Jvlian Kviinvnz",
    canonical: "Julián Quiñones",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["czechia-vs-mexico-jun24"],
    scoringTeam: "Mexico",
    source: "Mexico 2026 squad; Julián Quiñones is a Mexico international",
    confidence: "high",
    reason: "RC2: Julián→Jvlian (u→v, á→a), Quiñones→Kviinvnz (Qu→Kv, i doubled, ñ→in, o→v, es→z)",
  },

  // ── Portugal ──────────────────────────────────────────────────────────────
  {
    rawValue: "Nvnv Mndz",
    canonical: "Nuno Mendes",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["portugal-vs-uzbekistan-jun23"],
    scoringTeam: "Portugal",
    source: "FIFA Portugal 5-0 Uzbekistan match report",
    confidence: "high",
    reason: "RC2: Nuno→Nvnv (u→v, o→v), Mendes→Mndz (e dropped, e dropped, s→z)",
  },
  {
    rawValue: "Abdalvhid Namtvf",
    canonical: "Abduvohid Nematov",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["portugal-vs-uzbekistan-jun23"],
    scoringTeam: "Portugal",
    playerTeam: "Uzbekistan",
    isOwnGoal: true,
    source: "FIFA Portugal 5-0 Uzbekistan; tapmad.com match live; ESPN as-it-happened",
    confidence: "high",
    reason: "RC2 OG: Abduvohid (Abd al-Wahid)→Abdalvhid (al→al, W→v, a dropped, hid preserved), Nematov→Namtvf (e→a, a→t?, o→v, v→f)",
  },

  // ── Japan ────────────────────────────────────────────────────────────────
  {
    rawValue: "Aiash Ivida",
    canonical: "Ayase Ueda",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["tunisia-vs-japan-jun20"],
    scoringTeam: "Japan",
    source: "Japan 2026 squad; Ayase Ueda is Japan's starting striker",
    confidence: "high",
    reason: "RC2: Ayase→Aiash (ay→ai, se→sh via Persian ش); Ueda→Ivida (U→I, e→v, da→da)",
  },

  // ── Switzerland / Canada ─────────────────────────────────────────────────
  {
    rawValue: "Jvhan Mnzambi",
    canonical: "Johan Manzambi",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["switzerland-vs-canada-jun24"],
    scoringTeam: "Switzerland",
    source: "FIFA Switzerland 2-1 Canada; FOX Sports boxscore",
    confidence: "high",
    reason: "RC2: Johan→Jvhan (o→v), Manzambi→Mnzambi (a dropped). Same name appears correctly in switzerland-vs-bosnia-jun18.",
  },
  {
    rawValue: "Prvmis Divid",
    canonical: "Promise David",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["switzerland-vs-canada-jun24"],
    scoringTeam: "Canada",
    source: "FIFA Switzerland 2-1 Canada; FOX Sports boxscore June 24 2026",
    confidence: "high",
    reason: "RC2: Promise→Prvmis (o→v, e dropped), David→Divid (a→i in Persian rendering)",
  },

  // ── Norway / Algeria ──────────────────────────────────────────────────────
  {
    rawValue: "Markvs Hlmgrn Pdrsn",
    canonical: "Markus Holmgren Pedersen",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["norway-vs-senegal-jun22"],
    scoringTeam: "Norway",
    source: "Norway 2026 squad; full name Markus Holmgren Pedersen",
    confidence: "high",
    reason: "RC2: Markus→Markvs (u→v), Holmgren→Hlmgrn (o/e dropped), Pedersen→Pdrsn (e/e dropped)",
  },
  {
    rawValue: "Nzir Bnbvali",
    canonical: "Nadhir Benbouali",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["jordan-vs-algeria-jun22"],
    scoringTeam: "Algeria",
    source: "Al Jazeera Jordan 1-2 Algeria; Bleacher Report live blog",
    confidence: "high",
    reason: "RC2: Nadhir→Nzir (a dropped, dh→z in Persian ذ rendering, i preserved, r preserved), Benbouali→Bnbvali (e/ou→v)",
  },

  // ── Morocco ───────────────────────────────────────────────────────────────
  {
    rawValue: "Asmaail Saibari",
    canonical: "Ismaël Saibari",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["scotland-vs-morocco-jun19", "morocco-vs-haiti-jun24"],
    scoringTeam: "Morocco",
    source: "FOX Sports Morocco's Ismael Saibari scores; Morocco 2026 squad",
    confidence: "high",
    reason: "RC2 + Arabic: Ismaël (إسماعيل) → Asmaail (I→A initial alef, sm→sm, ā→aa long vowel, il→il)",
  },
  {
    rawValue: "Svfian Rhimi",
    canonical: "Soufiane Rahimi",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["morocco-vs-haiti-jun24"],
    scoringTeam: "Morocco",
    source: "Sky Sports Morocco 4-2 Haiti; ABC News report",
    confidence: "high",
    reason: "RC2: Soufiane→Svfian (ou→v, e dropped), Rahimi→Rhimi (a dropped)",
  },
  // Gessime Yassine is the player's actual full name — no alias needed.
  // The entry was incorrectly added as "Scorer unavailable"; it is removed here.

  // ── Canada (own goal) ─────────────────────────────────────────────────────
  {
    rawValue: "Kail Larin",
    canonical: "Cyle Larin",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["canada-vs-qatar-jun18"],
    scoringTeam: "Canada",
    source: "Canada 2026 squad; Cyle Larin is Canada's starting striker",
    confidence: "high",
    reason: "RC2: Cyle→Kail (C→K, y→ai, le→l — cy rendered as Persian کای → Kail)",
  },

  // ── Senegal ───────────────────────────────────────────────────────────────
  {
    rawValue: "Paph Gviih",
    canonical: "Pape Gueye",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["senegal-vs-iraq-jun26"],
    scoringTeam: "Senegal",
    source: "ESPN Senegal 5-0 Iraq; FIFA match report",
    confidence: "high",
    reason: "RC2: Pape→Paph (word-final e→h in Persian هٔ rendering), Gueye→Gviih (ue→v, y→i, e→h)",
  },
  {
    rawValue: "Ailman Andiaih",
    canonical: "Iliman Ndiaye",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["senegal-vs-iraq-jun26"],
    scoringTeam: "Senegal",
    source: "ESPN Senegal 5-0 Iraq; FIFA Senegal-Iraq match report",
    confidence: "high",
    reason: "RC2: Iliman→Ailman (I→Ai via Arabic ي alef-ye rendering, li→l, man→man), Ndiaye→Andiaih (N→An prefix, di→di, ay→ai, e→h)",
  },

  // ── Ivory Coast ───────────────────────────────────────────────────────────
  {
    rawValue: "Nikvlas Ph Ph",
    canonical: "Nicolas Pépé",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["curacao-vs-ivory-coast-jun25"],
    scoringTeam: "Ivory Coast",
    source: "Ivory Coast 2026 squad; Nicolas Pépé is a prominent Ivorian winger",
    confidence: "medium",
    reason: "RC2: Nicolas→Nikvlas (o→v, a→a), Pépé→Ph Ph (é→h twice — word-final é rendered as Persian ه, p preserved)",
  },

  // ── Cape Verde ────────────────────────────────────────────────────────────
  {
    rawValue: "Hliv Varla",
    canonical: "Hélio Varela",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["uruguay-vs-cape-verde-jun21"],
    scoringTeam: "Cape Verde",
    source: "Cape Verde 2026 squad confirmation",
    confidence: "medium",
    reason: "RC2: Hélio→Hliv (H preserved, é dropped, li→li, o→v), Varela→Varla (e dropped)",
  },

  // ── Tunisia ───────────────────────────────────────────────────────────────
  {
    rawValue: "Alis Skhiri",
    canonical: "Ellyes Skhiri",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["tunisia-vs-netherlands-jun25"],
    scoringTeam: "Netherlands",
    playerTeam: "Tunisia",
    isOwnGoal: true,
    source: "FOX Sports 'Ellyes Skhiri fires it into his own net'; Sky Sports Tunisia 1-3 Netherlands",
    confidence: "high",
    reason: "RC2 OG: Ellyes (إلياس = Ilyas/Elias) → Alis (E→A, ll→l, y→i, es→s). Provider credits Netherlands (OG); isOwnGoal must be true.",
  },
  {
    rawValue: "Hazm Mstvri",
    canonical: "Hazem Mastouri",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["tunisia-vs-netherlands-jun25"],
    scoringTeam: "Tunisia",
    source: "Sky Sports Tunisia 1-3 Netherlands match report June 25 2026",
    confidence: "high",
    reason: "RC2: Hazem→Hazm (e dropped), Mastouri→Mstvri (a dropped, o→v, u dropped)",
  },

  // ── Bosnia & Herzegovina ─────────────────────────────────────────────────
  {
    rawValue: "Karim Alaibgvvich",
    canonical: "Kerim Alajbegović",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["bosnia-vs-qatar-jun24"],
    scoringTeam: "Bosnia & Herzegovina",
    source: "FOX Sports 'Bosnia's Kerim Alajbegovic scores absolute screamer'; Sky Sports match report",
    confidence: "high",
    reason: "RC2: Kerim→Karim (e→a in Arabic كريم), Alajbegović→Alaibgvvich (j→ib?, e dropped, o→v, ić→ich)",
  },
  {
    rawValue: "Abvnad",
    canonical: "Sultan Al-Brake",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["bosnia-vs-qatar-jun24"],
    scoringTeam: "Bosnia & Herzegovina",
    playerTeam: "Qatar",
    isOwnGoal: true,
    source: "FIFA Bosnia 3-1 Qatar match report; ESPN game analysis; Sky Sports match report",
    confidence: "high",
    reason: "RC2 OG: Provider shows 'Abvnad' (= Mahmoud Abunada, Qatar GK) but authoritative sources (FIFA, ESPN, Sky Sports) credit Sultan Al-Brake (Qatar defender) with the 34' OG. FIFA source used.",
  },
  {
    rawValue: "Armin Mhmich",
    canonical: "Ermin Mahmić",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["bosnia-vs-qatar-jun24"],
    scoringTeam: "Bosnia & Herzegovina",
    source: "FIFA Bosnia 3-1 Qatar match report; ESPN game analysis",
    confidence: "high",
    reason: "RC2: Ermin→Armin (E→A), Mahmić→Mhmich (a dropped, i preserved, ć→ch)",
  },

  // ── United States ─────────────────────────────────────────────────────────
  {
    rawValue: "Kamrvn Bargs",
    canonical: "Cameron Burgess",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["united-states-vs-australia-jun19"],
    scoringTeam: "United States",
    playerTeam: "Australia",
    isOwnGoal: true,
    source: "NBC Sports USA 2-0 Australia; FIFA match report; USSOCCER.com recap",
    confidence: "high",
    reason: "RC2 OG: Cameron→Kamrvn (C→K, a preserved, e dropped, o→v, n preserved), Burgess→Bargs (u dropped, e dropped, ss→s). Provider listed without OG flag; corrected via verifiedMatchEventCorrections.",
  },

  // ── New Zealand ───────────────────────────────────────────────────────────
  {
    rawValue: "Fin Svrman",
    canonical: "Finn Surman",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["new-zealand-vs-egypt-jun21"],
    scoringTeam: "New Zealand",
    source: "Al Jazeera NZ 1-3 Egypt; FIFA match report",
    confidence: "high",
    reason: "RC2: Finn→Fin (double-n→n), Surman→Svrman (u→v)",
  },

  // ── Saudi Arabia (own goal) ───────────────────────────────────────────────
  {
    rawValue: "Hassan Mohamed Altmbkti",
    canonical: "Hassan Altambakti",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["spain-vs-saudi-arabia-jun21"],
    scoringTeam: "Spain",
    playerTeam: "Saudi Arabia",
    isOwnGoal: true,
    source: "FIFA Spain 4-0 Saudi Arabia match report; ESPN game analysis",
    confidence: "high",
    reason: "RC2 OG: Hassan preserved, Mohamed is middle name added by provider, Altambakti→Altmbkti (a/a dropped). Provider listed without OG flag; corrected via verifiedMatchEventCorrections.",
  },

  // ── Ghana ─────────────────────────────────────────────────────────────────
  {
    rawValue: "Kalb Iirnki",
    canonical: "Caleb Yirenkyi",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["ghana-vs-panama-jun17"],
    scoringTeam: "Ghana",
    source: "FIFA Ghana 1-0 Panama match report; Opta Analyst; FIFA match centre",
    confidence: "high",
    reason: "RC2: Caleb→Kalb (C→K, a preserved, e dropped), Yirenkyi→Iirnki (Y→I, i→i, r/e/n/k/y/i → iirnki with e dropped)",
  },

  // ── South Africa ─────────────────────────────────────────────────────────
  {
    rawValue: "Taplv Maskv",
    canonical: "Thapelo Maseko",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["south-africa-vs-south-korea-jun24"],
    scoringTeam: "South Africa",
    source: "FOX Sports 'South Africa's Thapelo Maseko scores goal'; ESPN South Africa 1-0 South Korea",
    confidence: "high",
    reason: "RC2: Thapelo→Taplv (Th→T, a preserved, e dropped, lo→lv with o→v), Maseko→Maskv (a preserved, e dropped, o→v)",
  },

  // ── Uzbekistan ────────────────────────────────────────────────────────────
  {
    rawValue: "Abas Bk Fiz Allh Af",
    canonical: "Abbosbek Fayzullayev",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["uzbekistan-vs-colombia-jun17"],
    scoringTeam: "Uzbekistan",
    source: "FOX Sports 'Abbosbek Fayzullaev scores equalizer'; FIFA match centre Uzbekistan 1-3 Colombia",
    confidence: "high",
    reason: "RC2: Abbosbek→Abas Bk (bb→b, o dropped, s preserved, bek→Bk vowels dropped), Fayzullayev→Fiz Allh Af (ay→iz, u/ll/ay/ev complex drop with ll→Allh af)",
  },

  // ── RC1 fallback aliases for C1-stripped Mojibake ─────────────────────────
  // fixMojibake() handles normal 2-byte UTF-8 sequences. However, when the
  // second byte falls in the C1 control range (0x80–0x9F), some PHP/proxy
  // layers strip it before the data reaches us. The resulting string contains
  // the first byte as a lone high-Latin-1 character — fixMojibake can't detect
  // that, so these alias entries provide a last-resort canonical form.
  {
    rawValue: "L. KrejÄÃ­",
    canonical: "L. Krejčí",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["south-korea-vs-czechia-jun11"],
    scoringTeam: "Czechia",
    source: "Czechia 2026 squad; Lukáš Krejčí confirmed scorer",
    confidence: "high",
    reason: "RC1 C1-stripped: č (U+010D, UTF-8 C4 8D) → Ä + \\x8D; if \\x8D stripped → Ä alone. í (U+00ED, UTF-8 C3 AD) → Ã­ (handled by fixMojibake). Combined: KrejÄÃ­.",
  },
  {
    rawValue: "Ãlex Baena",
    canonical: "Àlex Baena",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["uruguay-vs-spain-jun26"],
    scoringTeam: "Spain",
    source: "Spain 2026 squad; Àlex Baena confirmed scorer",
    confidence: "high",
    reason: "RC1 C1-stripped: À (U+00C0, UTF-8 C3 80) → Ã + \\x80; if \\x80 stripped → Ã alone before 'lex'.",
  },
  {
    rawValue: "Leo ÃstigÃ¥rd",
    canonical: "Leo Østigård",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["iraq-vs-norway-jun16"],
    scoringTeam: "Norway",
    source: "Norway 2026 squad; Leo Østigård confirmed scorer",
    confidence: "high",
    reason: "RC1 C1-stripped: Ø (U+00D8, UTF-8 C3 98) → Ã + \\x98; if \\x98 stripped → Ã alone. å (U+00E5, UTF-8 C3 A5) → Ã¥ (handled by fixMojibake). Combined: ÃstigÃ¥rd.",
  },
  {
    rawValue: "Junya ItÅ",
    canonical: "Junya Itō",
    provider: "worldcup26.ir",
    matchIds: ["tunisia-vs-japan-jun20"],
    scoringTeam: "Japan",
    source: "Japan 2026 squad; Junya Itō confirmed scorer",
    confidence: "high",
    reason: "RC1 C1-stripped: ō (U+014D, UTF-8 C5 8D) → Å + \\x8D; if \\x8D stripped → Å alone: ItÅ.",
  },
  {
    rawValue: "Andrias Shldrvp",
    canonical: "Andreas Schjelderup",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["norway-vs-england-jul11"],
    scoringTeam: "Norway",
    source: "manual update",
    confidence: "high",
    reason: "RC2: Translates Andrias Shldrvp -> Andreas Schjelderup",
  },
  {
    rawValue: "Jvd Blingham",
    canonical: "Jude Bellingham",
    provider: "worldcup26.ir",
    providerAthleteId: null,
    matchIds: ["norway-vs-england-jul11"],
    scoringTeam: "England",
    source: "manual update",
    confidence: "high",
    reason: "RC2: Translates Jvd Blingham -> Jude Bellingham",
  },
];

/**
 * Build a fast lookup index from the rich alias list.
 * Index key: rawValue  (case-sensitive, post-fixMojibake).
 * When multiple entries share a rawValue, team-scoped entries take priority.
 */
const _byRaw = new Map<string, PlayerAliasEntry[]>();
const _byProviderPlayerId = new Map<string, PlayerAliasEntry[]>();
const _byProviderAthleteId = new Map<string, PlayerAliasEntry[]>();
for (const entry of PLAYER_ALIASES) {
  const arr = _byRaw.get(entry.rawValue) ?? [];
  arr.push(entry);
  _byRaw.set(entry.rawValue, arr);
  if (entry.providerPlayerId) {
    const byPlayerId = _byProviderPlayerId.get(entry.providerPlayerId) ?? [];
    byPlayerId.push(entry);
    _byProviderPlayerId.set(entry.providerPlayerId, byPlayerId);
  }
  if (entry.providerAthleteId) {
    const byAthleteId = _byProviderAthleteId.get(entry.providerAthleteId) ?? [];
    byAthleteId.push(entry);
    _byProviderAthleteId.set(entry.providerAthleteId, byAthleteId);
  }
}

/**
 * Look up a canonical player name.
 *
 * @param rawValue  Corrupted name string (after fixMojibake has been applied).
 * @param teamName  Scoring team display name from the match context.
 * @returns The matched AliasEntry, or undefined if no alias applies.
 */
function findPlayerAliasLegacy(
  rawValue: string,
  teamName?: string,
): PlayerAliasEntry | undefined {
  const candidates = _byRaw.get(rawValue);
  if (!candidates || candidates.length === 0) return undefined;

  // No team constraint — return first candidate. Used by callers that don't
  // have team context (e.g. C1-fallback unit tests, direct audit lookups).
  if (!teamName) return candidates[0];

  // Team constraint provided: must match scoringTeam exactly.
  // Strict enforcement prevents the same corrupted string from silently
  // resolving to a different player for an unrelated team.
  return candidates.find((e) => e.scoringTeam === teamName);
}

/**
 * Resolve a raw scorer name to its canonical form.
 * Returns the canonical string, or the original rawValue if no alias found.
 */
function resolvePlayerNameLegacy(rawValue: string, teamName?: string): string {
  return findPlayerAliasLegacy(rawValue, teamName)?.canonical ?? rawValue;
}

function contextMatchesEntry(entry: PlayerAliasEntry, context: PlayerAliasResolutionContext): boolean {
  if (entry.provider !== context.provider) return false;
  if (context.scoringTeam && entry.scoringTeam !== context.scoringTeam) return false;
  if (context.playerTeam && entry.playerTeam && entry.playerTeam !== context.playerTeam) return false;
  if (context.matchId && !entry.matchIds.includes(context.matchId)) return false;
  if (entry.eventMinute !== undefined && context.eventMinute !== entry.eventMinute) return false;
  if (
    entry.eventStoppageTime !== undefined &&
    (context.stoppageMinute ?? null) !== entry.eventStoppageTime
  ) {
    return false;
  }
  return true;
}

function rawContextIsComplete(context: PlayerAliasResolutionContext): boolean {
  return Boolean(context.matchId && context.scoringTeam);
}

function providerIdentityMatchesEntry(entry: PlayerAliasEntry, context: PlayerAliasResolutionContext): boolean {
  if (entry.provider !== context.provider) return false;
  if (context.scoringTeam && entry.scoringTeam !== context.scoringTeam) return false;
  if (context.playerTeam && entry.playerTeam && entry.playerTeam !== context.playerTeam) return false;
  if (context.matchId && !entry.matchIds.includes(context.matchId)) return false;
  return true;
}

function findFromProviderId(context: PlayerAliasResolutionContext): PlayerAliasEntry | undefined {
  if (context.providerAthleteId) {
    return _byProviderAthleteId
      .get(context.providerAthleteId)
      ?.find((entry) => providerIdentityMatchesEntry(entry, context));
  }
  if (context.providerPlayerId) {
    return _byProviderPlayerId
      .get(context.providerPlayerId)
      ?.find((entry) => providerIdentityMatchesEntry(entry, context));
  }
  return undefined;
}

export function findPlayerAlias(context: PlayerAliasResolutionContext): PlayerAliasEntry | undefined {
  const fromProviderId = findFromProviderId(context);
  if (fromProviderId) return fromProviderId;

  if (!rawContextIsComplete(context)) return undefined;

  const candidates = _byRaw.get(context.rawName);
  if (!candidates || candidates.length === 0) return undefined;

  const exactEvent = candidates.find((entry) => {
    if (entry.eventMinute === undefined) return false;
    return contextMatchesEntry(entry, context);
  });
  if (exactEvent) return exactEvent;

  return candidates.find((entry) => contextMatchesEntry(entry, context));
}

export function resolvePlayerAlias(context: PlayerAliasResolutionContext): string {
  return findPlayerAlias(context)?.canonical ?? context.rawName;
}
