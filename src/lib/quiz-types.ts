export type WaistFit = "snug" | "slightly-relaxed" | "relaxed";
export type Rise = "high" | "mid" | "low";
export type ThighFit = "fitted" | "relaxed" | "loose";
export type FitFrustration =
  | "waist-gap"
  | "hip-tightness"
  | "wrong-length"
  | "thigh-fit"
  | "rise"
  | "other";

export interface BrandSize {
  brand: string;
  size: string;
}

export interface FitProfile {
  height: string;
  weight?: number;
  waist: number;
  hip: number;
  waistFit: WaistFit;
  rise: Rise;
  thighFit: ThighFit;
  brands: string[];
  brandSizes: BrandSize[];
  frustration: FitFrustration;
  completedAt: string;
  source: "manual" | "voice";
}

export type QuestionId =
  | "height"
  | "weight"
  | "waist"
  | "hip"
  | "waistFit"
  | "rise"
  | "thighFit"
  | "brands"
  | "brandSizes"
  | "frustration";

export interface QuizStep {
  id: QuestionId;
  title: string;
  subtitle: string;
  why: string;
}
