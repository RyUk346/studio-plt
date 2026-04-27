// utils/moderation.js

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[!1|]/g, "i")
    .replace(/[$5]/g, "s")
    .replace(/[0]/g, "o")
    .replace(/[^a-z0-9]/g, "");
}

function collapseRepeats(text = "") {
  return text.replace(/(.)\1+/g, "$1");
}

const bannedPatterns = [
  /f+u*c+k+/,
  /s+h+i*t+/,
  /b+i+t+c+h+/,
  /c+u+n+t+/,
  /d+i+c+k+/,
  /a+s+s+h+o+l+e+/,
  /b+a+s+t+a+r+d+/,
  /w+h+o+r+e+/,
  /s+l+u+t+/,
];

export function findPolicyViolations(text = "") {
  const normalized = collapseRepeats(normalizeText(text));
  return bannedPatterns.filter((pattern) => pattern.test(normalized));
}

export function isMessageSafe(text = "") {
  return findPolicyViolations(text).length === 0;
}
