import { MAIN_SITE_URL, PROFILE_STORAGE_KEY } from "./quiz-data";
import type { FitProfile } from "./quiz-types";

export function saveFitProfile(profile: FitProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function loadFitProfile(): FitProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FitProfile;
  } catch {
    return null;
  }
}

export function buildRedirectUrl(profile: FitProfile): string {
  const encoded = btoa(JSON.stringify(profile));
  const url = new URL(MAIN_SITE_URL);
  url.searchParams.set("fitProfile", encoded);
  return url.toString();
}

export function redirectToMainSite(profile: FitProfile, delayMs = 2500): void {
  saveFitProfile(profile);
  const url = buildRedirectUrl(profile);
  window.setTimeout(() => {
    window.location.href = url;
  }, delayMs);
}
