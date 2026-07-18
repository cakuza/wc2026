export interface MatchEditorialReport {
  matchId: string;
  headline: string;
  dek: string; // summary
  bodySections: Array<{
    title?: string;
    paragraphs: string[];
  }>;
  factualHighlights: string[];
  sourceLinks: Array<{ label: string; url: string }>;
  editorIdentity?: string;
  updatedAt: string; // timestamp
}

export const MATCH_EDITORIAL_REPORTS: Record<string, MatchEditorialReport> = {
  "match-103": {
    matchId: "match-103",
    headline: "England Secure Third Place in Ten-Goal Thriller Against France",
    dek: "In the highest-scoring knockout match in World Cup history, England clinched the third-place playoff with a breathtaking 6–4 victory over France at Miami's Hard Rock Stadium.",
    bodySections: [
      {
        title: "A Tale of Two Halves",
        paragraphs: [
          "The first half belonged entirely to Gareth Southgate's Three Lions. Declan Rice opened the floodgates in the 3rd minute with a fierce strike from outside the box. Ezri Konsa doubled the lead in the 18th minute, nodding home a corner from Rice. With France's defense in disarray, Bukayo Saka scored twice in quick succession—first following a blistering counter-attack in the 37th minute and then slotting in a through ball from Eberechi Eze in first-half stoppage time. England went into the break with a commanding 4–0 lead, appearing to have the match wrapped up.",
        ]
      },
      {
        title: "Deschamps' Bold Changes Spark Comeback",
        paragraphs: [
          "Unwilling to submit, Didier Deschamps made a dramatic quadruple substitution at halftime, introducing Ousmane Dembélé, Bradley Barcola, Lucas Digne, and Dayot Upamecano. The changes transformed Les Bleus. Kylian Mbappé pulled one back in the 48th minute, before halftime substitute Barcola scored another six minutes later to make it 4–2. When Mbappé struck again in the 66th minute to narrow the margin to 4–3, an extraordinary comeback seemed within reach.",
        ]
      },
      {
        title: "Late Drama and Decisive Goals",
        paragraphs: [
          "As France pushed for an equalizer, the match entered a frantic final phase. In the 87th minute, England won a penalty, which Bukayo Saka calmly converted to complete his hat-trick and halt France's momentum. Yet, Les Bleus refused to go quietly. In the 90+6th minute, Dembélé scored following a rapid counter-attack, setting up a grandstand finish at 5–4. However, Jude Bellingham sealed the historic win for England in the 90+8th minute, finishing off another fast break to end the ten-goal spectacle.",
        ]
      },
      {
        title: "Tournament Context and Records",
        paragraphs: [
          "This historic fixture set several records, becoming the highest-scoring bronze-medal match in World Cup history. With the victory, England secured third place, while France finished the tournament in fourth place. Kylian Mbappé's brace took his career World Cup goal tally to 22, cementing his legendary status. This match marked the final game of Didier Deschamps' illustrious tenure as France manager.",
        ]
      }
    ],
    factualHighlights: [
      "Match 103 ended France 4–6 England in regulation time on July 18, 2026.",
      "England led 4–0 at halftime before France's quadruple change sparked a three-goal comeback.",
      "Bukayo Saka completed a hat-trick with an 87th-minute penalty.",
      "Jude Bellingham sealed the victory with a 90+8th minute counter-attack goal.",
      "England secured third place; France finished fourth."
    ],
    sourceLinks: [
      { label: "ESPN Match Center", url: "https://www.espn.com/soccer/match/_/gameId/760516" },
      { label: "FIFA World Cup Official", url: "https://www.fifa.com/en/tournaments/mens/worldcup/2026" }
    ],
    editorIdentity: "WorldCupMatchDay Editorial Team",
    updatedAt: "2026-07-18T23:00:18Z"
  }
};
