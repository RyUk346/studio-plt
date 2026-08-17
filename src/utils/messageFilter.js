// utils/moderation.js

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[!1|]/g, "i")
    .replace(/[$5]/g, "s")
    .replace(/[0]/g, "o")
    .replace(/[3]/g, "e")
    .replace(/[7]/g, "t")
    .replace(/[^a-z0-9]/g, "");
}

function collapseRepeats(text = "") {
  return text.replace(/(.)\1+/g, "$1");
}

const bannedWords = [
  // Core profanity
  "fuck",
  "fuk",
  "shit",
  "bitch",
  "bastard",
  "asshole",
  "arsehole",
  "cunt",
  "dick",
  "piss",
  "slut",
  "whore",

  // Strong slang / shortened abuse
  "mf",
  "mfer",
  "mofo",
  "motherfucker",
  "wtf",
  "stfu",
  "gtfo",
  "bullshit",
  "bs",
  "jackass",
  "douche",
  "douchebag",
  "prick",
  "twat",

  // UK abusive slang
  "wanker",
  "tosser",
  "bellend",
  "knobhead",
  "numpty",
  "git",
  "muppet",
  "plonker",
  "twit",

  // Aggressive insults
  "scumbag",
  "dumbass",
  "shithead",
  "dipshit",
  "fuckwit",
  "asshat",
  "cretin",
  "degenerate",

  // Negative personal attacks
  "idiot",
  "moron",
  "loser",
  "stupid",
  "trash",
  "garbage",
  "clown",
  "fool",
  "pathetic",
  "worthless",
  "useless",
  "disgusting",
  "failure",
  "freak",
  "weirdo",

  // Harmful phrases collapsed by normalization
  "killyourself",
  "kys",
  "die",
];

const bannedPatterns = [
  // Core profanity patterns
  /f+u*c+k+/,
  /f+u+k+/,
  /s+h+i*t+/,
  /b+i+t+c+h+/,
  /c+u+n+t+/,
  /d+i+c+k+/,
  /a+s+s+h+o+l+e+/,
  /a+r+s+e+h+o+l+e+/,
  /b+a+s+t+a+r+d+/,
  /w+h+o+r+e+/,
  /s+l+u+t+/,

  // Slang / abbreviations
  /m+o+f+o+/,
  /m+f+e*r+/,
  /w+t+f+/,
  /s+t+f+u+/,
  /g+t+f+o+/,

  // UK slang
  /w+a+n+k+e+r+/,
  /t+o+s+s+e+r+/,
  /b+e+l+l+e+n+d+/,
  /k+n+o+b+h+e+a+d+/,
  /p+l+o+n+k+e+r+/,

  // Aggressive insults
  /s+c+u+m+b+a+g+/,
  /d+u+m+b+a+s+s+/,
  /s+h+i*t+h+e+a+d+/,
  /d+i+p+s+h+i*t+/,
  /f+u*c+k+w+i+t+/,

  // Harmful phrases
  /k+i+l+l+y+o+u+r+s+e+l+f+/,
  /k+y+s+/,
];

export function findPolicyViolations(text = "") {
  const normalized = collapseRepeats(normalizeText(text));

  const wordMatches = bannedWords.filter((word) =>
    normalized.includes(collapseRepeats(normalizeText(word))),
  );

  const patternMatches = bannedPatterns
    .filter((pattern) => pattern.test(normalized))
    .map((pattern) => pattern.toString());

  return [...new Set([...wordMatches, ...patternMatches])];
}

export function isMessageSafe(text = "") {
  return findPolicyViolations(text).length === 0;
}

/* ──────────────────────────────────────────────────────────────────────────
   REVIEW text check — deliberately NOT isMessageSafe.

   isMessageSafe is built for user-submitted motivational quotes: it blocks
   demotivational words ("stupid", "loser", "fool") and strips every space
   before substring-matching, so someone can't sneak "f u c k" past it. That
   is right for a submission box someone is actively trying to game.

   Applied to reviews it produces constant false positives, because after the
   spaces are removed ordinary words collide with banned ones:

     "absolutely" / "abs"  → contains "bs"      ← fatal in a Pilates studio
     "legit"               → contains "git"
     "who really ..."      → "whoreally" → contains "whore"
     "bodies"              → contains "die"

   That silently dropped real 5-star reviews and left gaps on the board.

   Reviewers aren't trying to evade a filter, and there are OpenAI moderation
   layers behind this one, so here we trade evasion-resistance for accuracy:
   split into words, then flag a word only if it STARTS with a core profanity
   (which still catches "fucking", "shitty", "dickhead"). "absolutely" does
   not start with "bs", so it passes.
   ────────────────────────────────────────────────────────────────────────── */
const coreProfanity = [
  "fuck",
  "fuk",
  "shit",
  "bitch",
  "bastard",
  "asshole",
  "arsehole",
  "ashole",
  "cunt",
  "dick",
  "piss",
  "slut",
  "whore",
];

export function isReviewTextSafe(text = "") {
  const words = String(text)
    .toLowerCase()
    // Leetspeak, but WITHOUT collapsing word boundaries.
    .replace(/[@4]/g, "a")
    .replace(/[!1|]/g, "i")
    .replace(/[$5]/g, "s")
    .replace(/[0]/g, "o")
    .replace(/[3]/g, "e")
    .replace(/[7]/g, "t")
    .split(/[^a-z]+/)
    .filter(Boolean)
    // Collapse stretched letters per word: "fuuuuck" → "fuck".
    .map((word) => word.replace(/(.)\1+/g, "$1"));

  return !words.some((word) =>
    coreProfanity.some((bad) =>
      word.startsWith(bad.replace(/(.)\1+/g, "$1")),
    ),
  );
}

export function sanitizeMessage(text = "") {
  return isMessageSafe(text) ? text : "";
}