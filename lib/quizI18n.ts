import type { QuizQuestion } from "@/lib/quiz";
import { QUIZ } from "@/lib/quiz";
import type { Lang } from "@/lib/i18n";

// Localized quiz questions for each language.
// Rules:
//  - Player/venue proper nouns are kept in their original form.
//  - Country names use the site-wide localized names (matching COUNTRIES in i18n.ts).
//  - `correct` must exactly match one of the `options` strings.
//  - EN falls through to the canonical QUIZ array.

const TR: QuizQuestion[] = [
  {
    id: "q1",
    question: "Hangi ülke en fazla Dünya Kupası kazanmıştır?",
    options: ["Brezilya", "Almanya", "İtalya", "Arjantin"],
    correct: "Brezilya",
  },
  {
    id: "q2",
    question: "Dünya Kupası tarihinin tüm zamanların en golcüsü kimdir?",
    options: ["Miroslav Klose", "Ronaldo Nazário", "Gerd Müller", "Lionel Messi"],
    correct: "Miroslav Klose",
  },
  {
    id: "q3",
    question: "Hangi oyuncu en fazla Dünya Kupası maçında oynadı?",
    options: ["Lionel Messi", "Lothar Matthäus", "Paolo Maldini", "Cristiano Ronaldo"],
    correct: "Lionel Messi",
  },
  {
    id: "q4",
    question: "1930'daki ilk Dünya Kupası'nı hangi ülke kazandı?",
    options: ["Uruguay", "Arjantin", "Brezilya", "İtalya"],
    correct: "Uruguay",
  },
  {
    id: "q5",
    question: "2026 Dünya Kupası'na ev sahipliği yapan üç ülke hangileridir?",
    options: ["ABD, Kanada & Meksika", "ABD & Meksika", "Kanada & ABD", "Sadece ABD"],
    correct: "ABD, Kanada & Meksika",
  },
  {
    id: "q6",
    question: "2026 Dünya Kupası'nda kaç takım oynuyor?",
    options: ["48", "32", "40", "64"],
    correct: "48",
  },
  {
    id: "q7",
    question: "Tek bir Dünya Kupası'nda en fazla gol atan kim oldu?",
    options: ["Just Fontaine", "Pelé", "Ronaldo Nazário", "Kylian Mbappé"],
    correct: "Just Fontaine",
  },
  {
    id: "q8",
    question: "Hangi ülke en fazla Dünya Kupası finaline ulaştı?",
    options: ["Almanya", "Brezilya", "İtalya", "Arjantin"],
    correct: "Almanya",
  },
  {
    id: "q9",
    question: "2026 Dünya Kupası finali nerede oynanacak?",
    options: ["MetLife Stadium, New Jersey", "Estadio Azteca, Mexico City", "SoFi Stadium, Los Angeles", "Rose Bowl, Pasadena"],
    correct: "MetLife Stadium, New Jersey",
  },
  {
    id: "q10",
    question: "Dünya Kupası'nı üç kez kazanan tek oyuncu kimdir?",
    options: ["Pelé", "Diego Maradona", "Cafu", "Franz Beckenbauer"],
    correct: "Pelé",
  },
];

const ES: QuizQuestion[] = [
  {
    id: "q1",
    question: "¿Qué país ha ganado más Copas del Mundo?",
    options: ["Brasil", "Alemania", "Italia", "Argentina"],
    correct: "Brasil",
  },
  {
    id: "q2",
    question: "¿Quién es el máximo goleador histórico del Mundial?",
    options: ["Miroslav Klose", "Ronaldo Nazário", "Gerd Müller", "Lionel Messi"],
    correct: "Miroslav Klose",
  },
  {
    id: "q3",
    question: "¿Qué jugador ha disputado más partidos en Mundiales?",
    options: ["Lionel Messi", "Lothar Matthäus", "Paolo Maldini", "Cristiano Ronaldo"],
    correct: "Lionel Messi",
  },
  {
    id: "q4",
    question: "¿Quién ganó la primera Copa del Mundo, en 1930?",
    options: ["Uruguay", "Argentina", "Brasil", "Italia"],
    correct: "Uruguay",
  },
  {
    id: "q5",
    question: "¿Qué tres países organizan el Mundial 2026?",
    options: ["EE.UU., Canadá & México", "EE.UU. & México", "Canadá & EE.UU.", "Solo EE.UU."],
    correct: "EE.UU., Canadá & México",
  },
  {
    id: "q6",
    question: "¿Cuántos equipos juegan en el Mundial 2026?",
    options: ["48", "32", "40", "64"],
    correct: "48",
  },
  {
    id: "q7",
    question: "¿Quién marcó más goles en un solo Mundial?",
    options: ["Just Fontaine", "Pelé", "Ronaldo Nazário", "Kylian Mbappé"],
    correct: "Just Fontaine",
  },
  {
    id: "q8",
    question: "¿Qué país ha llegado a más finales del Mundial?",
    options: ["Alemania", "Brasil", "Italia", "Argentina"],
    correct: "Alemania",
  },
  {
    id: "q9",
    question: "¿Dónde se jugará la final de la Copa del Mundo 2026?",
    options: ["MetLife Stadium, New Jersey", "Estadio Azteca, Mexico City", "SoFi Stadium, Los Angeles", "Rose Bowl, Pasadena"],
    correct: "MetLife Stadium, New Jersey",
  },
  {
    id: "q10",
    question: "¿Quién es el único jugador en ganar el Mundial tres veces?",
    options: ["Pelé", "Diego Maradona", "Cafu", "Franz Beckenbauer"],
    correct: "Pelé",
  },
];

