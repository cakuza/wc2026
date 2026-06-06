import type { Lang } from "@/components/language-provider";

// ── UI string dictionary ─────────────────────────────────────────────────────

export const UI: Record<string, Record<Lang, string>> = {
  trivia_title: {
    en: "World Cup Trivia",
    tr: "Dünya Kupası Bilgi Kartları",
    es: "Trivia del Mundial",
    fr: "Quiz Coupe du Monde",
    de: "WM-Trivia",
    pt: "Trivia da Copa",
    ar: "معلومات كأس العالم",
    ja: "ワールドカップ豆知識",
  },
  trivia_reveal: {
    en: "Reveal answer",
    tr: "Cevabı göster",
    es: "Mostrar respuesta",
    fr: "Révéler la réponse",
    de: "Antwort zeigen",
    pt: "Revelar resposta",
    ar: "كشف الإجابة",
    ja: "答えを見る",
  },
  trivia_quiz_link: {
    en: "Take the World Cup quiz →",
    tr: "Quize katıl →",
    es: "Hacer el quiz →",
    fr: "Faire le quiz →",
    de: "Quiz spielen →",
    pt: "Fazer o quiz →",
    ar: "ابدأ الاختبار →",
    ja: "クイズに挑戦 →",
  },
  trivia_loading: {
    en: "Loading a World Cup teaser…",
    tr: "Yükleniyor…",
    es: "Cargando…",
    fr: "Chargement…",
    de: "Wird geladen…",
    pt: "Carregando…",
    ar: "جارٍ التحميل…",
    ja: "読み込み中…",
  },
};

export function t(key: string, lang: Lang): string {
  return UI[key]?.[lang] ?? UI[key]?.["en"] ?? key;
}

// ── Trivia translations (25 high-weight questions, 7 languages each) ─────────
// English originals live in data/worldCupTrivia.json.
// Only non-English translations are stored here; the widget falls back to EN.

export const TRIVIA_TRANSLATIONS: Record<
  string,
  Partial<Record<Lang, { teaser: string; reveal: string }>>
