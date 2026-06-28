import {
  DENIM_BRANDS,
  FRUSTRATION_OPTIONS,
  HEIGHTS,
  HIPS,
  RISE_OPTIONS,
  THIGH_FIT_OPTIONS,
  WAIST_FIT_OPTIONS,
  WAISTS,
} from "./quiz-data";
import type { FitFrustration, Rise, ThighFit, WaistFit } from "./quiz-types";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordToNumber(word: string): number | null {
  const map: Record<string, number> = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
  };
  return map[word] ?? null;
}

function parseSpokenNumber(text: string): number | null {
  const n = normalize(text);
  const direct = n.match(/\b(\d{2,3})\b/);
  if (direct) return parseInt(direct[1], 10);

  const feetInch = n.match(/(\d+|one|two|three|four|five|six)\s*(?:foot|feet|ft|f)\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven)?/);
  if (feetInch) {
    const ft = parseInt(feetInch[1], 10) || wordToNumber(feetInch[1]) || 0;
    const inchRaw = feetInch[2];
    const inch = inchRaw
      ? parseInt(inchRaw, 10) || wordToNumber(inchRaw) || 0
      : 0;
    return ft * 12 + inch;
  }

  const words = n.split(" ");
  let total = 0;
  for (const w of words) {
    const num = parseInt(w, 10);
    if (!isNaN(num)) total = total * 10 + num;
    else {
      const mapped = wordToNumber(w);
      if (mapped !== null) total += mapped;
    }
  }
  return total > 0 ? total : null;
}

function closestHeight(totalInches: number): string | null {
  let best: string | null = null;
  let bestDiff = Infinity;
  for (const h of HEIGHTS) {
    const match = h.match(/(\d+)'(\d+)"/);
    if (!match) continue;
    const inches = parseInt(match[1], 10) * 12 + parseInt(match[2], 10);
    const diff = Math.abs(inches - totalInches);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = h;
    }
  }
  return bestDiff <= 2 ? best : null;
}