const FR: QuizQuestion[] = [
  {
    id: "q1",
    question: "Quel pays a remporté le plus de Coupes du Monde?",
    options: ["Brésil", "Allemagne", "Italie", "Argentine"],
    correct: "Brésil",
  },
  {
    id: "q2",
    question: "Qui est le meilleur buteur de tous les temps en Coupe du Monde?",
    options: ["Miroslav Klose", "Ronaldo Nazário", "Gerd Müller", "Lionel Messi"],
    correct: "Miroslav Klose",
  },
  {
    id: "q3",
    question: "Quel joueur a disputé le plus de matchs en Coupe du Monde?",
    options: ["Lionel Messi", "Lothar Matthäus", "Paolo Maldini", "Cristiano Ronaldo"],
    correct: "Lionel Messi",
  },
  {
    id: "q4",
    question: "Quel pays a remporté la toute première Coupe du Monde en 1930?",
    options: ["Uruguay", "Argentine", "Brésil", "Italie"],
    correct: "Uruguay",
  },
  {
    id: "q5",
    question: "Quels sont les trois pays hôtes de la Coupe du Monde 2026?",
    options: ["É.-U., Canada & Mexique", "É.-U. & Mexique", "Canada & É.-U.", "É.-U. seulement"],
    correct: "É.-U., Canada & Mexique",
  },
  {
    id: "q6",
    question: "Combien d'équipes participent à la Coupe du Monde 2026?",
    options: ["48", "32", "40", "64"],
    correct: "48",
  },
  {
    id: "q7",
    question: "Qui a marqué le plus de buts dans une seule Coupe du Monde?",
    options: ["Just Fontaine", "Pelé", "Ronaldo Nazário", "Kylian Mbappé"],
    correct: "Just Fontaine",
  },
  {
    id: "q8",
    question: "Quel pays a disputé le plus de finales de Coupe du Monde?",
    options: ["Allemagne", "Brésil", "Italie", "Argentine"],
    correct: "Allemagne",
  },
  {
    id: "q9",
    question: "Où se jouera la finale de la Coupe du Monde 2026?",
    options: ["MetLife Stadium, New Jersey", "Estadio Azteca, Mexico City", "SoFi Stadium, Los Angeles", "Rose Bowl, Pasadena"],
    correct: "MetLife Stadium, New Jersey",
  },
  {
    id: "q10",
    question: "Quel est le seul joueur à avoir remporté la Coupe du Monde trois fois?",
    options: ["Pelé", "Diego Maradona", "Cafu", "Franz Beckenbauer"],
    correct: "Pelé",
  },
];

