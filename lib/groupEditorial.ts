export type GroupEditorial = {
  summary: string;
  keyFixture: string;
  context: string;
};

export const GROUP_EDITORIAL: Record<string, GroupEditorial> = {
  A: {
    summary:
      "Group A opens the 2026 World Cup with Mexico — one of the three co-hosts — taking on South Africa in the tournament's opening match on 11 June at Estadio Azteca. Mexico are the most-watched side in North American football and Santiago Gimenez gives them genuine striking quality. South Korea, led by Son Heung-min, have reached every World Cup since 1986 and will target at least the knockout stage.",
    keyFixture: "Mexico vs South Korea — the battle for Group A's second automatic place.",
    context:
      "Czechia bring consistent European quality from Bundesliga and Serie A-based squads. South Africa's appearance is their first World Cup since they hosted in 2010.",
  },
  B: {
    summary:
      "Group B is the Canadian group — the co-hosts will play at home, headlined by Alphonso Davies, one of Europe's most exciting wide players. Switzerland are the most experienced side in the group with a track record of reaching knockout stages, while Bosnia make their first World Cup appearance since 2014. Canada have never made it beyond the group stage in their only previous World Cup appearance in 1986.",
    keyFixture: "Canada vs Switzerland — the match that will likely decide the group's top two.",
    context:
      "Qatar defend their host-nation 2022 status as the group's fourth side. Canada's home crowd advantage across three host-nation venues should be a significant factor.",
  },
  C: {
    summary:
      "Group C is headlined by Brazil — five-time world champions and among the favourites for 2026 — and Morocco, who made history in 2022 by becoming the first African nation to reach a World Cup semi-final. Scotland are back at a World Cup for the first time since 1998, while Haiti make only their second World Cup appearance. Vinicius Jr leads the Brazilian attack as one of the tournament's most dangerous forwards.",
    keyFixture: "Brazil vs Morocco — the group's defining clash between two of international football's strongest brands.",
    context:
      "Achraf Hakimi gives Morocco elite quality at full-back and in transitions. Scotland's return to the World Cup after a 28-year absence is a significant moment for Scottish football.",
  },
  D: {
    summary:
      "Group D features the United States — co-hosts and one of the tournament's most followed sides — alongside Turkey, Australia and Paraguay in what is arguably the most closely contested group of the 2026 draw. Christian Pulisic leads the American attack on home soil, while Turkey's Arda Guler is one of the tournament's most exciting young talents. Australia reach the World Cup after their historic quarter-final run in 2022.",
    keyFixture: "United States vs Turkey — the group fixture that will attract the largest US audience.",
    context:
      "Paraguay are making their first World Cup appearance since 2010. The United States will play home matches at MetLife Stadium and other major East Coast venues, giving them a significant crowd advantage.",
  },
  E: {
    summary:
      "Group E is Germany's group, and the 2026 tournament represents their most consequential World Cup in years after early exits in 2018 and 2022. Rebuilt around Jamal Musiala, Germany are the clear group favourites. Ivory Coast, with a squad full of elite European club players, are the group's most credible challengers. Ecuador — one of South America's most consistent World Cup qualifiers — and Curaçao complete a group where the final two standings will be fiercely contested.",
    keyFixture: "Germany vs Ivory Coast — the match that should determine the group winner.",
    context:
      "Curaçao are one of the smallest nations by population ever to qualify for the World Cup. Ecuador have qualified for five of the last six tournaments, demonstrating consistent South American competitive strength.",
  },
  F: {
    summary:
      "Group F brings together two strong European sides in Netherlands and Sweden alongside Japan — in their record eighth consecutive World Cup — and Tunisia. Cody Gakpo leads the Dutch attack after his 2022 World Cup breakthrough, and Netherlands are among the teams expected to go deep in the tournament. Japan demonstrated in 2022 that they can beat elite European opposition on their day.",
    keyFixture: "Netherlands vs Japan — a rematch of their 2022 Round of 16 clash, which the Dutch won.",
    context:
      "Sweden are returning to the World Cup after missing both 2018 and 2022. Tunisia have qualified for six World Cups but have never progressed past the group stage.",
  },
  G: {
    summary:
      "Group G pairs Belgium — led by Kevin De Bruyne and featuring one of Europe's deepest squads — with Egypt, whose Mohamed Salah remains one of the world's elite attackers. Belgium have consistently underperformed at major tournaments relative to their talent level and 2026 may represent their last opportunity with this generation. Egypt are making their fourth World Cup appearance, their most recent being a difficult 2018 campaign.",
    keyFixture: "Belgium vs Egypt — a headline fixture featuring De Bruyne and Salah on the same pitch.",
    context:
      "Iran's Mehdi Taremi is one of Asia's finest strikers. New Zealand qualify via the OFC confederation and will be the underdogs, but have shown in friendlies that they can compete against stronger sides.",
  },
  H: {
    summary:
      "Group H features Spain — the reigning European champions after Euro 2024 — alongside Uruguay, Saudi Arabia and Cape Verde. Lamine Yamal, the teenage winger who was the standout player of Euro 2024, is the tournament's most exciting young talent. Uruguay's Federico Valverde and their typically well-organised defensive structure make them the most credible challenger to Spain in this group. Saudi Arabia arrive with high expectations after their stunning 2022 win over Argentina.",
    keyFixture: "Spain vs Uruguay — the group's standout contest between European champions and South American quality.",
    context:
      "Cape Verde are making their first World Cup appearance and are the group's debutants. Salem Al-Dawsari scored one of 2022's most memorable goals for Saudi Arabia and will look to repeat the dose.",
  },
  I: {
    summary:
      "Group I has the clearest hierarchy of any group: France, led by Kylian Mbappé, are one of the tournament's outright favourites and arrive as 2018 world champions. Senegal, with Sadio Mané and one of Africa's best-organised squads, are the continent's strongest qualifier in this group. Norway make their first World Cup appearance since 2002 with Erling Haaland — arguably the world's best striker — leading an ambitious young side.",
    keyFixture: "France vs Norway — the most anticipated group-stage clash of the entire tournament.",
    context:
      "Iraq are making only their second World Cup appearance, having first competed in 1986. France will be heavy favourites to top the group, but Senegal and Norway both carry the quality to cause them a difficult night.",
  },
  J: {
    summary:
      "Group J is Lionel Messi's group — the defending champions Argentina, with Messi potentially making his final World Cup appearance at 38, arrive as joint tournament favourites alongside France. Algeria, led by Riyad Mahrez, are North Africa's most credible threat to the Argentine dominance and will compete hard for second place. Austria bring consistent European quality, while Jordan make a historic first World Cup appearance.",
    keyFixture: "Argentina vs Algeria — the match that will likely decide the group's second automatic qualifier.",
    context:
      "Messi won the World Cup with Argentina in 2022 in what many considered the greatest individual tournament performance in history. Jordan qualify as Asia's fourth team and their debut is a significant milestone for Jordanian football.",
  },
  K: {
    summary:
      "Group K is headlined by Portugal and Cristiano Ronaldo, now 41 at tournament time — his farewell appearance at a World Cup generates extraordinary global attention. Colombia, with James Rodriguez and a squad full of South American talent, make Group K one of the most competitive on paper. DR Congo bring sub-Saharan Africa's largest nation to the World Cup for the first time since 1974, while Uzbekistan are a first-time qualifier.",
    keyFixture: "Portugal vs Colombia — the match that will likely determine the group winner and could eliminate one of the most followed sides early.",
    context:
      "DR Congo, formerly Zaire, last competed in the 1974 World Cup. Uzbekistan are one of Central Asia's fastest-improving footballing nations. Both teams bring intriguing stories to their first or near-first tournament appearances.",
  },
  L: {
    summary:
      "Group L features England — among the tournament favourites and led by Jude Bellingham — alongside Croatia, Ghana and Panama. England are one of the highest-ranked nations in the 2026 draw and will carry enormous pressure given their recent near-misses (2018 semi-finals, Euro 2024 final). Croatia, with Luka Modric approaching the end of his decorated international career, are targeting one more knockout run. The England vs Croatia fixture recalls their 2018 semi-final.",
    keyFixture: "England vs Croatia — a rematch of the 2018 World Cup semi-final, when Croatia eliminated England.",
    context:
      "Ghana are Africa's most experienced side in this group with World Cup history dating to 2006, including a famous 2010 quarter-final run. Panama are making only their second World Cup appearance.",
  },
};
