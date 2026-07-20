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
  publishedAt?: string;
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
  },
  "match-104": {
    matchId: "match-104",
    headline: "Spain Crowned World Champions After Extra Time Thriller Against Argentina",
    dek: "Ferran Torres's 106th-minute strike secured Spain's second World Cup title, defeating ten-man Argentina 1-0 in a tense final at New York New Jersey Stadium.",
    bodySections: [
      {
        title: "A Tense Regulation",
        paragraphs: [
          "The 2026 World Cup Final delivered a fiercely contested battle between two footballing giants. Regulation time saw both Spain and Argentina prioritize defensive solidity, resulting in a scoreless 90 minutes. Spain sought to maintain possession, while Argentina aimed to capitalize on rapid counterattacks. The intensity peaked late in the second half when Argentina's Enzo Fernández received a second yellow card at 90+3', reducing the reigning champions to ten men just before extra time.",
        ]
      },
      {
        title: "Torres Breaks the Deadlock in Extra Time",
        paragraphs: [
          "With the numerical advantage, Spain intensified their pressure in extra time. The decisive moment arrived in the 106th minute when Ferran Torres found the back of the net, breaking the deadlock and sending the Spanish supporters into raptures. The 1-0 lead proved insurmountable for Argentina, as Spain's defense held firm in the remaining minutes to secure the victory.",
        ]
      },
      {
        title: "Tournament Legacy and Awards",
        paragraphs: [
          "The victory marks Spain's second World Cup title, their first since 2010, cementing their status at the pinnacle of world football. Outstanding individual performances were recognized with official tournament awards: Spain's Rodri was awarded the Golden Ball, Unai Simón took the Golden Glove, and Pau Cubarsí was named Best Young Player. France's Kylian Mbappé won the Golden Boot with 10 goals.",
        ]
      }
    ],
    factualHighlights: [
      "Match 104 ended Spain 1–0 Argentina after extra time on July 19, 2026.",
      "Ferran Torres scored the winning goal in the 106th minute.",
      "Argentina's Enzo Fernández was sent off with a second yellow card at 90+3'.",
      "Spain secured their second FIFA World Cup title.",
      "Rodri (Golden Ball), Unai Simón (Golden Glove), and Pau Cubarsí (Best Young Player) claimed official awards."
    ],
    sourceLinks: [
      { label: "ESPN Match Center", url: "https://www.espn.com/soccer/match/_/gameId/760517" },
      { label: "FIFA Official Final Report", url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/match-centre" },
      { label: "FIFA Official Awards", url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/award-winners" }
    ],
    editorIdentity: "WorldCupMatchDay",
    publishedAt: "2026-07-20T08:27:59Z",
    updatedAt: "2026-07-20T08:27:59Z"
  }
};