export function parseHeight(text: string): string | null {
  const n = normalize(text);
  const explicit = n.match(/(\d)\s*(\d{1,2})/);
  if (explicit) {
    const candidate = `${explicit[1]}'${explicit[2]}"`;
    if (HEIGHTS.includes(candidate)) return candidate;
  }

  const ftInMatch = n.match(/(\d+|one|two|three|four|five|six)\s*(?:foot|feet|ft|f)\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven)?/);
  if (ftInMatch) {
    const ft = parseInt(ftInMatch[1], 10) || wordToNumber(ftInMatch[1]) || 0;
    const inchRaw = ftInMatch[2];
    const inch = inchRaw
      ? parseInt(inchRaw, 10) || wordToNumber(inchRaw) || 0
      : 0;
    const candidate = `${ft}'${inch}"`;
    if (HEIGHTS.includes(candidate)) return candidate;
    return closestHeight(ft * 12 + inch);
  }

  const total = parseSpokenNumber(text);
  if (total && total >= 58 && total <= 74) return closestHeight(total);

  for (const h of HEIGHTS) {
    const compact = h.replace(/['"]/g, "");
    if (n.includes(compact.replace(" ", "")) || n.includes(compact)) return h;
  }
  return null;
}

export function parseWeight(text: string): number | null | "skip" {
  const n = normalize(text);
  if (
    n.includes("skip") ||
    n.includes("pass") ||
    n.includes("rather not") ||
    n.includes("no thanks") ||
    n.includes("prefer not") ||
    n.includes("dont know") ||
    n.includes("don't know")
  ) {
    return "skip";
  }
  const num = parseSpokenNumber(text);
  if (num && num >= 70 && num <= 400) return num;
  return null;
}

export function parseInches(text: string, range: number[]): number | null {
  const n = normalize(text);
  const about = n.match(/(?:about|around|roughly)?\s*(\d{2})/);
  if (about) {
    const val = parseInt(about[1], 10);
    if (range.includes(val)) return val;
    const closest = range.reduce((a, b) =>
      Math.abs(b - val) < Math.abs(a - val) ? b : a
    );
    if (Math.abs(closest - val) <= 2) return closest;
  }
  const num = parseSpokenNumber(text);
  if (num && range.includes(num)) return num;
  if (num) {
    const closest = range.reduce((a, b) =>
      Math.abs(b - num) < Math.abs(a - num) ? b : a
    );
    if (Math.abs(closest - num) <= 2) return closest;
  }
  return null;
}

export function parseWaist(text: string): number | null {
  return parseInches(text, WAISTS);
}

export function parseHip(text: string): number | null {
  return parseInches(text, HIPS);
}

function matchOption<T extends string>(
  text: string,
  options: { value: T; label: string }[],
  aliases: Record<string, T> = {}
): T | null {
  const n = normalize(text);
  for (const [alias, value] of Object.entries(aliases)) {
    if (n.includes(alias)) return value;
  }
  for (const opt of options) {
    const label = normalize(opt.label);
    if (n.includes(label) || n.includes(normalize(opt.value))) return opt.value;
  }
  return null;
}

export function parseWaistFit(text: string): WaistFit | null {
  return matchOption(text, WAIST_FIT_OPTIONS, {
    tight: "snug",
    snug: "snug",
    form: "snug",
    slightly: "slightly-relaxed",
    "slightly relaxed": "slightly-relaxed",
    "little loose": "slightly-relaxed",
    relaxed: "relaxed",
    loose: "relaxed",
    roomy: "relaxed",
  });
}

export function parseRise(text: string): Rise | null {
  return matchOption(text, RISE_OPTIONS, {
    high: "high",
    "high rise": "high",
    mid: "mid",
    medium: "mid",
    "mid rise": "mid",
    low: "low",
    "low rise": "low",
    hip: "low",
  });
}

export function parseThighFit(text: string): ThighFit | null {
  return matchOption(text, THIGH_FIT_OPTIONS, {
    fitted: "fitted",
    slim: "fitted",
    tight: "fitted",
    skinny: "fitted",
    relaxed: "relaxed",
    loose: "loose",
    baggy: "loose",
    wide: "loose",
  });
}

export function parseBrands(text: string): string[] {
  const n = normalize(text);
  const found: string[] = [];
  for (const brand of DENIM_BRANDS) {
    const brandNorm = normalize(brand);
    if (n.includes(brandNorm) || n.includes(brandNorm.replace(/\s/g, ""))) {
      found.push(brand);
    }
  }
  if (
    found.length === 0 &&
    (n.includes("none") ||
      n.includes("no brand") ||
      n.includes("never") ||
      n.includes("havent") ||
      n.includes("haven't"))
  ) {
    return [];
  }
  return found;
}

export function parseBrandSize(text: string): string | null {
  const n = normalize(text);
  const sizeMatch = n.match(/\b(\d{1,2}|xs|s|m|l|xl|xxl|xxxl)\b/i);
  if (sizeMatch) return sizeMatch[1].toUpperCase();
  const num = parseSpokenNumber(text);
  if (num && num >= 0 && num <= 40) return String(num);
  return null;
}

export function parseFrustration(text: string): FitFrustration | null {
  return matchOption(text, FRUSTRATION_OPTIONS, {
    gap: "waist-gap",
    "waist gap": "waist-gap",
    gapping: "waist-gap",
    hip: "hip-tightness",
    tight: "hip-tightness",
    "hip tight": "hip-tightness",
    length: "wrong-length",
    short: "wrong-length",
    long: "wrong-length",
    thigh: "thigh-fit",
    rise: "rise",
    other: "other",
    everything: "other",
  });
}

export function isAffirmative(text: string): boolean {
  const n = normalize(text);
  return /^(yes|yeah|yep|yup|correct|right|sure|ok|okay|that s right|exactly|affirmative)/.test(
    n
  );
}

export function isNegative(text: string): boolean {
  const n = normalize(text);
  return /^(no|nope|nah|wrong|incorrect|not really|change|redo)/.test(n);
}
