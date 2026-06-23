import { GROUP_LETTERS, type GroupLetter } from "./teams";

/** Maps `/groups/group-a` → `"A"`. Returns null for invalid slugs. */
export function groupSlugToLetter(slug: string): GroupLetter | null {
  const match = /^group-([a-l])$/.exec(slug.toLowerCase());
  if (!match) return null;
  const letter = match[1].toUpperCase() as GroupLetter;
  return GROUP_LETTERS.includes(letter) ? letter : null;
}

/** Maps `"A"` → `"group-a"`. */
export function letterToGroupSlug(letter: string): string {
  return `group-${letter.toLowerCase()}`;
}

export function generateGroupStaticParams() {
  return GROUP_LETTERS.map((g) => ({ groupSlug: letterToGroupSlug(g) }));
}