const DE: QuizQuestion[] = [
  {
    id: "q1",
    question: "Welches Land hat die meisten Weltmeisterschaften gewonnen?",
    options: ["Brasilien", "Deutschland", "Italien", "Argentinien"],
    correct: "Brasilien",
  },
  {
    id: "q2",
    question: "Wer ist der ewige Rekordtorschütze der Weltmeisterschaft?",
    options: ["Miroslav Klose", "Ronaldo Nazário", "Gerd Müller", "Lionel Messi"],
    correct: "Miroslav Klose",
  },
  {
    id: "q3",
    question: "Welcher Spieler hat die meisten WM-Spiele bestritten?",
    options: ["Lionel Messi", "Lothar Matthäus", "Paolo Maldini", "Cristiano Ronaldo"],
    correct: "Lionel Messi",
  },
  {
    id: "q4",
    question: "Wer gewann die erste Weltmeisterschaft 1930?",
    options: ["Uruguay", "Argentinien", "Brasilien", "Italien"],
    correct: "Uruguay",
  },
  {
    id: "q5",
    question: "Welche drei Länder richten die WM 2026 aus?",
    options: ["USA, Kanada & Mexiko", "USA & Mexiko", "Kanada & USA", "Nur USA"],
    correct: "USA, Kanada & Mexiko",
  },
  {
    id: "q6",
    question: "Wie viele Teams spielen bei der WM 2026?",
    options: ["48", "32", "40", "64"],
    correct: "48",
  },
  {
    id: "q7",
    question: "Wer erzielte die meisten Tore bei einer einzigen WM?",
    options: ["Just Fontaine", "Pelé", "Ronaldo Nazário", "Kylian Mbappé"],
    correct: "Just Fontaine",
  },
  {
    id: "q8",
    question: "Welches Land hat die meisten WM-Endspiele erreicht?",
    options: ["Deutschland", "Brasilien", "Italien", "Argentinien"],
    correct: "Deutschland",
  },
  {
    id: "q9",
    question: "Wo findet das Finale der WM 2026 statt?",
    options: ["MetLife Stadium, New Jersey", "Estadio Azteca, Mexico City", "SoFi Stadium, Los Angeles", "Rose Bowl, Pasadena"],
    correct: "MetLife Stadium, New Jersey",
  },
  {
    id: "q10",
    question: "Wer ist der einzige Spieler, der die WM dreimal gewann?",
    options: ["Pelé", "Diego Maradona", "Cafu", "Franz Beckenbauer"],
    correct: "Pelé",
  },
];

const PT: QuizQuestion[] = [
  {
    id: "q1",
    question: "Qual nação venceu mais Copas do Mundo?",
    options: ["Brasil", "Alemanha", "Itália", "Argentina"],
    correct: "Brasil",
  },
  {
    id: "q2",
    question: "Quem é o maior artilheiro de todos os tempos na Copa do Mundo?",
    options: ["Miroslav Klose", "Ronaldo Nazário", "Gerd Müller", "Lionel Messi"],
    correct: "Miroslav Klose",
  },
  {
    id: "q3",
    question: "Qual jogador disputou mais partidas em Copas do Mundo?",
    options: ["Lionel Messi", "Lothar Matthäus", "Paolo Maldini", "Cristiano Ronaldo"],
    correct: "Lionel Messi",
  },
  {
    id: "q4",
    question: "Quem venceu a primeira Copa do Mundo, em 1930?",
    options: ["Uruguai", "Argentina", "Brasil", "Itália"],
    correct: "Uruguai",
  },
  {
    id: "q5",
    question: "Quais os três países que sediam a Copa do Mundo 2026?",
    options: ["EUA, Canadá & México", "EUA & México", "Canadá & EUA", "Somente EUA"],
    correct: "EUA, Canadá & México",
  },
  {
    id: "q6",
    question: "Quantas seleções disputam a Copa do Mundo 2026?",
    options: ["48", "32", "40", "64"],
    correct: "48",
  },
  {
    id: "q7",
    question: "Quem marcou mais gols em uma única Copa do Mundo?",
    options: ["Just Fontaine", "Pelé", "Ronaldo Nazário", "Kylian Mbappé"],
    correct: "Just Fontaine",
  },
  {
    id: "q8",
    question: "Qual país chegou ao maior número de finais da Copa do Mundo?",
    options: ["Alemanha", "Brasil", "Itália", "Argentina"],
    correct: "Alemanha",
  },
  {
    id: "q9",
    question: "Onde será disputada a final da Copa do Mundo 2026?",
    options: ["MetLife Stadium, New Jersey", "Estadio Azteca, Mexico City", "SoFi Stadium, Los Angeles", "Rose Bowl, Pasadena"],
    correct: "MetLife Stadium, New Jersey",
  },
  {
    id: "q10",
    question: "Quem é o único jogador a vencer a Copa do Mundo três vezes?",
    options: ["Pelé", "Diego Maradona", "Cafu", "Franz Beckenbauer"],
    correct: "Pelé",
  },
];

