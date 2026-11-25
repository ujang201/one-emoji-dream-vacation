// One Emoji, One Dream Vacation — postcard picker.
//
// The judge reads two emojis and picks the one that most makes a stranger
// want to book the trip, weighing (in order): exactly one emoji naming a
// dream vacation, vivid postcard feel, personal and specific, a spark of
// wit or surprise, and instant readability across cultures and screens.
//
// This program scores a shortlist of candidate postcards against those five
// criteria, in the judge's own order, and writes the winner — one emoji,
// nothing else — to /output/entry.txt. No randomness, no network, no input:
// the same run always writes the same four bytes.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The five judge criteria, most important first, each scored 0-5.
type Criteria = [number, number, number, number, number];

interface Postcard {
  emoji: string;
  name: string;
  // [names the dream, vivid postcard, specific not generic, wit/surprise, reads instantly]
  scores: Criteria;
}

const CANDIDATES: Postcard[] = [
  { emoji: "\u{1F3DD}", name: "desert island", scores: [5, 5, 2, 2, 5] },
  { emoji: "\u{1F3D6}", name: "beach with umbrella", scores: [5, 5, 2, 2, 5] },
  { emoji: "\u{1F6EB}", name: "airplane departure", scores: [4, 3, 2, 2, 5] },
  { emoji: "\u{1F304}", name: "sunrise over mountains", scores: [4, 5, 3, 3, 5] },
  { emoji: "\u{1F5FB}", name: "Mount Fuji", scores: [5, 5, 5, 4, 5] },
  { emoji: "\u{26F5}", name: "sailboat", scores: [4, 4, 3, 3, 5] },
  { emoji: "\u{1F6A3}", name: "rowboat", scores: [3, 3, 3, 3, 4] },
  { emoji: "\u{1F3D4}", name: "snow-capped mountain", scores: [5, 4, 3, 3, 5] },
];

// Lexicographic comparison in the judge's priority order: the first
// criterion where two postcards differ decides, exactly as the brief says.
function beats(a: Postcard, b: Postcard): boolean {
  for (let i = 0; i < a.scores.length; i++) {
    if (a.scores[i] !== b.scores[i]) return a.scores[i] > b.scores[i];
  }
  return false;
}

function pickWinner(cards: Postcard[]): Postcard {
  let best = cards[0];
  for (const card of cards.slice(1)) {
    if (beats(card, best)) best = card;
  }
  return best;
}

const winner = pickWinner(CANDIDATES);

// The gate allows 1-8 characters of UTF-8 text, not only whitespace.
// One emoji, no trailing newline: exactly four bytes, one character.
const text = winner.emoji;
const chars = [...text].length;
if (chars !== 1 || text.trim().length === 0) {
  throw new Error(`entry must be exactly one emoji, got ${chars} characters`);
}

const outPath = process.env.OUTPUT_PATH ?? "/output/entry.txt";
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, text, "utf8");

// Read back and confirm the file holds exactly the winning emoji: a
// silent short write or a stray newline would fail the gate.
const written = readFileSync(outPath, "utf8");
if (written !== text) {
  throw new Error(`read-back mismatch: wrote ${JSON.stringify(text)}, file holds ${JSON.stringify(written)}`);
}
console.log(`wrote ${winner.name} ${text} (${Buffer.byteLength(text, "utf8")} bytes) to ${outPath}`);
