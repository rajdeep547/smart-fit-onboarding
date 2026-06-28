"use client";

import {
  FRUSTRATION_OPTIONS,
  getLabelForValue,
  RISE_OPTIONS,
  THIGH_FIT_OPTIONS,
  WAIST_FIT_OPTIONS,
} from "@/lib/quiz-data";
import type { FitProfile } from "@/lib/quiz-types";
import { buildRedirectUrl, redirectToMainSite } from "@/lib/quiz-storage";
import { useEffect, useState } from "react";

interface CompletionScreenProps {
  profile: FitProfile;
}

export function CompletionScreen({ profile }: CompletionScreenProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    redirectToMainSite(profile, 3500);
    const interval = window.setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [profile]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center animate-fade-in">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
        <svg
          className="h-10 w-10 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="font-serif text-3xl text-indigo-950">You&apos;re all set</h1>
      <p className="mt-3 max-w-sm text-stone-600">
        Your fit profile is ready. Taking you to Jackie Jeans in{" "}
        <span className="font-medium text-indigo-900">{countdown}</span>…
      </p>

      <div className="mt-8 w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
          Your fit snapshot
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Height</dt>
            <dd className="font-medium text-indigo-950">{profile.height}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Waist / Hip</dt>
            <dd className="font-medium text-indigo-950">
              {profile.waist}&quot; / {profile.hip}&quot;
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Preferred fit</dt>
            <dd className="font-medium text-indigo-950">
              {getLabelForValue(WAIST_FIT_OPTIONS, profile.waistFit)},{" "}
              {getLabelForValue(RISE_OPTIONS, profile.rise)} rise
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Thighs</dt>
            <dd className="font-medium text-indigo-950">
              {getLabelForValue(THIGH_FIT_OPTIONS, profile.thighFit)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Top frustration</dt>
            <dd className="font-medium text-indigo-950">
              {getLabelForValue(FRUSTRATION_OPTIONS, profile.frustration)}
            </dd>
          </div>
        </dl>
      </div>

      <a
        href={buildRedirectUrl(profile)}
        className="btn-primary mt-8 inline-block px-10"
      >
        Continue to Jackie Jeans
      </a>
    </div>
  );
}