const AR: QuizQuestion[] = [
  {
    id: "q1",
    question: "أي دولة فازت بأكبر عدد من كؤوس العالم؟",
    options: ["البرازيل", "ألمانيا", "إيطاليا", "الأرجنتين"],
    correct: "البرازيل",
  },
  {
    id: "q2",
    question: "من هو الهداف التاريخي في كأس العالم؟",
    options: ["Miroslav Klose", "Ronaldo Nazário", "Gerd Müller", "Lionel Messi"],
    correct: "Miroslav Klose",
  },
  {
    id: "q3",
    question: "من شارك في أكبر عدد من مباريات كأس العالم؟",
    options: ["Lionel Messi", "Lothar Matthäus", "Paolo Maldini", "Cristiano Ronaldo"],
    correct: "Lionel Messi",
  },
  {
    id: "q4",
    question: "من فاز بأول كأس عالم عام 1930؟",
    options: ["الأوروغواي", "الأرجنتين", "البرازيل", "إيطاليا"],
    correct: "الأوروغواي",
  },
  {
    id: "q5",
    question: "ما هي الدول الثلاث المضيفة لكأس العالم 2026؟",
    options: ["الولايات المتحدة وكندا والمكسيك", "الولايات المتحدة والمكسيك", "كندا والولايات المتحدة", "الولايات المتحدة فقط"],
    correct: "الولايات المتحدة وكندا والمكسيك",
  },
  {
    id: "q6",
    question: "كم فريقاً يشارك في كأس العالم 2026؟",
    options: ["48", "32", "40", "64"],
    correct: "48",
  },
  {
    id: "q7",
    question: "من سجل أكبر عدد من الأهداف في كأس عالم واحدة؟",
    options: ["Just Fontaine", "Pelé", "Ronaldo Nazário", "Kylian Mbappé"],
    correct: "Just Fontaine",
  },
  {
    id: "q8",
    question: "أي دولة وصلت إلى أكبر عدد من نهائيات كأس العالم؟",
    options: ["ألمانيا", "البرازيل", "إيطاليا", "الأرجنتين"],
    correct: "ألمانيا",
  },
  {
    id: "q9",
    question: "أين تُقام نهائي كأس العالم 2026؟",
    options: ["MetLife Stadium, New Jersey", "Estadio Azteca, Mexico City", "SoFi Stadium, Los Angeles", "Rose Bowl, Pasadena"],
    correct: "MetLife Stadium, New Jersey",
  },
  {
    id: "q10",
    question: "من هو اللاعب الوحيد الذي فاز بكأس العالم ثلاث مرات؟",
    options: ["Pelé", "Diego Maradona", "Cafu", "Franz Beckenbauer"],
    correct: "Pelé",
  },
];

const JA: QuizQuestion[] = [
  {
    id: "q1",
    question: "最もワールドカップを制した国は？",
    options: ["ブラジル", "ドイツ", "イタリア", "アルゼンチン"],
    correct: "ブラジル",
  },
  {
    id: "q2",
    question: "ワールドカップ史上最多得点者は？",
    options: ["Miroslav Klose", "Ronaldo Nazário", "Gerd Müller", "Lionel Messi"],
    correct: "Miroslav Klose",
  },
  {
    id: "q3",
    question: "ワールドカップで最多出場した選手は？",
    options: ["Lionel Messi", "Lothar Matthäus", "Paolo Maldini", "Cristiano Ronaldo"],
    correct: "Lionel Messi",
  },
  {
    id: "q4",
    question: "1930年の第1回ワールドカップを制したのは？",
    options: ["ウルグアイ", "アルゼンチン", "ブラジル", "イタリア"],
    correct: "ウルグアイ",
  },
  {
    id: "q5",
    question: "2026年ワールドカップの開催国3か国は？",
    options: ["アメリカ、カナダ＆メキシコ", "アメリカ＆メキシコ", "カナダ＆アメリカ", "アメリカのみ"],
    correct: "アメリカ、カナダ＆メキシコ",
  },
  {
    id: "q6",
    question: "2026年ワールドカップの参加チーム数は？",
    options: ["48", "32", "40", "64"],
    correct: "48",
  },
  {
    id: "q7",
    question: "1大会で最多ゴールを記録した選手は？",
    options: ["Just Fontaine", "Pelé", "Ronaldo Nazário", "Kylian Mbappé"],
    correct: "Just Fontaine",
  },
  {
    id: "q8",
    question: "最多でワールドカップ決勝に進出した国は？",
    options: ["ドイツ", "ブラジル", "イタリア", "アルゼンチン"],
    correct: "ドイツ",
  },
  {
    id: "q9",
    question: "2026年ワールドカップの決勝はどこで行われる？",
    options: ["MetLife Stadium, New Jersey", "Estadio Azteca, Mexico City", "SoFi Stadium, Los Angeles", "Rose Bowl, Pasadena"],
    correct: "MetLife Stadium, New Jersey",
  },
  {
    id: "q10",
    question: "ワールドカップを3度制した唯一の選手は？",
    options: ["Pelé", "Diego Maradona", "Cafu", "Franz Beckenbauer"],
    correct: "Pelé",
  },
];

export const QUIZ_I18N: Record<Lang, QuizQuestion[]> = {
  en: QUIZ,
  tr: TR,
  es: ES,
  fr: FR,
  de: DE,
  pt: PT,
  ar: AR,
  ja: JA,
};