> = {
  // ── t001 ─────────────────────────────────────────────────────────────────
  t001: {
    tr: { teaser: "En çok Dünya Kupası kazanan ülke hangisi?", reveal: "Brezilya, 5 şampiyonlukla (1958, 1962, 1970, 1994, 2002)." },
    es: { teaser: "¿Qué nación ha ganado más Copas del Mundo?", reveal: "Brasil, con 5 títulos (1958, 1962, 1970, 1994, 2002)." },
    fr: { teaser: "Quelle nation a remporté le plus de Coupes du Monde ?", reveal: "Le Brésil, avec 5 titres (1958, 1962, 1970, 1994, 2002)." },
    de: { teaser: "Welche Nation hat die meisten Weltmeisterschaften gewonnen?", reveal: "Brasilien, mit 5 Titeln (1958, 1962, 1970, 1994, 2002)." },
    pt: { teaser: "Qual nação ganhou mais Copas do Mundo?", reveal: "O Brasil, com 5 títulos (1958, 1962, 1970, 1994, 2002)." },
    ar: { teaser: "أي دولة فازت بأكبر عدد من كؤوس العالم؟", reveal: "البرازيل، بـ5 ألقاب (1958، 1962، 1970، 1994، 2002)." },
    ja: { teaser: "ワールドカップで最多優勝国はどこ？", reveal: "ブラジル、5回優勝（1958、1962、1970、1994、2002年）。" },
  },
  // ── t002 ─────────────────────────────────────────────────────────────────
  t002: {
    tr: { teaser: "Dünya Kupası tarihinin en golcü oyuncusu kim?", reveal: "Almanya'dan Miroslav Klose, 16 golle." },
    es: { teaser: "¿Quién es el máximo goleador histórico de los Mundiales?", reveal: "Miroslav Klose de Alemania, con 16 goles." },
    fr: { teaser: "Qui est le meilleur buteur de toute l'histoire de la Coupe du Monde ?", reveal: "Miroslav Klose d'Allemagne, avec 16 buts." },
    de: { teaser: "Wer ist der ewige Torschützenkönig der Weltmeisterschaften?", reveal: "Miroslav Klose aus Deutschland, mit 16 Toren." },
    pt: { teaser: "Quem é o artilheiro histórico das Copas do Mundo?", reveal: "Miroslav Klose da Alemanha, com 16 gols." },
    ar: { teaser: "من هو الهداف التاريخي في كأس العالم؟", reveal: "ميروسلاف كلوسه من ألمانيا، بـ16 هدفاً." },
    ja: { teaser: "ワールドカップ歴代最多得点者は誰？", reveal: "ドイツのミロスラフ・クローゼ、16得点。" },
  },
  // ── t003 ─────────────────────────────────────────────────────────────────
  t003: {
    tr: { teaser: "En fazla Dünya Kupası maçına çıkan oyuncu kim?", reveal: "Lionel Messi; Lothar Matthäus'u geçerek 26 maça ulaştı." },
    es: { teaser: "¿Qué jugador ha disputado más partidos en Mundiales?", reveal: "Lionel Messi, superando a Lothar Matthäus con 26 partidos." },
    fr: { teaser: "Quel joueur a disputé le plus de matchs en Coupe du Monde ?", reveal: "Lionel Messi, dépassant Lothar Matthäus avec 26 matchs." },
    de: { teaser: "Welcher Spieler hat die meisten WM-Spiele bestritten?", reveal: "Lionel Messi, der Lothar Matthäus mit 26 Spielen überholt hat." },
    pt: { teaser: "Qual jogador disputou mais partidas em Copas do Mundo?", reveal: "Lionel Messi, superando Lothar Matthäus com 26 jogos." },
    ar: { teaser: "من هو اللاعب صاحب أكثر المباريات في كأس العالم؟", reveal: "ليونيل ميسي، متجاوزاً لوثار ماتيوس بـ26 مباراة." },
    ja: { teaser: "ワールドカップ最多出場試合数の選手は？", reveal: "リオネル・メッシ、ロタール・マテウスを抜いて26試合出場。" },
  },
  // ── t004 ─────────────────────────────────────────────────────────────────
  t004: {
    tr: { teaser: "1930'daki ilk Dünya Kupası'na hangi ülke ev sahipliği yaptı ve şampiyon oldu?", reveal: "Uruguay; finalde Arjantin'i 4–2 yendi." },
    es: { teaser: "¿Qué país organizó y ganó el primer Mundial en 1930?", reveal: "Uruguay, que venció a Argentina 4–2 en la final." },
    fr: { teaser: "Quel pays a accueilli et remporté la toute première Coupe du Monde en 1930 ?", reveal: "L'Uruguay, qui a battu l'Argentine 4–2 en finale." },
    de: { teaser: "Wer richtete die erste Weltmeisterschaft 1930 aus und gewann sie?", reveal: "Uruguay, das Argentinien im Finale 4:2 besiegte." },
    pt: { teaser: "Quem sediou e venceu a primeira Copa do Mundo em 1930?", reveal: "O Uruguai, que venceu a Argentina por 4–2 na final." },
    ar: { teaser: "من استضاف وفاز بأول كأس عالم عام 1930؟", reveal: "الأوروغواي، التي هزمت الأرجنتين 4–2 في النهائي." },
    ja: { teaser: "1930年の第1回ワールドカップを開催し優勝した国は？", reveal: "ウルグアイ。決勝でアルゼンチンを4–2で破った。" },
  },
  // ── t005 ─────────────────────────────────────────────────────────────────
  t005: {
    tr: { teaser: "2026 Dünya Kupası'nı hangi üç ülke düzenliyor?", reveal: "Amerika Birleşik Devletleri, Kanada ve Meksika." },
    es: { teaser: "¿Qué tres países organizan el Mundial 2026?", reveal: "Estados Unidos, Canadá y México." },
    fr: { teaser: "Quels sont les trois pays qui organisent la Coupe du Monde 2026 ?", reveal: "Les États-Unis, le Canada et le Mexique." },
    de: { teaser: "Welche drei Länder richten die WM 2026 aus?", reveal: "Die Vereinigten Staaten, Kanada und Mexiko." },
    pt: { teaser: "Quais três países sediam a Copa do Mundo 2026?", reveal: "Estados Unidos, Canadá e México." },
    ar: { teaser: "أي ثلاث دول تستضيف كأس العالم 2026؟", reveal: "الولايات المتحدة وكندا والمكسيك." },
    ja: { teaser: "2026年ワールドカップを開催する3カ国は？", reveal: "アメリカ、カナダ、メキシコ。" },
  },
  // ── t006 ─────────────────────────────────────────────────────────────────
  t006: {
    tr: { teaser: "2026 Dünya Kupası'nda kaç takım oynayacak?", reveal: "48 takım — Dünya Kupası tarihinin en büyük katılımı." },
    es: { teaser: "¿Cuántos equipos participarán en el Mundial 2026?", reveal: "48 equipos — el mayor número en la historia del Mundial." },
    fr: { teaser: "Combien d'équipes participent au Mondial 2026 ?", reveal: "48 équipes — le plus grand plateau de l'histoire du Mondial." },
    de: { teaser: "Wie viele Teams nehmen an der WM 2026 teil?", reveal: "48 Teams — die größte Teilnehmerzahl in der WM-Geschichte." },
    pt: { teaser: "Quantas seleções participam da Copa do Mundo 2026?", reveal: "48 seleções — o maior campo da história da Copa." },
    ar: { teaser: "كم منتخباً يشارك في كأس العالم 2026؟", reveal: "48 منتخباً — أكبر عدد في تاريخ كأس العالم." },
    ja: { teaser: "2026年ワールドカップに参加するチーム数は？", reveal: "48チーム — ワールドカップ史上最多。" },
  },
  // ── t007 ─────────────────────────────────────────────────────────────────
  t007: {
    tr: { teaser: "Tek bir Dünya Kupası'nda en fazla gol atan kim?", reveal: "Fransa'dan Just Fontaine; 1958 turnuvasında 13 gol attı." },
    es: { teaser: "¿Quién marcó más goles en un solo Mundial?", reveal: "Just Fontaine de Francia, con 13 goles en el torneo de 1958." },
    fr: { teaser: "Qui a marqué le plus de buts lors d'une seule Coupe du Monde ?", reveal: "Just Fontaine de France, avec 13 buts au tournoi de 1958." },
    de: { teaser: "Wer schoss die meisten Tore bei einer einzigen WM?", reveal: "Just Fontaine aus Frankreich, mit 13 Toren beim Turnier 1958." },
    pt: { teaser: "Quem marcou mais gols em uma única Copa do Mundo?", reveal: "Just Fontaine da França, com 13 gols no torneio de 1958." },
    ar: { teaser: "من سجل أكثر الأهداف في نسخة واحدة من كأس العالم؟", reveal: "جوست فونتين من فرنسا، بـ13 هدفاً في نسخة 1958." },
    ja: { teaser: "1大会でのゴール数最多記録を持つ選手は？", reveal: "フランスのジュスト・フォンテーヌ、1958年大会で13得点。" },
  },
  // ── t008 ─────────────────────────────────────────────────────────────────
  t008: {
    tr: { teaser: "En fazla Dünya Kupası finaline hangi ülke çıktı?", reveal: "Almanya, 8 final katılımıyla." },
    es: { teaser: "¿Qué país ha llegado a más finales del Mundial?", reveal: "Alemania, con 8 apariciones en finales." },
    fr: { teaser: "Quel pays a disputé le plus de finales de Coupe du Monde ?", reveal: "L'Allemagne, avec 8 apparitions en finale." },
    de: { teaser: "Welches Land hat die meisten WM-Endspiele erreicht?", reveal: "Deutschland, mit 8 Finalauftritten." },
    pt: { teaser: "Qual país chegou ao maior número de finais de Copa do Mundo?", reveal: "A Alemanha, com 8 aparições em finais." },
    ar: { teaser: "أي دولة وصلت إلى أكبر عدد من نهائيات كأس العالم؟", reveal: "ألمانيا، بـ8 مشاركات في النهائيات." },
    ja: { teaser: "ワールドカップ決勝に最多出場した国は？", reveal: "ドイツ、8回の決勝出場。" },
  },
  // ── t009 ─────────────────────────────────────────────────────────────────
  t009: {
    tr: { teaser: "Pelé 1958 finalinde gol attığında kaç yaşındaydı?", reveal: "17 — hâlâ bir Dünya Kupası finalinde gol atan en genç oyuncu." },
    es: { teaser: "¿Cuántos años tenía Pelé cuando marcó en la final de 1958?", reveal: "17 — sigue siendo el jugador más joven en anotar en una final de Mundial." },
    fr: { teaser: "Quel âge avait Pelé lorsqu'il a marqué en finale en 1958 ?", reveal: "17 ans — il reste le plus jeune buteur dans une finale de Coupe du Monde." },
    de: { teaser: "Wie alt war Pelé, als er im Finale 1958 traf?", reveal: "17 — er ist bis heute der jüngste Torschütze in einem WM-Finale." },
    pt: { teaser: "Quantos anos tinha Pelé quando marcou na final de 1958?", reveal: "17 — ele ainda é o jogador mais jovem a marcar em uma final de Copa." },
    ar: { teaser: "كم كان عمر بيليه حين سجل في نهائي 1958؟", reveal: "17 عاماً — لا يزال أصغر لاعب يسجل في نهائي كأس العالم." },
    ja: { teaser: "1958年決勝でペレがゴールを決めたときの年齢は？", reveal: "17歳 — ワールドカップ決勝で得点した最年少選手として今も記録保持。" },
  },
  // ── t010 ─────────────────────────────────────────────────────────────────
  t010: {
    tr: { teaser: "2026 Dünya Kupası'nda kaç maç oynanacak?", reveal: "104 maç; 32 takımlı formattaki 64 maçtan artırıldı." },
    es: { teaser: "¿Cuántos partidos tendrá el Mundial 2026?", reveal: "104 partidos, frente a los 64 del formato de 32 equipos." },
    fr: { teaser: "Combien de matchs y aura-t-il à la Coupe du Monde 2026 ?", reveal: "104 matchs, contre 64 dans le format à 32 équipes." },
    de: { teaser: "Wie viele Spiele wird die WM 2026 umfassen?", reveal: "104 Spiele, gegenüber 64 im 32-Team-Format." },
    pt: { teaser: "Quantas partidas terá a Copa do Mundo 2026?", reveal: "104 partidas, ante 64 no formato de 32 seleções." },
    ar: { teaser: "كم مباراة ستُقام في كأس العالم 2026؟", reveal: "104 مباريات، بزيادة عن 64 في نظام 32 منتخباً." },
    ja: { teaser: "2026年ワールドカップの試合数は？", reveal: "104試合 — 32チーム制の64試合から増加。" },
  },
  // ── t011 ─────────────────────────────────────────────────────────────────
  t011: {
    tr: { teaser: "2026 Dünya Kupası'nda ilk kez hangi eleme turu oynandı?", reveal: "Son 32; 48 takıma genişletilmiş formatla oluşturulan yeni tur." },
    es: { teaser: "¿Qué nueva ronda eliminatoria debuta en el Mundial 2026?", reveal: "Los dieciseisavos de final (Ronda de 32), creada con el campo ampliado de 48 equipos." },
    fr: { teaser: "Quel nouveau tour éliminatoire fait ses débuts à la Coupe du Monde 2026 ?", reveal: "Les 32es de finale, créés avec l'expansion à 48 équipes." },
    de: { teaser: "Welche neue K.-o.-Runde debütiert bei der WM 2026?", reveal: "Die Runde der 32, entstanden durch das erweiterte 48-Team-Feld." },
    pt: { teaser: "Qual nova fase eliminatória estreia na Copa do Mundo 2026?", reveal: "A Rodada de 32, criada com a expansão para 48 seleções." },
    ar: { teaser: "ما الدور التصفوي الجديد الذي يُستحدث في كأس العالم 2026؟", reveal: "دور الـ32، الذي جاء بسبب التوسع إلى 48 منتخباً." },
    ja: { teaser: "2026年ワールドカップで初登場する新ラウンドは？", reveal: "ラウンドオブ32。48チームへの拡大で生まれた。" },
  },
  // ── t012 ─────────────────────────────────────────────────────────────────
  t012: {
    tr: { teaser: "2026 Dünya Kupası'nda kaç grup var?", reveal: "A'dan L'ye kadar etiketlenmiş, her birinde 4 takım olan 12 grup." },
    es: { teaser: "¿Cuántos grupos hay en el Mundial 2026?", reveal: "12 grupos de cuatro equipos, etiquetados de la A a la L." },
    fr: { teaser: "Combien de groupes y a-t-il à la Coupe du Monde 2026 ?", reveal: "12 groupes de quatre équipes, étiquetés de A à L." },
    de: { teaser: "Wie viele Gruppen gibt es bei der WM 2026?", reveal: "12 Gruppen mit je vier Teams, beschriftet von A bis L." },
    pt: { teaser: "Quantos grupos há na Copa do Mundo 2026?", reveal: "12 grupos de quatro seleções, rotulados de A a L." },
    ar: { teaser: "كم مجموعة في كأس العالم 2026؟", reveal: "12 مجموعة من أربعة منتخبات، مصنّفة من A إلى L." },
    ja: { teaser: "2026年ワールドカップのグループ数は？", reveal: "AからLまでラベルの付いた4チームずつ12グループ。" },
  },
  // ── t013 ─────────────────────────────────────────────────────────────────
  t013: {
    tr: { teaser: "2026 Dünya Kupası finali nerede oynanıyor?", reveal: "New Jersey, East Rutherford'daki MetLife Stadyumu'nda." },
    es: { teaser: "¿Dónde se jugará la final del Mundial 2026?", reveal: "En el MetLife Stadium de East Rutherford, Nueva Jersey." },
    fr: { teaser: "Où se joue la finale de la Coupe du Monde 2026 ?", reveal: "Au MetLife Stadium à East Rutherford, New Jersey." },
    de: { teaser: "Wo findet das Finale der WM 2026 statt?", reveal: "Im MetLife Stadium in East Rutherford, New Jersey." },
    pt: { teaser: "Onde será a final da Copa do Mundo 2026?", reveal: "No MetLife Stadium, em East Rutherford, Nova Jersey." },
    ar: { teaser: "أين تُقام نهائي كأس العالم 2026؟", reveal: "في ملعب ميتلايف بإيست راذرفورد، نيو جيرسي." },
    ja: { teaser: "2026年ワールドカップ決勝の開催地は？", reveal: "ニュージャージー州イーストラザーフォードのメットライフ・スタジアム。" },
  },
  // ── t014 ─────────────────────────────────────────────────────────────────
  t014: {
    tr: { teaser: "2026 Dünya Kupası'nın açılış maçı hangi stadyumda oynanıyor?", reveal: "Meksika City'deki Estadio Azteca'da." },
    es: { teaser: "¿Qué estadio alberga el partido inaugural del Mundial 2026?", reveal: "El Estadio Azteca en Ciudad de México." },
    fr: { teaser: "Quel stade accueille le match d'ouverture du Mondial 2026 ?", reveal: "L'Estadio Azteca à Mexico." },
    de: { teaser: "Welches Stadion beherbergt das Eröffnungsspiel der WM 2026?", reveal: "Das Estadio Azteca in Mexiko-Stadt." },
    pt: { teaser: "Qual estádio sedia a partida de abertura da Copa do Mundo 2026?", reveal: "O Estadio Azteca na Cidade do México." },
    ar: { teaser: "أي ملعب يستضيف مباراة افتتاح كأس العالم 2026؟", reveal: "ملعب أزتيكا في مكسيكو سيتي." },
    ja: { teaser: "2026年ワールドカップ開幕戦を開催するスタジアムは？", reveal: "メキシコシティのエスタディオ・アステカ。" },
  },
  // ── t015 ─────────────────────────────────────────────────────────────────
  t015: {
    tr: { teaser: "Dünya Kupası'nı üç kez kazanan tek oyuncu kim?", reveal: "Brezilyalı Pelé — 1958, 1962 ve 1970'te şampiyon." },
    es: { teaser: "¿Quién es el único jugador que ha ganado tres Copas del Mundo?", reveal: "Pelé de Brasil — campeón en 1958, 1962 y 1970." },
    fr: { teaser: "Qui est le seul joueur à avoir remporté trois fois la Coupe du Monde ?", reveal: "Pelé du Brésil — champion en 1958, 1962 et 1970." },
    de: { teaser: "Wer ist der einzige Spieler, der dreimal die WM gewonnen hat?", reveal: "Pelé aus Brasilien — Weltmeister 1958, 1962 und 1970." },
    pt: { teaser: "Quem é o único jogador a vencer a Copa do Mundo três vezes?", reveal: "Pelé do Brasil — campeão em 1958, 1962 e 1970." },
    ar: { teaser: "من هو اللاعب الوحيد الذي فاز بكأس العالم ثلاث مرات؟", reveal: "بيليه البرازيلي — بطلاً في 1958 و1962 و1970." },
    ja: { teaser: "ワールドカップを3回制した唯一の選手は？", reveal: "ブラジルのペレ — 1958、1962、1970年に優勝。" },
  },
  // ── t017 ─────────────────────────────────────────────────────────────────
  t017: {
    tr: { teaser: "Katar'daki 2022 Dünya Kupası'nı kim kazandı?", reveal: "Arjantin; 3–3'lük beraberliğin ardından Fransa'yı penaltılarda yendi." },
    es: { teaser: "¿Quién ganó el Mundial de 2022 en Qatar?", reveal: "Argentina, venciendo a Francia en penaltis tras un empate 3–3." },
    fr: { teaser: "Qui a remporté la Coupe du Monde 2022 au Qatar ?", reveal: "L'Argentine, battant la France aux tirs au but après un nul 3–3." },
    de: { teaser: "Wer gewann die WM 2022 in Katar?", reveal: "Argentinien, das Frankreich im Elfmeterschießen nach einem 3:3 bezwang." },
    pt: { teaser: "Quem venceu a Copa do Mundo de 2022 no Qatar?", reveal: "A Argentina, vencendo a França nos pênaltis após empate 3–3." },
    ar: { teaser: "من فاز بكأس العالم 2022 في قطر؟", reveal: "الأرجنتين، متغلبةً على فرنسا بركلات الترجيح بعد تعادل 3–3." },
    ja: { teaser: "カタールでの2022年ワールドカップを制したのは？", reveal: "アルゼンチン。3–3の引き分けの末、PK戦でフランスを下した。" },
  },
  // ── t046 ─────────────────────────────────────────────────────────────────
  t046: {
    tr: { teaser: "2010'da ilk Dünya Kupası şampiyonluğunu kazanan ülke hangisi?", reveal: "İspanya; finalde Hollanda'yı yendi." },
    es: { teaser: "¿Qué nación ganó su primera Copa del Mundo en 2010?", reveal: "España, derrotando a los Países Bajos en la final." },
    fr: { teaser: "Quelle nation a remporté sa première Coupe du Monde en 2010 ?", reveal: "L'Espagne, battant les Pays-Bas en finale." },
    de: { teaser: "Welche Nation gewann 2010 ihre erste Weltmeisterschaft?", reveal: "Spanien, das die Niederlande im Finale besiegte." },
    pt: { teaser: "Qual nação ganhou sua primeira Copa do Mundo em 2010?", reveal: "A Espanha, vencendo os Países Baixos na final." },
    ar: { teaser: "أي دولة فازت بكأس العالم لأول مرة في 2010؟", reveal: "إسبانيا، متغلبةً على هولندا في النهائي." },
    ja: { teaser: "2010年に初めてワールドカップを制した国は？", reveal: "スペイン、決勝でオランダを破った。" },
  },
  // ── t049 ─────────────────────────────────────────────────────────────────
  t049: {
    tr: { teaser: "2014 Dünya Kupası'nı hangi ülke kazandı?", reveal: "Almanya; uzatmaların ardından Arjantin'i 1–0 yendi." },
    es: { teaser: "¿Qué país ganó el Mundial 2014?", reveal: "Alemania, venciendo a Argentina 1–0 tras la prórroga." },
    fr: { teaser: "Quel pays a remporté la Coupe du Monde 2014 ?", reveal: "L'Allemagne, battant l'Argentine 1–0 après la prolongation." },
    de: { teaser: "Welches Land gewann die WM 2014?", reveal: "Deutschland, das Argentinien nach Verlängerung 1:0 bezwang." },
    pt: { teaser: "Qual país venceu a Copa do Mundo de 2014?", reveal: "A Alemanha, derrotando a Argentina por 1–0 na prorrogação." },
    ar: { teaser: "أي دولة فازت بكأس العالم 2014؟", reveal: "ألمانيا، متغلبةً على الأرجنتين 1–0 بعد الوقت الإضافي." },
    ja: { teaser: "2014年ワールドカップを制した国は？", reveal: "ドイツ、延長戦の末にアルゼンチンを1–0で下した。" },
  },
  // ── t061 ─────────────────────────────────────────────────────────────────
  t061: {
    tr: { teaser: "Dünya Kupası finalinde yenilen takımda hat-trick yapan kim?", reveal: "Kylian Mbappé; 2022 finalinde." },
    es: { teaser: "¿Quién marcó un hat-trick en una final del Mundial perdida?", reveal: "Kylian Mbappé, en la final de 2022." },
    fr: { teaser: "Qui a réalisé un triplé dans une finale de Coupe du Monde perdue ?", reveal: "Kylian Mbappé, lors de la finale 2022." },
    de: { teaser: "Wer schoss einen Hattrick in einem verlorenen WM-Finale?", reveal: "Kylian Mbappé, im Finale 2022." },
    pt: { teaser: "Quem marcou um hat-trick em uma final de Copa do Mundo perdida?", reveal: "Kylian Mbappé, na final de 2022." },
    ar: { teaser: "من سجل هاتريك في نهائي كأس عالم خسره؟", reveal: "كيليان مبابي، في نهائي 2022." },
    ja: { teaser: "負けたワールドカップ決勝でハットトリックを決めた選手は？", reveal: "キリアン・エムバペ、2022年決勝にて。" },
  },
  // ── t062 ─────────────────────────────────────────────────────────────────
  t062: {
    tr: { teaser: "2022'de yarı finale çıkan Afrika ülkesi hangisi?", reveal: "Fas — bunu başaran ilk Afrika takımı." },
    es: { teaser: "¿Qué nación africana llegó a las semifinales en 2022?", reveal: "Marruecos — el primer equipo africano en lograrlo." },
    fr: { teaser: "Quelle nation africaine a atteint les demi-finales en 2022 ?", reveal: "Le Maroc — la première équipe africaine à le faire." },
    de: { teaser: "Welche afrikanische Nation erreichte 2022 das Halbfinale?", reveal: "Marokko — das erste afrikanische Team, dem das gelang." },
    pt: { teaser: "Qual nação africana chegou às semifinais em 2022?", reveal: "Marrocos — a primeira seleção africana a conseguir." },
    ar: { teaser: "أي دولة أفريقية وصلت إلى نصف نهائي 2022؟", reveal: "المغرب — أول منتخب أفريقي يحقق ذلك." },
    ja: { teaser: "2022年にベスト4に進出したアフリカの国は？", reveal: "モロッコ — アフリカ勢初の快挙。" },
  },
  // ── t087 ─────────────────────────────────────────────────────────────────
  t087: {
    tr: { teaser: "2022 çeyrek finalinde Brezilya'yı eleyen ülke hangisi?", reveal: "Hırvatistan, penaltı atışlarıyla." },
    es: { teaser: "¿Qué país eliminó a Brasil en los cuartos de final de 2022?", reveal: "Croacia, en penaltis." },
    fr: { teaser: "Quel pays a éliminé le Brésil en quart de finale 2022 ?", reveal: "La Croatie, aux tirs au but." },
    de: { teaser: "Welches Land schied Brasilien im Viertelfinale 2022 aus?", reveal: "Kroatien, im Elfmeterschießen." },
    pt: { teaser: "Qual país eliminou o Brasil nas quartas de final de 2022?", reveal: "A Croácia, nos pênaltis." },
    ar: { teaser: "أي دولة أقصت البرازيل في ربع نهائي 2022؟", reveal: "كرواتيا، عبر ركلات الترجيح." },
    ja: { teaser: "2022年準々決勝でブラジルを敗退させた国は？", reveal: "クロアチア、PK戦で。" },
  },
  // ── t088 ─────────────────────────────────────────────────────────────────
  t088: {
    tr: { teaser: "İngiltere kaç Dünya Kupası şampiyonluğuna sahip?", reveal: "Bir; 1966'da." },
    es: { teaser: "¿Cuántos títulos mundiales tiene Inglaterra?", reveal: "Uno, en 1966." },
    fr: { teaser: "Combien de titres mondiaux l'Angleterre possède-t-elle ?", reveal: "Un seul, en 1966." },
    de: { teaser: "Wie viele WM-Titel hat England gewonnen?", reveal: "Einen, im Jahr 1966." },
    pt: { teaser: "Quantos títulos mundiais a Inglaterra possui?", reveal: "Um, em 1966." },
    ar: { teaser: "كم لقباً عالمياً تملك إنجلترا؟", reveal: "لقب واحد، عام 1966." },
    ja: { teaser: "イングランドのワールドカップ優勝回数は？", reveal: "1回、1966年。" },
  },
  // ── t093 ─────────────────────────────────────────────────────────────────
  t093: {
    tr: { teaser: "2006 Dünya Kupası'nı hangi ülke kazandı?", reveal: "İtalya; Fransa'yı penaltılarda yendi." },
    es: { teaser: "¿Qué país ganó el Mundial 2006?", reveal: "Italia, venciendo a Francia en penaltis." },
    fr: { teaser: "Quel pays a remporté la Coupe du Monde 2006 ?", reveal: "L'Italie, battant la France aux tirs au but." },
    de: { teaser: "Welches Land gewann die WM 2006?", reveal: "Italien, das Frankreich im Elfmeterschießen besiegte." },
    pt: { teaser: "Qual país venceu a Copa do Mundo de 2006?", reveal: "A Itália, vencendo a França nos pênaltis." },
    ar: { teaser: "أي دولة فازت بكأس العالم 2006؟", reveal: "إيطاليا، متغلبةً على فرنسا بركلات الترجيح." },
    ja: { teaser: "2006年ワールドカップを制した国は？", reveal: "イタリア、PK戦でフランスを破った。" },
  },
  // ── t096 ─────────────────────────────────────────────────────────────────
  t096: {
    tr: { teaser: "2018 finalinde Fransa'nın rakibi olan ülke hangisi?", reveal: "Hırvatistan." },
    es: { teaser: "¿Qué país llegó a la final de 2018 junto a Francia?", reveal: "Croacia." },
    fr: { teaser: "Quel pays a atteint la finale 2018 aux côtés de la France ?", reveal: "La Croatie." },
    de: { teaser: "Welches Land stand neben Frankreich im Finale 2018?", reveal: "Kroatien." },
    pt: { teaser: "Qual país chegou à final de 2018 ao lado da França?", reveal: "A Croácia." },
    ar: { teaser: "أي دولة وصلت إلى نهائي 2018 إلى جانب فرنسا؟", reveal: "كرواتيا." },
    ja: { teaser: "2018年決勝でフランスと対戦した国は？", reveal: "クロアチア。" },
  },
  // ── t100 ─────────────────────────────────────────────────────────────────
  t100: {
    tr: { teaser: "2026'da 12 gruptan kaç üçüncü takım eleme turuna geçiyor?", reveal: "En iyi sekiz üçüncü takım ilerliyor." },
    es: { teaser: "¿Cuántos terceros de los 12 grupos pasan a la fase eliminatoria en 2026?", reveal: "Los ocho mejores terceros avanzarán." },
    fr: { teaser: "Combien des 12 équipes troisièmes atteignent le tour éliminatoire en 2026 ?", reveal: "Les huit meilleures troisièmes équipes avancent." },
    de: { teaser: "Wie viele der 12 Gruppendrittplatzierten erreichen 2026 die K.-o.-Runde?", reveal: "Die acht besten Drittplatzierten kommen weiter." },
    pt: { teaser: "Quantas das 12 seleções em terceiro alcançam a fase eliminatória em 2026?", reveal: "As oito melhores terceiras colocadas avançam." },
    ar: { teaser: "كم منتخباً من 12 منتخباً ثالثاً يتأهل إلى الأدوار الإقصائية في 2026؟", reveal: "أفضل ثمانية منتخبات ثالثة تتأهل." },
    ja: { teaser: "2026年の12グループ中、何チームの3位がノックアウトステージに進む？", reveal: "最上位8チームの3位が進出。" },
  },
};
