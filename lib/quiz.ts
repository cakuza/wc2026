export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct: string; // the correct option text
};

// Exact 10 questions from the user's worldCupQuiz.json.
export const QUIZ: QuizQuestion[] = [
  { id: "q1", question: "Which nation has won the most World Cups?", options: ["Brazil", "Germany", "Italy", "Argentina"], correct: "Brazil" },
  { id: "q2", question: "Who is the all-time top scorer in World Cup history?", options: ["Miroslav Klose", "Ronaldo Nazário", "Gerd Müller", "Lionel Messi"], correct: "Miroslav Klose" },
  { id: "q3", question: "Which player has appeared in the most World Cup matches?", options: ["Lionel Messi", "Lothar Matthäus", "Paolo Maldini", "Cristiano Ronaldo"], correct: "Lionel Messi" },
  { id: "q4", question: "Who won the very first World Cup, in 1930?", options: ["Uruguay", "Argentina", "Brazil", "Italy"], correct: "Uruguay" },
  { id: "q5", question: "Which three countries are hosting the 2026 World Cup?", options: ["USA, Canada & Mexico", "USA & Mexico", "Canada & USA", "USA only"], correct: "USA, Canada & Mexico" },
  { id: "q6", question: "How many teams play in the 2026 World Cup?", options: ["48", "32", "40", "64"], correct: "48" },
  { id: "q7", question: "Who scored the most goals in a single World Cup?", options: ["Just Fontaine", "Pelé", "Ronaldo Nazário", "Kylian Mbappé"], correct: "Just Fontaine" },
  { id: "q8", question: "Which country has reached the most World Cup finals?", options: ["Germany", "Brazil", "Italy", "Argentina"], correct: "Germany" },
  { id: "q9", question: "Where is the 2026 World Cup final being played?", options: ["MetLife Stadium, New Jersey", "Estadio Azteca, Mexico City", "SoFi Stadium, Los Angeles", "Rose Bowl, Pasadena"], correct: "MetLife Stadium, New Jersey" },
  { id: "q10", question: "Who is the only player to win the World Cup three times?", options: ["Pelé", "Diego Maradona", "Cafu", "Franz Beckenbauer"], correct: "Pelé" }
];
