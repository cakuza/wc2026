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
    headline: "England Secure Third Place in Ten-Goal Playoff Against France",
    dek: "In the highest-scoring third-place playoff in World Cup history, England clinched third place with a breathtaking 6–4 victory over France at Miami's Hard Rock Stadium.",
    bodySections: [
      {
        title: "A Tale of Two Halves",
        paragraphs: [
          "The first half belonged entirely to Thomas Tuchel's Three Lions. Declan Rice opened the scoring in the 3rd minute with a right-footed shot from outside the box to the bottom right corner. Ezri Konsa doubled the lead in the 18th minute with a header from the center of the box following a corner kick cross from Rice. With France's defense struggling, Bukayo Saka scored twice in quick succession—first following a fast break in the 37th minute and then finishing left-footed from the center of the box after a through ball from Eberechi Eze in first-half stoppage time. England went into the break with a commanding 4–0 lead.",
        ]
      },
      {
        title: "Deschamps' Halftime Changes Spark Response",
        paragraphs: [
          "Hoping to spark a response, Didier Deschamps made a quadruple substitution at halftime, introducing Ousmane Dembélé, Bradley Barcola, Lucas Digne, and Dayot Upamecano. The changes revitalized the French side. Kylian Mbappé pulled one back in the 48th minute with a left-footed shot from the center of the box following a through ball and fast break from Michael Olise. Substitute Barcola scored six minutes later, finishing right-footed from the center of the box after a through ball from Mbappé to make it 4–2. When Mbappé struck again in the 66th minute, assisted by Olise, the margin narrowed to 4–3.",
        ]
      },
      {
        title: "Late Drama and Decisive Goals",
        paragraphs: [
          "The match entered a frantic final phase as both teams pushed forward. In the 87th minute, England won a penalty after Djed Spence drew a foul from Malo Gusto in the penalty area. Bukayo Saka converted the penalty with a left-footed shot to the bottom right corner to complete his hat-trick. In the 90+6th minute, Ousmane Dembélé scored following a rapid fast break, assisted by Dayot Upamecano, making it 5–4. However, Jude Bellingham sealed the 6–4 victory for England in the 90+8th minute, finishing right-footed from the center of the box following a fast break.",
        ]
      },
      {
        title: "Tournament Context and Records",
        paragraphs: [
          "This historic fixture set the record as the highest-scoring third-place playoff in World Cup history. The ten-goal match surpassed the previous record of nine goals set in 1958 when France defeated West Germany 6–3. With the victory, England secured third place, while France finished the tournament in fourth place. Kylian Mbappé's brace took his career World Cup goal tally to 22. This match marked the final game of Didier Deschamps' 14-year tenure as France manager.",
        ]
      }
    ],
    factualHighlights: [
      "Match 103 ended France 4–6 England in regulation time on July 18, 2026.",
      "England led 4–0 at halftime before France's quadruple change sparked a three-goal comeback.",
      "Bukayo Saka completed a hat-trick with an 87th-minute penalty.",
      "Jude Bellingham sealed the victory with a 90+8th minute fast-break goal.",
      "England secured third place; France finished fourth."
    ],
    sourceLinks: [
      { label: "ESPN Match Center", url: "https://www.espn.com/soccer/match/_/gameId/760516" },
      { label: "FIFA World Cup Official", url: "https://www.fifa.com/en/tournaments/mens/worldcup/2026" },
      { label: "The Guardian Live Report", url: "https://www.theguardian.com/football/live/2026/jul/18/france-v-england-world-cup-2026-third-place-playoff-live" }
    ],
    editorIdentity: "WorldCupMatchDay",
    updatedAt: "2026-07-18T23:00:18Z"
  }
};
