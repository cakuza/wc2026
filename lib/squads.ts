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
      "name": "Raúl Rangel",
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
      "name": "Jorge Sánchez",
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
      "name": "César Montes",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Johan Vásquez",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jesús Gallardo",
      "number": 23,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Mateo Chávez",
      "number": 20,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Edson Álvarez",
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
      "name": "Orbelín Pineda",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Álvaro Fidalgo",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Brian Gutiérrez",
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
      "name": "Luis Chávez",
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
      "name": "César Huerta",
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
      "name": "Julián Quiñones",
      "number": 16,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Guillermo Martínez",
      "number": 22,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Armando González",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Santiago Giménez",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Raúl Jiménez",
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
      "name": "Lukáš Horníček",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Matěj Kovář",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Jindřich Stánek",
      "number": 16,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Vladimír Coufal",
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
      "name": "Tomáš Holeš",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Robin Hranáč",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Štěpán Chaloupek",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "David Jurásek",
      "number": 14,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Ladislav Krejčí",
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
      "name": "Vladimír Darida",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Lukáš Provod",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Michal Sadílek",
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
      "name": "Tomáš Souček",
      "number": 22,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Pavel Šulc",
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
      "name": "Adam Hložek",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Tomáš Chorý",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Mojmír Chytil",
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
      "name": "Brahim Díaz",
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
      "name": "Osman Hadžikić",
      "number": null,
      "position": "GK"
    },
    {
      "name": "Sead Kolašinac",
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
      "name": "Dennis Hadžikadunić",
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
      "name": "Amir Hadžiahmetović",
      "number": 16,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Ivan Šunjić",
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
      "name": "Dženis Burnić",
      "number": 17,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Ermin Mahmić",
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
      "name": "Amar Memić",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Right Midfield"
    },
    {
      "name": "Armin Gigović",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Kerim Alajbegović",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Esmir Bajraktarević",
      "number": 20,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Ermedin Demirović",
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
      "name": "Haris Tabaković",
      "number": 23,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Edin Džeko",
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
      "name": "Eray Cömert",
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
      "name": "Ricardo Rodríguez",
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
      "name": "Gabriel Magalhães",
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
      "name": "Bruno Guimarães",
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
      "name": "Lucas Paquetá",
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
      "name": "Vinícius Júnior",
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
      "name": "Ronald Araújo",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "José María Giménez",
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
      "name": "Sebastián Cáceres",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Mathías Olivera",
      "number": 16,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Joaquín Piquerez",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Matías Viña",
      "number": 17,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Maximiliano Araújo",
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
      "name": "Agustín Canobbio",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Nicolás de la Cruz",
      "number": 7,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Emiliano Martínez",
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
      "name": "Brian Rodríguez",
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
      "name": "Federico Viñas",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Darwin Núñez",
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
      "name": "Álvaro Montero",
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
      "name": "Davinson Sánchez",
      "number": 23,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Jhon Lucumí",
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
      "name": "Daniel Muñoz",
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
      "name": "Kevin Castaño",
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
      "name": "James Rodríguez",
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
      "name": "Juan Camilo Hernández",
      "number": null,
      "position": "FWD"
    },
    {
      "name": "Luis Díaz",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Luis Suárez",
      "number": 25,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Carlos Gómez",
      "number": null,
      "position": "FWD"
    },
    {
      "name": "Jhon Córdoba",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "turkey": [
    {
      "name": "Altay Bayındır",
      "number": 12,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Mert Günok",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Uğurcan Çakır",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Abdülkerim Bardakcı",
      "number": 14,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Çağlar Söyüncü",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Eren Elmalı",
      "number": 13,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Ferdi Kadıoğlu",
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
      "name": "Mert Müldür",
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
      "name": "Samet Akaydın",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Zeki Çelik",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Hakan Çalhanoğlu",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "İsmail Yüksek",
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
      "name": "Orkun Kökcü",
      "number": 6,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Salih Özcan",
      "number": 5,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Arda Güler",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Barış Alper Yılmaz",
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
      "name": "Deniz Gül",
      "number": 9,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "İrfan Can Kahveci",
      "number": 17,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Kenan Yıldız",
      "number": 11,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Kerem Aktürkoğlu",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Oğuz Aydın",
      "number": 24,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "Yunus Akgün",
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
      "name": "Roberto Fernández",
      "number": null,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Gastón Olveira",
      "number": 22,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Juan Cáceres",
      "number": null,
      "position": "DEF"
    },
    {
      "name": "Gustavo Velázquez",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Gustavo Gómez",
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
      "name": "José Canale",
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
      "name": "Fabián Balbuena",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Diego Gómez",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Mauricio Magalhães",
      "number": null,
      "position": "MID"
    },
    {
      "name": "Damián Bobadilla",
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
      "name": "Andrés Cubas",
      "number": 14,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Matías Galarza",
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
      "name": "Ramón Sosa",
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
      "name": "Gabriel Ávalos",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Miguel Almirón",
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
      "name": "Alexander Nübel",
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
      "name": "Antonio Rüdiger",
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
      "name": "Leroy Sané",
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
      "name": "Arthur Théate",
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
      "name": "Jérémy Doku",
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
      "name": "Nathan Aké",
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
      "name": "Jurriën Timber",
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
      "name": "Ørjan Haskjold Nyland",
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
      "name": "Fredrik Bjørkan",
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
      "name": "Torbjørn Heggem",
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
      "name": "Leo Østigård",
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
      "name": "Martin Ødegaard",
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
      "name": "Alexander Sørloth",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Jørgen Strand Larsen",
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
      "name": "Wataru Endō",
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
      "name": "Hernán Galíndez",
      "number": 1,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Moisés Ramírez",
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
      "name": "Piero Hincapié",
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
      "name": "Pervis Estupiñán",
      "number": 7,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Félix Torres",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Joel Ordóñez",
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
      "name": "Ángelo Preciado",
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
      "name": "Moisés Caicedo",
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
      "name": "Kendry Páez",
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
      "name": "Jordy Alcívar",
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
      "name": "Énner Valencia",
      "number": 13,
      "position": "FWD",
      "detailedPosition": "Forward"
    },
    {
      "name": "Kevin Rodríguez",
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
      "name": "Jérémy Arévalo",
      "number": 24,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    }
  ],
  "spain": [
    {
      "name": "Unai Simón",
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
      "name": "Pau Cubarsí",
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
      "name": "Fabián Ruiz",
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
      "name": "Víctor Muñoz",
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
      "name": "Franck Kessié",
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
      "name": "Jean-Michaël Séri",
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
      "name": "Oumar Diakité",
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
      "name": "Nicolas Pépé",
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
      "name": "Théo Hernandez",
      "number": 19,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Ibrahima Konaté",
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
      "name": "Jules Koundé",
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
      "name": "N'Golo Kanté",
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
      "name": "Aurélien Tchouaméni",
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
      "name": "Ousmane Dembélé",
      "number": 7,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Désiré Doué",
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
      "name": "Kylian Mbappé",
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
      "name": "Édouard Mendy",
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
      "name": "Pape Guèye",
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
      "name": "Sadio Mané",
      "number": 10,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Ismaïla Sarr",
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
      "name": "Emiliano Martínez",
      "number": 23,
      "position": "GK",
      "detailedPosition": "Goalkeeper"
    },
    {
      "name": "Gerónimo Rulli",
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
      "name": "Nicolás Tagliafico",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Left-Back"
    },
    {
      "name": "Lisandro Martínez",
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
      "name": "Nicolás Otamendi",
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
      "name": "Valentín Barco",
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
      "name": "Enzo Fernández",
      "number": 24,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Julián Álvarez",
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
      "name": "Nicolás González",
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
      "name": "Nicolás Paz",
      "number": null,
      "position": "FWD"
    },
    {
      "name": "José Manuel López",
      "number": 21,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Lautaro Martínez",
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
      "name": "José Sá",
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
      "name": "Tomás Araújo",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "João Cancelo",
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
      "name": "Rúben Dias",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Gonçalo Inácio",
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
      "name": "João Neves",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Rúben Neves",
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
      "name": "Francisco Conceição",
      "number": 26,
      "position": "FWD",
      "detailedPosition": "Right Winger"
    },
    {
      "name": "João Félix",
      "number": 11,
      "position": "FWD",
      "detailedPosition": "Centre-Forward"
    },
    {
      "name": "Gonçalo Guedes",
      "number": 19,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Rafael Leão",
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
      "name": "Gonçalo Ramos",
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
      "name": "Francisco Trincão",
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
      "name": "Éric Davis",
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
      "name": "Ismael Díaz",
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
      "name": "José Fajardo",
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
      "name": "Dominik Livaković",
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
      "name": "Joško Gvardiol",
      "number": 4,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Duje Ćaleta-Car",
      "number": 5,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Josip Šutalo",
      "number": 6,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Josip Stanišić",
      "number": 2,
      "position": "DEF",
      "detailedPosition": "Right-Back"
    },
    {
      "name": "Marin Pongračić",
      "number": 3,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Martin Erlić",
      "number": 25,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Luka Vušković",
      "number": 22,
      "position": "DEF",
      "detailedPosition": "Centre-Back"
    },
    {
      "name": "Luka Modrić",
      "number": 10,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Mateo Kovačić",
      "number": 8,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Mario Pašalić",
      "number": 15,
      "position": "MID",
      "detailedPosition": "Central Midfield"
    },
    {
      "name": "Nikola Vlašić",
      "number": 13,
      "position": "MID",
      "detailedPosition": "Attacking Midfield"
    },
    {
      "name": "Luka Sučić",
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
      "name": "Kristijan Jakić",
      "number": 18,
      "position": "MID",
      "detailedPosition": "Defensive Midfield"
    },
    {
      "name": "Petar Sučić",
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
      "name": "Ivan Perišić",
      "number": 14,
      "position": "FWD",
      "detailedPosition": "Left Winger"
    },
    {
      "name": "Andrej Kramarić",
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
      "name": "Marco Pašalić",
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
  "serbia": [
    { name: "Đorđe Petrović", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Marko Dmitrović", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Predrag Rajković", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Nemanja Gudelj", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Nikola Milenković", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Strahinja Pavlović", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Stefan Mitrović", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Erhan Mašović", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Filip Mladenović", number: null, position: "DEF", detailedPosition: "Left-Back" },
    { name: "Mihailo Ristić", number: null, position: "DEF", detailedPosition: "Left-Back" },
    { name: "Aleksandar Sedlar", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Miloš Veljković", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Sergej Milinković-Savić", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Dušan Tadić", number: null, position: "MID", detailedPosition: "LM" },
    { name: "Filip Kostić", number: null, position: "MID", detailedPosition: "LM" },
    { name: "Nemanja Matić", number: null, position: "MID", detailedPosition: "Defensive Midfield" },
    { name: "Nemanja Maksimović", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Ivan Ilić", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Mijat Gaćinović", number: null, position: "MID", detailedPosition: "LM" },
    { name: "Marko Grujić", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Dušan Vlahović", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Aleksandar Mitrović", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Luka Jović", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Veljko Birmančević", number: null, position: "FWD", detailedPosition: "Right Winger" },
    { name: "Andrija Živković", number: null, position: "FWD", detailedPosition: "Right Winger" },
    { name: "Dejan Joveljić", number: null, position: "FWD", detailedPosition: "Centre-Forward" }
  ],
  "denmark": [
    { name: "Kasper Schmeichel", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Frederik Rønnow", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Filip Jörgensen", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Andreas Christensen", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Joachim Andersen", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Alexander Bah", number: null, position: "DEF", detailedPosition: "Right-Back" },
    { name: "Joakim Mæhle", number: null, position: "DEF", detailedPosition: "Right-Back" },
    { name: "Victor Nelsson", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Rasmus Kristensen", number: null, position: "DEF", detailedPosition: "Right-Back" },
    { name: "Rasmus Nicolaisen", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Jannik Vestergaard", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Victor Kristiansen", number: null, position: "DEF", detailedPosition: "Left-Back" },
    { name: "Morten Hjulmand", number: null, position: "MID", detailedPosition: "Defensive Midfield" },
    { name: "Pierre-Emile Højbjerg", number: null, position: "MID", detailedPosition: "Defensive Midfield" },
    { name: "Matt O'Riley", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Christian Eriksen", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Andreas Skov Olsen", number: null, position: "MID", detailedPosition: "RM" },
    { name: "Philip Billing", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Mathias Jensen", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Christian Nørgaard", number: null, position: "MID", detailedPosition: "Defensive Midfield" },
    { name: "Rasmus Højlund", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Jonas Wind", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Anders Dreyer", number: null, position: "FWD", detailedPosition: "Right Winger" },
    { name: "Yussuf Poulsen", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Kasper Dolberg", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Gustav Isaksen", number: null, position: "FWD", detailedPosition: "Right Winger" }
  ],
  "cameroon": [
    { name: "André Onana", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Blondy Nna Noukeu", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Harold Moukoudi", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Jean-Charles Castelletto", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Michael Ngadeu", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Christopher Wooh", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Jackson Tchatchoua", number: null, position: "DEF", detailedPosition: "Right-Back" },
    { name: "Flavien-Enzo Boyomo", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Enzo Ebosse", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Nouhou", number: null, position: "DEF", detailedPosition: "Left-Back" },
    { name: "Darlin Yongwa", number: null, position: "DEF", detailedPosition: "Left-Back" },
    { name: "André-Franck Zambo Anguissa", number: null, position: "MID", detailedPosition: "Defensive Midfield" },
    { name: "Georges-Kévin Nkoudou", number: null, position: "MID", detailedPosition: "LM" },
    { name: "Carlos Baleba", number: null, position: "MID", detailedPosition: "Defensive Midfield" },
    { name: "Martin Hongla", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Olivier Kemen", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Jean Onana", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Tsiy-William Ndenge", number: null, position: "MID", detailedPosition: "Defensive Midfield" },
    { name: "Yvan Neyou", number: null, position: "MID", detailedPosition: "Defensive Midfield" },
    { name: "Bryan Mbeumo", number: null, position: "FWD", detailedPosition: "Right Winger" },
    { name: "Vincent Aboubakar", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Faris Pemi Moumbagna", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Karl Toko Ekambi", number: null, position: "FWD", detailedPosition: "LW" },
    { name: "Ignatius Ganago", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Frank Magri", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Jeremy Ebobisse", number: null, position: "FWD", detailedPosition: "Centre-Forward" }
  ],
  "nigeria": [
    { name: "Maduka Okoye", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Sebastian Osigwe", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Calvin Bassey", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Bright Osayi-Samuel", number: null, position: "DEF", detailedPosition: "Right-Back" },
    { name: "Ola Aina", number: null, position: "DEF", detailedPosition: "Left-Back" },
    { name: "Zaidu Sanusi", number: null, position: "DEF", detailedPosition: "Left-Back" },
    { name: "Kevin Akpoguma", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Tyronne Ebuehi", number: null, position: "DEF", detailedPosition: "Right-Back" },
    { name: "Igoh Ogbu", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Jordan Torunarigha", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Leon Balogun", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Wilfred Ndidi", number: null, position: "MID", detailedPosition: "Defensive Midfield" },
    { name: "Alex Iwobi", number: null, position: "MID", detailedPosition: "RM" },
    { name: "Chidera Ejuke", number: null, position: "MID", detailedPosition: "LM" },
    { name: "Moses Simon", number: null, position: "MID", detailedPosition: "LM" },
    { name: "Nathan Tella", number: null, position: "MID", detailedPosition: "RM" },
    { name: "Raphael Onyedika", number: null, position: "MID", detailedPosition: "Defensive Midfield" },
    { name: "Henry Onyekuru", number: null, position: "MID", detailedPosition: "LM" },
    { name: "Joe Aribo", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Victor Osimhen", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Victor Boniface", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Ademola Lookman", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Samuel Chukwueze", number: null, position: "FWD", detailedPosition: "Right Winger" },
    { name: "Terem Moffi", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Umar Sadiq", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Taiwo Awoniyi", number: null, position: "FWD", detailedPosition: "Centre-Forward" }
  ],
  "jamaica": [
    { name: "Andre Blake", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Corey Addai", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Coniah Boyce-Clarke", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Ethan Pinnock", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Amari'i Bell", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Joel Latibeaudiere", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Di'Shon Bernard", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Damion Lowe", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Wes Harding", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Greg Leigh", number: null, position: "DEF", detailedPosition: "Left-Back" },
    { name: "Alvas Powell", number: null, position: "DEF", detailedPosition: "Right-Back" },
    { name: "Tayvon Gray", number: null, position: "DEF", detailedPosition: "Right-Back" },
    { name: "Dexter Lembikisa", number: null, position: "DEF", detailedPosition: "Right-Back" },
    { name: "Leon Bailey", number: null, position: "MID", detailedPosition: "RM" },
    { name: "Bobby De Cordova-Reid", number: null, position: "MID", detailedPosition: "RM" },
    { name: "Kasey Palmer", number: null, position: "MID", detailedPosition: "CAM" },
    { name: "Garath McCleary", number: null, position: "MID", detailedPosition: "RM" },
    { name: "Jordan Cousins", number: null, position: "MID", detailedPosition: "Defensive Midfield" },
    { name: "Jon Russell", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Karoy Anderson", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Michail Antonio", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Demarai Gray", number: null, position: "FWD", detailedPosition: "LW" },
    { name: "Jamal Lowe", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Jonson Clarke-Harris", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Cory Burke", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Blair Turgott", number: null, position: "FWD", detailedPosition: "Centre-Forward" }
  ],
  "ukraine": [
    { name: "Andriy Lunin", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Anatoliy Trubin", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Georgiy Bushchan", number: null, position: "GK", detailedPosition: "GK" },
    { name: "Oleksandr Zinchenko", number: null, position: "DEF", detailedPosition: "Left-Back" },
    { name: "Vitaliy Mykolenko", number: null, position: "DEF", detailedPosition: "Left-Back" },
    { name: "Illia Zabarnyi", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Mykola Matviienko", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Denys Popov", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Valeriy Bondar", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Oleksandr Karavaiev", number: null, position: "DEF", detailedPosition: "Right-Back" },
    { name: "Ivan Ordets", number: null, position: "DEF", detailedPosition: "Centre-Back" },
    { name: "Oleksandr Tymchyk", number: null, position: "DEF", detailedPosition: "Right-Back" },
    { name: "Viktor Tsygankov", number: null, position: "MID", detailedPosition: "RM" },
    { name: "Mykola Shaparenko", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Vitaliy Buyalskyi", number: null, position: "MID", detailedPosition: "CAM" },
    { name: "Ruslan Malinovskyi", number: null, position: "MID", detailedPosition: "Central Midfield" },
    { name: "Mykhailo Mudryk", number: null, position: "MID", detailedPosition: "LM" },
    { name: "Heorhii Sudakov", number: null, position: "MID", detailedPosition: "CAM" },
    { name: "Taras Stepanenko", number: null, position: "MID", detailedPosition: "Defensive Midfield" },
    { name: "Oleksandr Zubkov", number: null, position: "MID", detailedPosition: "RM" },
    { name: "Artem Dovbyk", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Danylo Sikan", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Vladyslav Vanat", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Roman Yaremchuk", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Nazariy Rusyn", number: null, position: "FWD", detailedPosition: "Centre-Forward" },
    { name: "Mykola Kuharevych", number: null, position: "FWD", detailedPosition: "Centre-Forward" }
  ]

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
