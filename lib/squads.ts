// Squad data sourced from the original World Cup project's data/squads.json (Transfermarkt-based).
// Re-keyed to worldcupmatchday team keys. 42 of 48 teams have squads; the rest are added later.
// Available fields only: name, number, position (GK/DEF/MID/FWD), detailedPosition.

export type SquadPosition = "GK" | "DEF" | "MID" | "FWD";

export type SquadPlayer = {
  name: string;
  number: number | null;
  position: SquadPosition;
  detailedPosition?: string;
};

export const SQUADS: Record<string, SquadPlayer[]> = {
  "mexico": [
    {
      "name": "RaÃºl Rangel",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Guillermo Ochoa",
      "number": 13,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Carlos Acevedo",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Jorge SÃ¡nchez",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Israel Reyes",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "CÃ©sar Montes",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Johan VÃ¡squez",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "JesÃºs Gallardo",
      "number": 23,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Mateo ChÃ¡vez",
      "number": 20,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Edson Ãlvarez",
      "number": 4,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Erik Lira",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "OrbelÃ­n Pineda",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Ãlvaro Fidalgo",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Brian GutiÃ©rrez",
      "number": 26,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Luis Romo",
      "number": 7,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Obed Vargas",
      "number": 18,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Gilberto Mora",
      "number": 19,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Luis ChÃ¡vez",
      "number": 24,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Roberto Alvarado",
      "number": 25,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "CÃ©sar Huerta",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Alexis Vega",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "JuliÃ¡n QuiÃ±ones",
      "number": 16,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Guillermo MartÃ­nez",
      "number": 22,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Armando GonzÃ¡lez",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Santiago GimÃ©nez",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "RaÃºl JimÃ©nez",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "southAfrica": [
    {
      "name": "Ronwen Williams",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Ricardo Goss",
      "number": 22,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Sipho Chaine",
      "number": 16,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Aubrey Modiba",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Khuliso Mudau",
      "number": 20,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Khulumani Ndamane",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Kamogelo Sebelebele",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Nkosinathi Sibisi",
      "number": 19,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Bradley Cross",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Samukele Kabini",
      "number": 18,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Olwethu Makhanya",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Thabang Matuludi",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Mbekezeli Mbokazi",
      "number": 14,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Ime Okon",
      "number": 21,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Oswin Appollis",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Thalente Mbatha",
      "number": 5,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Relebohile Mofokeng",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Jayden Adams",
      "number": 23,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Teboho Mokoena",
      "number": 4,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Themba Zwane",
      "number": 11,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Sphephelo Sithole",
      "number": 13,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Evidence Makgopa",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Tshepang Moremi",
      "number": 8,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Lyle Foster",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Thapelo Maseko",
      "number": 12,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Iqraam Rayners",
      "number": 15,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "southKorea": [
    {
      "name": "Song Bumkeun",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Jo Hyeon-woo",
      "number": 21,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Kim Seung-gyu",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Jens Castrop",
      "number": 23,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Lee Hanbeom",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Park Jinseob",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Lee Kihyuk",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Kim Min-jae",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Kim Moonhwan",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Kim Taehyeon",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Lee Taeseok",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Seol Young-woo",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Cho Wije",
      "number": 14,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Lee Donggyeong",
      "number": 26,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Hwang Hee-chan",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Yang Hyunjun",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Hwang In-beom",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Lee Jaesung",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Kim Jingyu",
      "number": 24,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Eom Jisung",
      "number": 25,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Bae Junho",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Lee Kang-in",
      "number": 19,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Paik Seungho",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Cho Gue-sung",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Son Heung-min",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Forward"
    },
    {
      "name": "Oh Hyeon-gyu",
      "number": 18,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "czechia": [
    {
      "name": "LukÃ¡Å¡ HornÃ­Äek",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "MatÄ›j KovÃ¡Å™",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "JindÅ™ich StÃ¡nek",
      "number": 16,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "VladimÃ­r Coufal",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "David Doudera",
      "number": 21,
      "position": "MID",
      "detailedPosition": "Right Midfield"
    },
    {
      "name": "TomÃ¡Å¡ HoleÅ¡",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Robin HranÃ¡Ä",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Å tÄ›pÃ¡n Chaloupek",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "David JurÃ¡sek",
      "number": 14,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Ladislav KrejÄÃ­",
      "number": 7,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jaroslav Zeleny",
      "number": 20,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "David Zima",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Lukas Cerv",
      "number": 12,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "VladimÃ­r Darida",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "LukÃ¡Å¡ Provod",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Michal SadÃ­lek",
      "number": 18,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Hugo Sochurek",
      "number": 25,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Alexandr Sojka",
      "number": 24,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "TomÃ¡Å¡ SouÄek",
      "number": 22,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Pavel Å ulc",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Denis Visinsky",
      "number": 26,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Adam HloÅ¾ek",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "TomÃ¡Å¡ ChorÃ½",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "MojmÃ­r Chytil",
      "number": 13,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Jan Kuchta",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Patrik Schick",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "morocco": [
    {
      "name": "Yassine Bounou",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Munir El Kajoui",
      "number": null,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Ahmed Reda Tagnaouti",
      "number": 22,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Noussair Mazraoui",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Anas Salah-Eddine",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Youssef Bellammari",
      "number": 19,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Achraf Hakimi",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Zakaria El Ouahdi",
      "number": 13,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Nayef Aguerd",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Chadi Riad",
      "number": 18,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Redouane Halhal",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Issa Diop",
      "number": 14,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Samir El Mourabet",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Ayoub Bouaddi",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Neil El Aynaoui",
      "number": 24,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Sofyan Amrabat",
      "number": 4,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Azzedine Ounahi",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Bilal El Khannouss",
      "number": 23,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Ismael Saibari",
      "number": 11,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Abdesamad Ezzalzouli",
      "number": null,
      "position": "FWD"
    },
    {
      "name": "Chemsdine Talbi",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Soufiane Rahimi",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Ayoub El Kaabi",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Brahim DÃ­az",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Yassine Gessim",
      "number": null,
      "position": "FWD"
    },
    {
      "name": "Ayoube Amaimouni-Echghouyab",
      "number": null,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    }
  ],
  "canada": [
    {
      "name": "Dayne St Clair",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Maxime Crepeau",
      "number": 16,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Owen Goodman",
      "number": 18,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Alistair Johnston",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Derek Cornelius",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Richie Laryea",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Niko Sigur",
      "number": 23,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Joel Waterman",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Luc de Fougerolles",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Moise Bombito",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Alphonso Davies",
      "number": 19,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Alfie Jones",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Stephen Eustaquio",
      "number": 7,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Ismael Kone",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Tajon Buchanan",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Mathieu Choiniere",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Ali Ahmed",
      "number": 20,
      "position": "MID",
      "detailedPosition": "Left Midfield"
    },
    {
      "name": "Nathan Saliba",
      "number": 25,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Liam Millar",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Jacob Shaffelburg",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Jonathan Osorio",
      "number": 21,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Jonathan David",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Cyle Larin",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Tani Oluwaseyi",
      "number": 12,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Promise David",
      "number": 24,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "bosnia": [
    {
      "name": "Nikola Vasilj",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Martin Zlomislic",
      "number": 22,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Osman HadÅ¾ikiÄ‡",
      "number": null,
      "position": "GK"
    },
    {
      "name": "Sead KolaÅ¡inac",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Amar Dedic",
      "number": 7,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Nihad Mujakic",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Nikola Katic",
      "number": 18,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Tarik Muharemovic",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Stjepan Radeljic",
      "number": 21,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Dennis HadÅ¾ikaduniÄ‡",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Nidal Celik",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Amir HadÅ¾iahmetoviÄ‡",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Ivan Å unjiÄ‡",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Ivan Basic",
      "number": 13,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "DÅ¾enis BurniÄ‡",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Ermin MahmiÄ‡",
      "number": 26,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Benjamin Tahirovic",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Amar MemiÄ‡",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Right Midfield"
    },
    {
      "name": "Armin GigoviÄ‡",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Kerim AlajbegoviÄ‡",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Esmir BajraktareviÄ‡",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Ermedin DemiroviÄ‡",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Jovo Lukic",
      "number": 25,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Samed Bazdar",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Haris TabakoviÄ‡",
      "number": 23,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Edin DÅ¾eko",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "switzerland": [
    {
      "name": "Marvin Keller",
      "number": 21,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Gregor Kobel",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Yvon Mvogo",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Manuel Akanji",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Aurele Amenda",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Eray CÃ¶mert",
      "number": 18,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Nico Elvedi",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Luca Jaquez",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Miro Muheim",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Ricardo RodrÃ­guez",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Silvan Widmer",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Michel Aebischer",
      "number": 20,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Christian Fassnacht",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Remo Freuler",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Ardon Jashari",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Fabian Rieder",
      "number": 22,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Djibril Sow",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Cedric Itten",
      "number": 26,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Granit Xhaka",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Denis Zakaria",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Ruben Vargas",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Zeki Amdouni",
      "number": 23,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Breel Embolo",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Dan Ndoye",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Noah Okafor",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Johan Manzambi",
      "number": 9,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    }
  ],
  "brazil": [
    {
      "name": "Alisson",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Ederson",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Weverton",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Alex Sandro",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Bremer",
      "number": 14,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Danilo",
      "number": 13,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Douglas Santos",
      "number": 16,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Gabriel MagalhÃ£es",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Ibanez",
      "number": null,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Leo Pereira",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Marquinhos",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Wesley",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Bruno GuimarÃ£es",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Casemiro",
      "number": 5,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Danilo Santos",
      "number": 18,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Fabinho",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Lucas PaquetÃ¡",
      "number": 20,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Endrick",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Gabriel Martinelli",
      "number": 22,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Igor Thiago",
      "number": 25,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Luiz Henrique",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Matheus Cunha",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Neymar Jr",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Raphinha",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Rayan",
      "number": 26,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "VinÃ­cius JÃºnior",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    }
  ],
  "uruguay": [
    {
      "name": "Sergio Rochet",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Fernando Muslera",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Santiago Mele",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Guillermo Varela",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Ronald AraÃºjo",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "JosÃ© MarÃ­a GimÃ©nez",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Santiago Bueno",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "SebastiÃ¡n CÃ¡ceres",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "MathÃ­as Olivera",
      "number": 16,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "JoaquÃ­n Piquerez",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "MatÃ­as ViÃ±a",
      "number": 17,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Maximiliano AraÃºjo",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Giorgian de Arrascaeta",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Rodrigo Bentancur",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "AgustÃ­n Canobbio",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "NicolÃ¡s de la Cruz",
      "number": 7,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Emiliano MartÃ­nez",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Facundo Pellistri",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Brian RodrÃ­guez",
      "number": 18,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Juan Manuel Sanabria",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Manuel Ugarte",
      "number": 5,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Federico Valverde",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Rodrigo Zalazar",
      "number": 26,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Rodrigo Aguirre",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Federico ViÃ±as",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Darwin NÃºÃ±ez",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "colombia": [
    {
      "name": "Camilo Vargas",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Ãlvaro Montero",
      "number": 24,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "David Ospina",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Davinson SÃ¡nchez",
      "number": 23,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jhon LucumÃ­",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Yerry Mina",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Willer Ditta",
      "number": 18,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Daniel MuÃ±oz",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Santiago Arias",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Johan Mojica",
      "number": 17,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Deiver Machado",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Richard Rios",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Jefferson Lerma",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Kevin CastaÃ±o",
      "number": 5,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Juan Camilo Portilla",
      "number": null,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Gustavo Puerta",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Jhon Arias",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Jorge Carrascal",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Juan Fernando Quintero",
      "number": 20,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "James RodrÃ­guez",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Jaminton Campaz",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Juan Camilo HernÃ¡ndez",
      "number": null,
      "position": "FWD"
    },
    {
      "name": "Luis DÃ­az",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Luis SuÃ¡rez",
      "number": 25,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Carlos GÃ³mez",
      "number": null,
      "position": "FWD"
    },
    {
      "name": "Jhon CÃ³rdoba",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "turkey": [
    {
      "name": "Altay BayÄ±ndÄ±r",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Mert GÃ¼nok",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "UÄŸurcan Ã‡akÄ±r",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "AbdÃ¼lkerim BardakcÄ±",
      "number": 14,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Ã‡aÄŸlar SÃ¶yÃ¼ncÃ¼",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Eren ElmalÄ±",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Ferdi KadÄ±oÄŸlu",
      "number": 20,
      "position": "DEF",
      "detailedPosition": "Full-Back"
    },
    {
      "name": "Merih Demiral",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Mert MÃ¼ldÃ¼r",
      "number": 18,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Ozan Kabak",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Samet AkaydÄ±n",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Zeki Ã‡elik",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Hakan Ã‡alhanoÄŸlu",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Ä°smail YÃ¼ksek",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Kaan Ayhan",
      "number": 22,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Orkun KÃ¶kcÃ¼",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Salih Ã–zcan",
      "number": 5,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Arda GÃ¼ler",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "BarÄ±ÅŸ Alper YÄ±lmaz",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Can Uzun",
      "number": 26,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Deniz GÃ¼l",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Ä°rfan Can Kahveci",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Kenan YÄ±ldÄ±z",
      "number": 11,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Kerem AktÃ¼rkoÄŸlu",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "OÄŸuz AydÄ±n",
      "number": 24,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Yunus AkgÃ¼n",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    }
  ],
  "unitedStates": [
    {
      "name": "Chris Brady",
      "number": 25,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Matt Freese",
      "number": 24,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Matt Turner",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Max Arfsten",
      "number": null,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Sergino Dest",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Alex Freeman",
      "number": 16,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Mark McKenzie",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Tim Ream",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Chris Richards",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Antonee Robinson",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Miles Robinson",
      "number": 12,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Joe Scally",
      "number": 23,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Auston Trusty",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Tyler Adams",
      "number": 4,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Sebastian Berhalter",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Weston McKennie",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Cristian Roldan",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Brenden Aaronson",
      "number": 11,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Christian Pulisic",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Gio Reyna",
      "number": null,
      "position": "MID"
    },
    {
      "name": "Malik Tillman",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Tim Weah",
      "number": null,
      "position": "MID"
    },
    {
      "name": "Alejandro Zendejas",
      "number": 26,
      "position": "FWD",
      "detailedPosition": "Winger"
    },
    {
      "name": "Folarin Balogun",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Ricardo Pepi",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Haji Wright",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "australia": [
    {
      "name": "Patrick Beach",
      "number": 18,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Paul Izzo",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Mathew Ryan",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Aziz Behich",
      "number": 16,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Jordan Bos",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Cameron Burgess",
      "number": 21,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Alessandro Circati",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Milos Degenek",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jason Geria",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Lucas Herrington",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jacob Italiano",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Harry Souttar",
      "number": 19,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Kai Trewin",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Cameron Devlin",
      "number": null,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Ajdin Hrustic",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Jackson Irvine",
      "number": 22,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Connor Metcalfe",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Aiden O'Neill",
      "number": 13,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Paul Okon-Engstler",
      "number": 24,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Nestory Irankunda",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Mathew Leckie",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Awer Mabil",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Mohamed Toure",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Nishan Velupillay",
      "number": 23,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Cristian Volpato",
      "number": 20,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Tete Yengi",
      "number": 26,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "paraguay": [
    {
      "name": "Orlando Gill",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Roberto FernÃ¡ndez",
      "number": null,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "GastÃ³n Olveira",
      "number": 22,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Juan CÃ¡ceres",
      "number": null,
      "position": "DEF"
    },
    {
      "name": "Gustavo VelÃ¡zquez",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Gustavo GÃ³mez",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Junior Alonso",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "JosÃ© Canale",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Omar Alderete",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Alexandro Maidana",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "FabiÃ¡n Balbuena",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Diego GÃ³mez",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Mauricio MagalhÃ£es",
      "number": null,
      "position": "MID"
    },
    {
      "name": "DamiÃ¡n Bobadilla",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Braian Ojeda",
      "number": 20,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "AndrÃ©s Cubas",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "MatÃ­as Galarza",
      "number": 23,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Alejandro Gamarra",
      "number": null,
      "position": "MID"
    },
    {
      "name": "Gustavo Caballero",
      "number": 24,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "RamÃ³n Sosa",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Alex Arce",
      "number": 18,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Isidro Pitta",
      "number": 25,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Gabriel Ãvalos",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Miguel AlmirÃ³n",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Julio Enciso",
      "number": 19,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Antonio Sanabria",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "germany": [
    {
      "name": "Manuel Neuer",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Oliver Baumann",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Alexander NÃ¼bel",
      "number": 21,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Nico Schlotterbeck",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "David Raum",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Nathaniel Brown",
      "number": 18,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Jonathan Tah",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Waldemar Anton",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Joshua Kimmich",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Malick Thiaw",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Antonio RÃ¼diger",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Pascal Gross",
      "number": 13,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Leon Goretzka",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Felix Nmecha",
      "number": 23,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Jamal Musiala",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Nadiem Amiri",
      "number": 20,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Jamie Leweling",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Lennart Karl",
      "number": 25,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Florian Wirtz",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Leroy SanÃ©",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Aleksandar Pavlovic",
      "number": 5,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Angelo Stiller",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Kai Havertz",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Nick Woltemade",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Deniz Undav",
      "number": 26,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Maximilian Beier",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "curacao": [
    {
      "name": "Tyrick Bodack",
      "number": 25,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Trevor Doornbusch",
      "number": 26,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Eloy Room",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Riechedly Bazoer",
      "number": 23,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Joshua Brenet",
      "number": 20,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Roshon van Eijma",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Sherel Floranus",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Deveron Fonville",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jurien Gaari",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Armando Obispo",
      "number": 18,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Shurandy Sambo",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Juninho Bacuna",
      "number": 7,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Leandro Bacuna",
      "number": 10,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Livano Comenencia",
      "number": 8,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Kevin Felida",
      "number": 22,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Ar'jany Martha",
      "number": 15,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Tyrese Noslin",
      "number": 13,
      "position": "MID",
      "detailedPosition": "Right Midfield"
    },
    {
      "name": "Godfried Roemeratoe",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Jeremy Antonisse",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Tahith Chong",
      "number": 21,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Kenji Gorre",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Sontje Hansen",
      "number": 12,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Gervane Kastaneer",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Brandley Kuwas",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Jurgen Locadia",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Jearl Margaritha",
      "number": 16,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    }
  ],
  "belgium": [
    {
      "name": "Thibaut Courtois",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Senne Lammens",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Mike Penders",
      "number": 13,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Timothy Castagne",
      "number": 21,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Zeno Debast",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Maxim De Cuyper",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Koni De Winter",
      "number": 16,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Brandon Mechele",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Thomas Meunier",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Nathan Ngoy",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Joaquin Seys",
      "number": 18,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Arthur ThÃ©ate",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Kevin De Bruyne",
      "number": 7,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Amadou Onana",
      "number": 24,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Nicolas Raskin",
      "number": 23,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Youri Tielemans",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Hans Vanaken",
      "number": 20,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Axel Witsel",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Charles De Ketelaere",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "JÃ©rÃ©my Doku",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Matias Fernandez-Pardo",
      "number": 26,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Romelu Lukaku",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Dodi Lukebakio",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Diego Moreira",
      "number": 19,
      "position": "MID",
      "detailedPosition": "Left Midfield"
    },
    {
      "name": "Alexis Saelemaekers",
      "number": 22,
      "position": "MID",
      "detailedPosition": "Right Midfield"
    },
    {
      "name": "Leandro Trossard",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    }
  ],
  "netherlands": [
    {
      "name": "Mark Flekken",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Robin Roefs",
      "number": 13,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Bart Verbruggen",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Nathan AkÃ©",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Virgil van Dijk",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Denzel Dumfries",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Jan Paul van Hecke",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "JurriÃ«n Timber",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jorrel Hato",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Micky van de Ven",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Ryan Gravenberch",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Frenkie de Jong",
      "number": 21,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Teun Koopmeiners",
      "number": 20,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Tijjani Reijnders",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Marten de Roon",
      "number": 3,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Guus Til",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Quinten Timber",
      "number": 26,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Mats Wieffer",
      "number": 12,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Brian Brobbey",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Memphis Depay",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Cody Gakpo",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Noa Lang",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Donyell Malen",
      "number": 18,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Crysencio Summerville",
      "number": 24,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Wout Weghorst",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Justin Kluivert",
      "number": 7,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    }
  ],
  "scotland": [
    {
      "name": "Craig Gordon",
      "number": 21,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Angus Gunn",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Liam Kelly",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Grant Hanley",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jack Hendry",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Aaron Hickey",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Dom Hyam",
      "number": null,
      "position": "DEF"
    },
    {
      "name": "Scott McKenna",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Nathan Patterson",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Anthony Ralston",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Andy Robertson",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "John Souttar",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Kieran Tierney",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Ryan Christie",
      "number": 11,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Findlay Curtis",
      "number": 25,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Lewis Ferguson",
      "number": 19,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Tyler Fletcher",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Ben Gannon-Doak",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "John McGinn",
      "number": 7,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Kenny McLean",
      "number": 23,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Scott McTominay",
      "number": 4,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Che Adams",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Lyndon Dykes",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "George Hirst",
      "number": 18,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Lawrence Shankland",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Ross Stewart",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "norway": [
    {
      "name": "Ã˜rjan Haskjold Nyland",
      "number": null,
      "position": "GK"
    },
    {
      "name": "Egil Selvik",
      "number": 13,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Sander Tangvik",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Kristoffer Vassbakk Ajer",
      "number": null,
      "position": "DEF"
    },
    {
      "name": "Fredrik BjÃ¸rkan",
      "number": null,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Henrik Falchener",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Sondre Langas",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "TorbjÃ¸rn Heggem",
      "number": 17,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Marcus Holmgren Pedersen",
      "number": 16,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Julian Ryerson",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "David Moller Wolfe",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Leo Ã˜stigÃ¥rd",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Thelonious Aasgaard",
      "number": null,
      "position": "MID"
    },
    {
      "name": "Fredrik Aursnes",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Patrick Berg",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Sander Berge",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Oscar Bobb",
      "number": 22,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Jens Petter Hauge",
      "number": 23,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Antonio Nusa",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Andreas Schjelderup",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Morten Thorsby",
      "number": 2,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Kristian Thorstvedt",
      "number": 18,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Martin Ã˜degaard",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Erling Haaland",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Alexander SÃ¸rloth",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "JÃ¸rgen Strand Larsen",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "egypt": [
    {
      "name": "Mohamed El Shenawy",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Mostafa Shobeir",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "El Mahdy Soliman",
      "number": 16,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Mohamed Alaa",
      "number": 26,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Mohamed Abdelmonem",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Mohamed Hany",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Yasser Ibrahim",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Hossam Abdelmaguid",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Ahmed Fattouh",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Tarek Alaa",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Rami Rabia",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Karim Hafez",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Marwan Attia",
      "number": 19,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Ahmed Sayed Zizo",
      "number": null,
      "position": "MID"
    },
    {
      "name": "Mahmoud Hassan Trezeguet",
      "number": null,
      "position": "MID"
    },
    {
      "name": "Emam Ashour",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Mostafa Abdel Raouf",
      "number": null,
      "position": "MID"
    },
    {
      "name": "Mohannad Lasheen",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Haitham Hassan",
      "number": null,
      "position": "MID"
    },
    {
      "name": "Mahmoud Saber",
      "number": 21,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Ibrahim Adel",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Nabil Emad",
      "number": 18,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Hamdi Fathi",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Mohamed Salah",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Omar Marmoush",
      "number": 22,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Hamza Abdel Karim",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "japan": [
    {
      "name": "Tomoki Hayakawa",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Keisuke Osako",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Zion Suzuki",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Ko Itakura",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Hiroki Ito",
      "number": 21,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Yuto Nagatomo",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Ayumu Seko",
      "number": 20,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Yukinari Sugawara",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Junnosuke Suzuki",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Shogo Taniguchi",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Takehiro Tomiyasu",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Tsuyoshi Watanabe",
      "number": 16,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Ritsu Doan",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Wataru EndÅ",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Junya Ito",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Daichi Kamada",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Takefusa Kubo",
      "number": 8,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Keito Nakamura",
      "number": 13,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Kaishu Sano",
      "number": 24,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Ao Tanaka",
      "number": 7,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Keisuke Goto",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Daizen Maeda",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Koki Ogawa",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Kento Shiogai",
      "number": 26,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Yuito Suzuki",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Ayase Ueda",
      "number": 18,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "ecuador": [
    {
      "name": "HernÃ¡n GalÃ­ndez",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "MoisÃ©s RamÃ­rez",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Gonzalo Valle",
      "number": 22,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Piero HincapiÃ©",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Willian Pacho",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Pervis EstupiÃ±Ã¡n",
      "number": 7,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "FÃ©lix Torres",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Joel OrdÃ³Ã±ez",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jackson Porozo",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Ãngelo Preciado",
      "number": 17,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Yaimar Medina",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "MoisÃ©s Caicedo",
      "number": 23,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Alan Franco",
      "number": 21,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Kendry PÃ¡ez",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Gonzalo Plata",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Pedro Vite",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Jordy AlcÃ­var",
      "number": 5,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Denil Castillo",
      "number": 18,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "John Yeboah",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Nilson Angulo",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Alan Minda",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Ã‰nner Valencia",
      "number": 13,
      "position": "FWD",
      "detailedPosition": "Forward"
    },
    {
      "name": "Kevin RodrÃ­guez",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Jordy Caicedo",
      "number": 16,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Anthony Valencia",
      "number": 8,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "JÃ©rÃ©my ArÃ©valo",
      "number": 24,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "spain": [
    {
      "name": "Unai SimÃ³n",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "David Raya",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Joan Garcia",
      "number": 13,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Marc Cucurella",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Pau CubarsÃ­",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Aymeric Laporte",
      "number": 14,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Alejandro Grimaldo",
      "number": null,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Pedro Porro",
      "number": 12,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Eric Garcia",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Marcos Llorente",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Marc Pubill",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Gavi",
      "number": 9,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Rodri",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Pedri",
      "number": 20,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Martin Zubimendi",
      "number": 18,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "FabiÃ¡n Ruiz",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Alex Baena",
      "number": 15,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Mikel Merino",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Lamine Yamal",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Nico Williams",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Dani Olmo",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Ferran Torres",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Mikel Oyarzabal",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Yeremy Pino",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Borja Iglesias",
      "number": 26,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "VÃ­ctor MuÃ±oz",
      "number": 25,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    }
  ],
  "capeVerde": [
    {
      "name": "CJ dos Santos",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Marcio Rosa",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Vozinha",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Sidny Cabral",
      "number": null,
      "position": "DEF"
    },
    {
      "name": "Diney Borges",
      "number": null,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Logan Costa",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Roberto Lopes",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Steven Moreira",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Wagner Pina",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Kelvin Pires",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Joao Paulo Fernandes",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Ianique Tavares",
      "number": null,
      "position": "DEF"
    },
    {
      "name": "Telmo Arcanjo",
      "number": 18,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Deroy Duarte",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Laros Duarte",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Jamiro Monteiro",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Kevin Pina",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Yannick Semedo",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Gilson Benchimol",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Jovane Cabral",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Dailon Livramento",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Ryan Mendes",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Winger"
    },
    {
      "name": "Nuno da Costa",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Garry Rodrigues",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Willy Semedo",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Helio Varela",
      "number": 26,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    }
  ],
  "ivoryCoast": [
    {
      "name": "Yahia Fofana",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Mohamed Kone",
      "number": 16,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Alban Lafont",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Emmanuel Agbadou",
      "number": 20,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Christopher Operi",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Ousmane Diomande",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Guela Doue",
      "number": 17,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Ghislain Konan",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Odilon Kossounou",
      "number": 7,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Wilfried Singo",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Evan Ndicka",
      "number": 21,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Seko Fofana",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Parfait Guiagon",
      "number": 25,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Christ Inao Oulai",
      "number": 26,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Franck KessiÃ©",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Ibrahim Sangare",
      "number": 18,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Jean-MichaÃ«l SÃ©ri",
      "number": 4,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Simon Adingra",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Ange-Yoan Bonny",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Amad Diallo",
      "number": 15,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Oumar DiakitÃ©",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Yan Diomande",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Evann Guessand",
      "number": 22,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Nicolas PÃ©pÃ©",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Bazoumana Toure",
      "number": 24,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Elye Wahi",
      "number": 12,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "iran": [
    {
      "name": "Alireza Beiranvand",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Seyed Hossein Hosseini",
      "number": null,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Payam Niazmand",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Danial Eiri",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Ehsan Hajsafi",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Saleh Hardani",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Hossein Kanaani",
      "number": null,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Shoja Khalilzadeh",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Milad Mohammadi",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Ali Nemati",
      "number": 19,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Ramin Rezaeian",
      "number": 23,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Rouzbeh Cheshmi",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Saeid Ezatolahi",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Mehdi Ghaedi",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Saman Ghoddos",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Mohammad Ghorbani",
      "number": 21,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Alireza Jahanbakhsh",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Mohammad Mohebi",
      "number": 8,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Amir Mohammad Razzaghinia",
      "number": 26,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Mehdi Torabi",
      "number": 16,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Aria Yousefi",
      "number": 17,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Ali Alipour",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Dennis Dargahi",
      "number": null,
      "position": "FWD"
    },
    {
      "name": "Amirhossein Hosseinzadeh",
      "number": 18,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Mehdi Taremi",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Shahriar Moghanlou",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "france": [
    {
      "name": "Mike Maignan",
      "number": 16,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Robin Risser",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Brice Samba",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Lucas Digne",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Malo Gusto",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Lucas Hernandez",
      "number": 21,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "ThÃ©o Hernandez",
      "number": 19,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Ibrahima KonatÃ©",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Maxence Lacroix",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jules KoundÃ©",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "William Saliba",
      "number": 17,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Dayot Upamecano",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "N'Golo KantÃ©",
      "number": 13,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Manu Kone",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Adrien Rabiot",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "AurÃ©lien TchouamÃ©ni",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Warren Zaire-Emery",
      "number": 18,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Maghnes Akliouche",
      "number": 25,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Bradley Barcola",
      "number": 12,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Rayan Cherki",
      "number": 24,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Ousmane DembÃ©lÃ©",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "DÃ©sirÃ© DouÃ©",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Michael Olise",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Kylian MbappÃ©",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Jean-Philippe Mateta",
      "number": 22,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Marcus Thuram",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "senegal": [
    {
      "name": "Ã‰douard Mendy",
      "number": 16,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Mory Diaw",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Yehvann Diouf",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Krepin Diatta",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Right Midfield"
    },
    {
      "name": "Antoine Mendy",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Kalidou Koulibaly",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "El Hadji Malick Diouf",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Mamadou Sarr",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Moussa Niakhate",
      "number": 19,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Abdoulaye Seck",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Ismail Jakobs",
      "number": 14,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Idrissa Gana Gueye",
      "number": null,
      "position": "MID"
    },
    {
      "name": "Pape GuÃ¨ye",
      "number": 26,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Lamine Camara",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Habib Diarra",
      "number": 21,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Pathe Ciss",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Pape Matar Sarr",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Bara Sapoko Ndiaye",
      "number": 22,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Sadio ManÃ©",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "IsmaÃ¯la Sarr",
      "number": 18,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Iliman Ndiaye",
      "number": 13,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Assane Diao",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Ibrahim Mbaye",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Nicolas Jackson",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Bamba Dieng",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Cherif Ndiaye",
      "number": 12,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "saudiArabia": [
    {
      "name": "Nawaf Al Aqidi",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Mohamed Al Owais",
      "number": 21,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Ahmed Alkassar",
      "number": 22,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Saud Abdulhamid",
      "number": 12,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Jehad Thakri",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Abdulelah Al Amri",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Hassan Tambakti",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Ali Lajami",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Hassan Kadesh",
      "number": 14,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Moteb Al Harbi",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Nawaf Boushal",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Ali Majrashi",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Mohammed Abu Alshamat",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Ziyad Al Johani",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Nasser Al Dawsari",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Mohamed Kanno",
      "number": 23,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Abdullah Al Khaibari",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Alaa Al Hejji",
      "number": 18,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Musab Al Juwayr",
      "number": 7,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Sultan Mandash",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Ayman Yahya",
      "number": 8,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Khalid Al Ghannam",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Salem Al Dawsari",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Abdullah Al Hamdan",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Feras Al Brikan",
      "number": null,
      "position": "FWD"
    },
    {
      "name": "Saleh Al Shehri",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "qatar": [
    {
      "name": "Salah Zakaria",
      "number": 21,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Meshaal Barsham",
      "number": 22,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Mahmoud Abunada",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Boualem Khoukhi",
      "number": 16,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Pedro Miguel",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Sultan Al Brake",
      "number": 18,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Al Hashmi Al Hussain",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Ayoub Al Alawi",
      "number": null,
      "position": "DEF"
    },
    {
      "name": "Issa Laye",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Lucas Mendes",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Homam Al Amin",
      "number": null,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Ahmed Fathi",
      "number": 20,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Jassim Gaber",
      "number": 5,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Assim Madibo",
      "number": 23,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Abdulaziz Hatem",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Karim Boudiaf",
      "number": 12,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Mohammed Mannai",
      "number": 26,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Almoez Ali",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Akram Afif",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Tahsin Mohammed",
      "number": null,
      "position": "FWD"
    },
    {
      "name": "Edmilson Junior",
      "number": 8,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Ahmed Al-Janehi",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Ahmed Alaa",
      "number": null,
      "position": "FWD"
    },
    {
      "name": "Hassan Al Haydos",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Forward"
    },
    {
      "name": "Mohammed Muntari",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Yusuf Abdurisag",
      "number": 15,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    }
  ],
  "argentina": [
    {
      "name": "Emiliano MartÃ­nez",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "GerÃ³nimo Rulli",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Juan Musso",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Leonardo Balerdi",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Gonzalo Montiel",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "NicolÃ¡s Tagliafico",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Lisandro MartÃ­nez",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Cristian Romero",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "NicolÃ¡s Otamendi",
      "number": 19,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Facundo Medina",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Nahuel Molina",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Leandro Paredes",
      "number": 5,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Rodrigo De Paul",
      "number": 7,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "ValentÃ­n Barco",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Giovani Lo Celso",
      "number": 11,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Exequiel Palacios",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Alexis Mac Allister",
      "number": 20,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Enzo FernÃ¡ndez",
      "number": 24,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "JuliÃ¡n Ãlvarez",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Lionel Messi",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "NicolÃ¡s GonzÃ¡lez",
      "number": 15,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Thiago Almada",
      "number": 16,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Giuliano Simeone",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "NicolÃ¡s Paz",
      "number": null,
      "position": "FWD"
    },
    {
      "name": "JosÃ© Manuel LÃ³pez",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Lautaro MartÃ­nez",
      "number": 22,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "algeria": [
    {
      "name": "Oussama Benbot",
      "number": 16,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Melvin Masstil",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Luca Zidane",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Achraf Abada",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Rayan Ait Nouri",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Zinedine Belaid",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Rafik Belghali",
      "number": 17,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Ramy Bensebaini",
      "number": 21,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Samir Chergui",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jaouen Hadjam",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Aissa Mandi",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Mohamed Amine Tougai",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Houssem Aouar",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Nabil Bentaleb",
      "number": 19,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Hicham Boudaoui",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Fares Chaibi",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Ibrahim Maza",
      "number": 22,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Yassine Titraoui",
      "number": 24,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Ramiz Zerrouki",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Mohamed Amine Amoura",
      "number": null,
      "position": "FWD"
    },
    {
      "name": "Nadir Benbouali",
      "number": 12,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Adil Boulbina",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Fares Ghedjemis",
      "number": 25,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Amine Gouiri",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Riyad Mahrez",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Anis Hadj Moussa",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    }
  ],
  "uzbekistan": [
    {
      "name": "Botirali Ergashev",
      "number": 16,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Abduvohid Nematov",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Utkir Yusupov",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Abdukodir Khusanov",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Khojiakbar Alijonov",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Rustamjon Ashurmatov",
      "number": null,
      "position": "DEF"
    },
    {
      "name": "Farrukh Sayfiev",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Sherzod Nasrullaev",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Umarbek Eshmuradov",
      "number": null,
      "position": "DEF"
    },
    {
      "name": "Avazbek Ulmasaliev",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jakhongir Urozov",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Bekhruz Karimov",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Abdulla Abdullaev",
      "number": 18,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Akmal Mozgovoy",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Otabek Shukurov",
      "number": 7,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Jamshid Iskanderov",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Odiljon Hamrobekov",
      "number": 9,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Jaloliddin Masharipov",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Azizbek Ganiev",
      "number": null,
      "position": "MID"
    },
    {
      "name": "Sherzod Esanov",
      "number": 23,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Abbosbek Fayzullaev",
      "number": 22,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Azizbek Amonov",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Eldor Shomurodov",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Igor Sergeev",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Oston Urunov",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Dostonbek Hamdamov",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    }
  ],
  "newZealand": [
    {
      "name": "Max Crocombe",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Alex Paulsen",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Michael Woud",
      "number": 22,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Tyler Bindon",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Michael Boxall",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Liberato Cacace",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Francis de Vries",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Callan Elliot",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Tim Payne",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Nando Pijnaker",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Tommy Smith",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Finn Surman",
      "number": 16,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Lachlan Bayliss",
      "number": 25,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Joe Bell",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Matt Garbett",
      "number": null,
      "position": "MID"
    },
    {
      "name": "Eli Just",
      "number": null,
      "position": "MID"
    },
    {
      "name": "Callum McCowatt",
      "number": 20,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Ben Old",
      "number": 19,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Alex Rufer",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Marko Stamenic",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Sarpreet Singh",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Ryan Thomas",
      "number": 23,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Kosta Barbarouses",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Jesse Randall",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Ben Waine",
      "number": 18,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Chris Wood",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "portugal": [
    {
      "name": "Diogo Costa",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "JosÃ© SÃ¡",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Rui Silva",
      "number": 22,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "TomÃ¡s AraÃºjo",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "JoÃ£o Cancelo",
      "number": 20,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Diogo Dalot",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "RÃºben Dias",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "GonÃ§alo InÃ¡cio",
      "number": 14,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Nuno Mendes",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Matheus Nunes",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Nelson Semedo",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Renato Veiga",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Samuel Costa",
      "number": 24,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Bruno Fernandes",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "JoÃ£o Neves",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "RÃºben Neves",
      "number": 21,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Bernardo Silva",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Vitinha",
      "number": 23,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Francisco ConceiÃ§Ã£o",
      "number": 26,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "JoÃ£o FÃ©lix",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "GonÃ§alo Guedes",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Rafael LeÃ£o",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Pedro Neto",
      "number": 18,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "GonÃ§alo Ramos",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Cristiano Ronaldo",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Francisco TrincÃ£o",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    }
  ],
  "drCongo": [
    {
      "name": "Matthieu Epolo",
      "number": 21,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Timothy Fayulu",
      "number": 16,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Lionel Mpasi",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Dylan Batubinsika",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Gedeon Kalulu",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Steve Kapuadi",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Joris Kayembe",
      "number": 12,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Arthur Masuaku",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Chancel Mbemba",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Axel Tuanzebe",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Aaron Wan-Bissaka",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Brian Cipenga",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Meshack Elia",
      "number": 13,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Gael Kakuta",
      "number": 11,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Edo Kayembe",
      "number": 25,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Nathanael Mbuku",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Samuel Moutoussamy",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Ngal'ayel Mukau",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Charles Pickel",
      "number": 18,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Noah Sadiki",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Aaron Tshibola",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Cedric Bakambu",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Simon Banza",
      "number": 23,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Fiston Mayele",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Yoane Wissa",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Theo Bongonda",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    }
  ],
  "panama": [
    {
      "name": "Orlando Mosquera",
      "number": 22,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Luis Mejia",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Cesar Samudio",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Cesar Blackman",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Jorge Gutierrez",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Amir Murillo",
      "number": null,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Fidel Escobar",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Andres Andrade",
      "number": 16,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Edgardo Farina",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jose Cordoba",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Ã‰ric Davis",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Jiovany Ramos",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Roderick Miller",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Anibal Godoy",
      "number": 20,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Adalberto Carrasquilla",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Carlos Harvey",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Cristian Martinez",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Jose Luis Rodriguez",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Cesar Yanis",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Yoel Barcenas",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Alberto Quintero",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Azarias Londono",
      "number": 24,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Ismael DÃ­az",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Cecilio Waterman",
      "number": 18,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "JosÃ© Fajardo",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Tomas Rodriguez",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "england": [
    {
      "name": "Jordan Pickford",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Dean Henderson",
      "number": 13,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "James Trafford",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Reece James",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Ezri Konsa",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jarell Quansah",
      "number": 26,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "John Stones",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Marc Guehi",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Dan Burn",
      "number": 15,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Nico O'Reilly",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Djed Spence",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Tino Livramento",
      "number": 12,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Declan Rice",
      "number": 4,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Elliot Anderson",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Kobbie Mainoo",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Jordan Henderson",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Morgan Rogers",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Jude Bellingham",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Eberechi Eze",
      "number": 21,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Harry Kane",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Ivan Toney",
      "number": 22,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Ollie Watkins",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Bukayo Saka",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Marcus Rashford",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Anthony Gordon",
      "number": 18,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Noni Madueke",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    }
  ],
  "croatia": [
    {
      "name": "Dominik LivakoviÄ‡",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Dominik Kotarski",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Ivor Pandur",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "JoÅ¡ko Gvardiol",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Duje Ä†aleta-Car",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Josip Å utalo",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Josip StaniÅ¡iÄ‡",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Marin PongraÄiÄ‡",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Martin ErliÄ‡",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Luka VuÅ¡koviÄ‡",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Luka ModriÄ‡",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Mateo KovaÄiÄ‡",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Mario PaÅ¡aliÄ‡",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Nikola VlaÅ¡iÄ‡",
      "number": 13,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Luka SuÄiÄ‡",
      "number": 21,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Martin Baturina",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Kristijan JakiÄ‡",
      "number": 18,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Petar SuÄiÄ‡",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Nikola Moro",
      "number": 7,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Toni Fruk",
      "number": 19,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Ivan PeriÅ¡iÄ‡",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Andrej KramariÄ‡",
      "number": 9,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Ante Budimir",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Marco PaÅ¡aliÄ‡",
      "number": 24,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Petar Musa",
      "number": 26,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Igor Matanovic",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "tunisia": [
    {
      "name": "Sabri Ben Hessen",
      "number": 22,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Abdelmouhib Chamakh",
      "number": null,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Aymen Dahman",
      "number": 16,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Ali Abdi",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Adem Arous",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Mohamed Amine Ben Hamida",
      "number": 21,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Dylan Bronn",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Raed Chikhaoui",
      "number": 24,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Moutaz Neffati",
      "number": 23,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Omar Rekik",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Montassar Talbi",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Yan Valery",
      "number": 20,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Mortadha Ben Ouanes",
      "number": 12,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Anis Ben Slimane",
      "number": 25,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Ismael Gharbi",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Rani Khedira",
      "number": 13,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Mohamed Hadj Mahmoud",
      "number": null,
      "position": "MID"
    },
    {
      "name": "Hannibal Mejbri",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Ellyes Skhiri",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Elias Achouri",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Khalil Ayari",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Firas Chaouat",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Rayan Elloumi",
      "number": 18,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Hazem Mastouri",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Elias Saad",
      "number": 8,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Sebastian Tounekti",
      "number": 26,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    }
  ],

};

const ORDER: SquadPosition[] = ["GK", "DEF", "MID", "FWD"];

export function squadFor(teamKey: string): SquadPlayer[] | undefined {
  return SQUADS[teamKey];
}

// Players grouped into the four position blocks (empty blocks omitted), numbers ascending.
export function squadByPosition(teamKey: string): { position: SquadPosition; players: SquadPlayer[] }[] | null {
  const players = SQUADS[teamKey];
  if (!players || players.length === 0) return null;
  return ORDER.map((position) => ({
    position,
    players: players.filter((p) => p.position === position).sort((a, b) => (a.number ?? 99) - (b.number ?? 99))
  })).filter((block) => block.players.length > 0);
}

