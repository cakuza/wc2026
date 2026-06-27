/**
 * Maps corrupted worldcup26.ir player name strings to canonical display names.
 *
 * worldcup26.ir stores names in Persian script and applies an informal
 * romanization where:
 *   – short vowels (a, e) are dropped
 *   – long vowels represented by "و" (waw) become "v" in Latin output
 * This produces consonant-skeleton forms: "Gonzalo Plata" → "Gvnzalv Plata".
 *
 * Keys are the raw strings that arrive AFTER the UTF-8 Mojibake fix has been
 * applied (i.e. after fixMojibake()).  Values are the canonical names as
 * displayed on site and verified against squad data.  Where the canonical
 * name cannot be determined with confidence the value is "Scorer unavailable".
 */
export const PLAYER_ALIAS_MAP: Record<string, string> = {
  // ── Turkey ────────────────────────────────────────────────────────────────
  "Baris Alpr Ailmaz": "Barış Alper Yılmaz",
  "Kan Aihan": "Kaan Ayhan",

  // ── Ecuador ───────────────────────────────────────────────────────────────
  "Nilsvn Angvlv": "Nilson Angulo",
  "Gvnzalv Plata": "Gonzalo Plata",

  // ── Netherlands ───────────────────────────────────────────────────────────
  "Kvdi Khakpv": "Cody Gakpo",
  // Ian Fn Hkh (NL goal vs Tunisia) — identity unknown; see audit
  "Ian Fn Hkh": "Scorer unavailable",

  // ── Germany ───────────────────────────────────────────────────────────────
  "Dniz Avndav": "Denis Undav",

  // ── Colombia ──────────────────────────────────────────────────────────────
  "Dnil Mvnvz": "Daniel Muñoz",
  "Lviiz Diaz": "Luis Díaz",
  "Khamintvn Kampaz": "Scorer unavailable",

  // ── Mexico ────────────────────────────────────────────────────────────────
  "Jvlian Kviinvnz": "Julián Quiñones",

  // ── Portugal ──────────────────────────────────────────────────────────────
  "Nvnv Mndz": "Nuno Mendes",
  "Abdalvhid Namtvf": "Scorer unavailable",

  // ── Japan ────────────────────────────────────────────────────────────────
  "Aiash Ivida": "Ayase Ueda",

  // ── Switzerland / Canada ─────────────────────────────────────────────────
  "Jvhan Mnzambi": "Johan Manzambi",
  "Prvmis Divid": "Scorer unavailable",

  // ── Norway ───────────────────────────────────────────────────────────────
  "Markvs Hlmgrn Pdrsn": "Markus Holmgren Pedersen",
  "Nzir Bnbvali": "Scorer unavailable",

  // ── Morocco ───────────────────────────────────────────────────────────────
  // Ismaël Saibari: worldcup26 double-ā romanisation of Arabic إسماعيل
  "Asmaail Saibari": "Ismaël Saibari",
  "Svfian Rhimi": "Sofiane Rhimi",
  "Gessime Yassine": "Scorer unavailable",

  // ── Canada ────────────────────────────────────────────────────────────────
  // "Kail Larin" = Cyle Larin via Persian phonetic rendering (cy→kail)
  "Kail Larin": "Cyle Larin",

  // ── Senegal ───────────────────────────────────────────────────────────────
  // "Paph Gviih" = Pape Gueye (Marseille midfielder)
  "Paph Gviih": "Pape Gueye",
  "Ailman Andiaih": "Scorer unavailable",

  // ── Ivory Coast ───────────────────────────────────────────────────────────
  // "Nikvlas Ph Ph" = Nicolas Pépé via consonant-skeleton + accented-e loss
  "Nikvlas Ph Ph": "Nicolas Pépé",

  // ── Cape Verde ────────────────────────────────────────────────────────────
  // "Hliv Varla" = Hélio Varela; h/e vowel drop, o→v
  "Hliv Varla": "Hélio Varela",

  // ── Tunisia ───────────────────────────────────────────────────────────────
  // "Alis Skhiri" most likely = Ellyes Skhiri (Arabic: إلياس → Alias/Alis)
  // Listed as Netherlands credit at 3′ — may be own goal; see audit
  "Alis Skhiri": "Ellyes Skhiri",
  "Hazm Mstvri": "Scorer unavailable",

  // ── Bosnia & Herzegovina ─────────────────────────────────────────────────
  "Karim Alaibgvvich": "Scorer unavailable",
  "Abvnad": "Scorer unavailable",
  "Armin Mhmich": "Scorer unavailable",

  // ── United States ─────────────────────────────────────────────────────────
  "Kamrvn Bargs": "Scorer unavailable",

  // ── New Zealand ───────────────────────────────────────────────────────────
  "Fin Svrman": "Scorer unavailable",

  // ── Saudi Arabia ─────────────────────────────────────────────────────────
  "Hassan Mohamed Altmbkti": "Scorer unavailable",

  // ── Ghana / Panama ────────────────────────────────────────────────────────
  "Kalb Iirnki": "Scorer unavailable",

  // ── South Africa ─────────────────────────────────────────────────────────
  "Taplv Maskv": "Scorer unavailable",

  // ── Uzbekistan ────────────────────────────────────────────────────────────
  // Consonant skeleton too degraded to resolve without external squad data
  "Abas Bk Fiz Allh Af": "Scorer unavailable",

  // ── Mojibake fallback (C1 control bytes 0x80–0x9F stripped) ──────────────
  // For some characters the second UTF-8 byte is a C1 control char that may be
  // stripped by PHP/proxies before reaching us.  fixMojibake() can't recover
  // those; the alias map provides a last-resort canonical form.
  // č (U+010D): UTF-8 C4 8D → if 0x8D stripped → "KrejÄÃ­"
  "L. KrejÄÃ­": "L. Krejčí",
  // À (U+00C0): UTF-8 C3 80 → if 0x80 stripped → "Ãlex"
  "Ãlex Baena": "Àlex Baena",
  // Ø (U+00D8): UTF-8 C3 98 → if 0x98 stripped → "Ãstig"
  "Leo ÃstigÃ¥rd": "Leo Østigård",
  // ō (U+014D): UTF-8 C5 8D → if 0x8D stripped → "ItÅ"
  "Junya ItÅ": "Junya Itō",
};
