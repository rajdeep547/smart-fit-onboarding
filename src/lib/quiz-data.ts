import type {
  FitFrustration,
  Rise,
  ThighFit,
  WaistFit,
} from "./quiz-types";

export const MAIN_SITE_URL = "https://jackie-jeans.vercel.app/";
export const PROFILE_STORAGE_KEY = "jackie-fit-profile";

function generateHeights(): string[] {
  const heights: string[] = [];
  for (let ft = 4; ft <= 6; ft++) {
    const startIn = ft === 4 ? 10 : 0;
    const endIn = ft === 6 ? 2 : 11;
    for (let inch = startIn; inch <= endIn; inch++) {
      heights.push(`${ft}'${inch}"`);
    }
  }
  return heights;
}

export const HEIGHTS = generateHeights();
export const WAISTS = Array.from({ length: 29 }, (_, i) => 24 + i);
export const HIPS = Array.from({ length: 29 }, (_, i) => 32 + i);

export const WAIST_FIT_OPTIONS: { value: WaistFit; label: string }[] = [
  { value: "snug", label: "Snug" },
  { value: "slightly-relaxed", label: "Slightly relaxed" },
  { value: "relaxed", label: "Relaxed" },
];

export const RISE_OPTIONS: { value: Rise; label: string }[] = [
  { value: "high", label: "High rise" },
  { value: "mid", label: "Mid rise" },
  { value: "low", label: "Low rise" },
];

export const THIGH_FIT_OPTIONS: { value: ThighFit; label: string }[] = [
  { value: "fitted", label: "Fitted" },
  { value: "relaxed", label: "Relaxed" },
  { value: "loose", label: "Loose" },
];

export const DENIM_BRANDS = [
  "Levi's",
  "Wrangler",
  "Lee",
  "Madewell",
  "AG Jeans",
  "Citizens of Humanity",
  "Everlane",
  "Uniqlo",
  "Gap",
  "Old Navy",
  "American Eagle",
  "H&M",
  "Zara",
  "Topshop",
  "ASOS",
  "Reformation",
  "Good American",
  "DL1961",
  "Paige",
  "7 For All Mankind",
];

export const FRUSTRATION_OPTIONS: {
  value: FitFrustration;
  label: string;
}[] = [
  { value: "waist-gap", label: "Waist gap" },
  { value: "hip-tightness", label: "Hip tightness" },
  { value: "wrong-length", label: "Wrong length" },
  { value: "thigh-fit", label: "Thigh fit" },
  { value: "rise", label: "Rise" },
  { value: "other", label: "Other" },
];

export const QUIZ_STEPS = [
  {
    id: "height" as const,
    title: "What is your height?",
    subtitle: "We'll use this for inseam and length recommendations.",
    why: "Drives inseam / length recommendation",
  },
  {
    id: "weight" as const,
    title: "What is your weight?",
    subtitle: "Optional — helps calibrate proportional fit. Skip if you prefer.",
    why: "Calibrates proportional fit",
  },
  {
    id: "waist" as const,
    title: "Waist measurement",
    subtitle: "Narrowest point, in inches.",
    why: "Most direct sizing input",
  },
  {
    id: "hip" as const,
    title: "Hip measurement",
    subtitle: "Fullest point, in inches.",
    why: "Critical for denim fit",
  },
  {
    id: "waistFit" as const,
    title: "How do you like jeans at the waist?",
    subtitle: "Same measurements, different desired feel.",
    why: "Personal fit preference",
  },
  {
    id: "rise" as const,
    title: "Where should the waistband sit?",
    subtitle: "This narrows your style recommendation.",
    why: "Narrows style recommendation",
  },
  {
    id: "thighFit" as const,
    title: "How should jeans fit through the thighs?",
    subtitle: "The second most common fit complaint after waist.",
    why: "Thigh fit preference",
  },
  {
    id: "brands" as const,
    title: "Which denim brands have you bought?",
    subtitle: "Select all that apply — we'll calibrate against known sizing.",
    why: "Brand sizing calibration",
  },
  {
    id: "brandSizes" as const,
    title: "What size did you buy?",
    subtitle: "For each brand you selected.",
    why: "Ground truth for accuracy",
  },
  {
    id: "frustration" as const,
    title: "Biggest fit frustration?",
    subtitle: "We'll personalize your recommendation around this.",
    why: "Personalizes recommendation",
  },
];

export function getLabelForValue<T extends string>(
  options: { value: T; label: string }[],
  value: T
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function formatInches(n: number): string {
  return `${n}"`;
}
