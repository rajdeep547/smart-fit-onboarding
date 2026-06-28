"use client";

import { CompletionScreen } from "@/components/CompletionScreen";
import { JackieLogo } from "@/components/JackieLogo";
import { ProgressBar } from "@/components/ProgressBar";
import {
  FRUSTRATION_OPTIONS,
  getLabelForValue,
  RISE_OPTIONS,
  THIGH_FIT_OPTIONS,
  WAIST_FIT_OPTIONS,
} from "@/lib/quiz-data";
import type { BrandSize, FitProfile } from "@/lib/quiz-types";
import {
  isAffirmative,
  isNegative,
  parseBrandSize,
  parseBrands,
  parseFrustration,
  parseHeight,
  parseHip,
  parseRise,
  parseThighFit,
  parseWaist,
  parseWaistFit,
  parseWeight,
} from "@/lib/voice-parser";
import {
  getSpeechRecognition,
  listenOnce,
  preloadVoices,
  speak,
  stopSpeaking,
} from "@/lib/voice-engine";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type VoicePhase =
  | "intro"
  | "asking"
  | "listening"
  | "confirming"
  | "processing"
  | "complete"
  | "unsupported";

type VoiceStep =
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

const STEP_ORDER: VoiceStep[] = [
  "height",
  "weight",
  "waist",
  "hip",
  "waistFit",
  "rise",
  "thighFit",
  "brands",
  "brandSizes",
  "frustration",
];

interface PendingAnswer {
  raw: string;
  display: string;
  apply: () => void;
}

export function VoiceQuiz() {
  const [phase, setPhase] = useState<VoicePhase>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [brandIndex, setBrandIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [userCaption, setUserCaption] = useState("");
  const [status, setStatus] = useState("Tap start when you're ready");
  const [pending, setPending] = useState<PendingAnswer | null>(null);
  const [profile, setProfile] = useState<Partial<FitProfile>>({
    brands: [],
    brandSizes: [],
  });
  const [completedProfile, setCompletedProfile] = useState<FitProfile | null>(
    null
  );
  const runningRef = useRef(false);
  const profileRef = useRef<Partial<FitProfile>>({
    brands: [],
    brandSizes: [],
  });

  const syncProfile = (updater: (prev: Partial<FitProfile>) => Partial<FitProfile>) => {
    profileRef.current = updater(profileRef.current);
    setProfile({ ...profileRef.current });
  };

  useEffect(() => {
    preloadVoices();
    if (!getSpeechRecognition()) {
      setPhase("unsupported");
    }
  }, []);

  const currentStep = (): VoiceStep | null => {
    const step = STEP_ORDER[stepIndex];
    if (step === "brandSizes" && (profileRef.current.brands?.length ?? 0) === 0) {
      return "frustration";
    }
    return step ?? null;
  };

  const getQuestion = useCallback((step: VoiceStep): string => {
    switch (step) {
      case "height":
        return "Let's find your perfect fit. First — what's your height? For example, five foot six.";
      case "weight":
        return "And your weight in pounds? This is totally optional — just say skip if you'd rather not share.";
      case "waist":
        return "What's your waist measurement at the narrowest point, in inches?";
      case "hip":
        return "And your hip measurement at the fullest point, in inches?";
      case "waistFit":
        return "How do you like jeans to fit at the waist — snug, slightly relaxed, or relaxed?";
      case "rise":
        return "Where should the waistband sit — high rise, mid rise, or low rise?";
      case "thighFit":
        return "How should jeans fit through the thighs — fitted, relaxed, or loose?";
      case "brands":
        return "Which denim brands have you bought before? You can name several, like Levi's, Madewell, or Gap. Or say none if you haven't.";
      case "brandSizes": {
        const brand = profileRef.current.brands?.[brandIndex];
        return brand
          ? `What size did you wear in ${brand}?`
          : "Let's move on to your biggest fit frustration.";
      }
      case "frustration":
        return "Last one — what's your biggest frustration when buying jeans? Waist gap, hip tightness, wrong length, thigh fit, rise, or something else?";
    }
  }, [brandIndex]);

  const speakAndSet = useCallback((text: string): Promise<void> => {
    setCaption(text);
    return new Promise((resolve) => {
      speak(text, resolve);
    });
  }, []);

  const handleListenRef = useRef<(() => Promise<void>) | null>(null);

  const askCurrentQuestion = useCallback(async () => {
    const step = currentStep();
    if (!step) return;
    setPhase("asking");
    setStatus("Jackie is speaking…");
    setUserCaption("");
    await speakAndSet(getQuestion(step));
    setPhase("listening");
    setStatus("Listening… speak your answer");
    window.setTimeout(() => {
      handleListenRef.current?.();
    }, 400);
  }, [getQuestion, speakAndSet]);

  const parseAnswer = (
    step: VoiceStep,
    text: string
  ): { ok: true; display: string; apply: () => void } | { ok: false } => {
    switch (step) {
      case "height": {
        const h = parseHeight(text);
        if (!h) return { ok: false };
        return {
          ok: true,
          display: h,
          apply: () => syncProfile((p) => ({ ...p, height: h })),
        };
      }
      case "weight": {
        const w = parseWeight(text);
        if (w === "skip") {
          return {
            ok: true,
            display: "Skipped",
            apply: () => syncProfile((p) => ({ ...p, weight: undefined })),
          };
        }
        if (typeof w === "number") {
          return {
            ok: true,
            display: `${w} lbs`,
            apply: () => syncProfile((p) => ({ ...p, weight: w })),
          };
        }
        return { ok: false };
      }
      case "waist": {
        const w = parseWaist(text);
        if (!w) return { ok: false };
        return {
          ok: true,
          display: `${w} inches`,
          apply: () => syncProfile((p) => ({ ...p, waist: w })),
        };
      }
      case "hip": {
        const h = parseHip(text);
        if (!h) return { ok: false };
        return {
          ok: true,
          display: `${h} inches`,
          apply: () => syncProfile((p) => ({ ...p, hip: h })),
        };
      }
      case "waistFit": {
        const v = parseWaistFit(text);
        if (!v) return { ok: false };
        return {
          ok: true,
          display: getLabelForValue(WAIST_FIT_OPTIONS, v),
          apply: () => syncProfile((p) => ({ ...p, waistFit: v })),
        };
      }
      case "rise": {
        const v = parseRise(text);
        if (!v) return { ok: false };
        return {
          ok: true,
          display: getLabelForValue(RISE_OPTIONS, v),
          apply: () => syncProfile((p) => ({ ...p, rise: v })),
        };
      }
      case "thighFit": {
        const v = parseThighFit(text);
        if (!v) return { ok: false };
        return {
          ok: true,
          display: getLabelForValue(THIGH_FIT_OPTIONS, v),
          apply: () => syncProfile((p) => ({ ...p, thighFit: v })),
        };
      }
      case "brands": {
        const brands = parseBrands(text);
        const display =
          brands.length > 0 ? brands.join(", ") : "No previous brands";
        return {
          ok: true,
          display,
          apply: () =>
            syncProfile((p) => ({
              ...p,
              brands,
              brandSizes: [],
            })),
        };
      }
      case "brandSizes": {
        const brand = profileRef.current.brands?.[brandIndex];
        if (!brand) return { ok: false };
        const size = parseBrandSize(text);
        if (!size) return { ok: false };
        return {
          ok: true,
          display: `Size ${size} in ${brand}`,
          apply: () =>
            syncProfile((p) => {
              const existing = (p.brandSizes ?? []).filter(
                (b) => b.brand !== brand
              );
              return {
                ...p,
                brandSizes: [...existing, { brand, size }],
              };
            }),
        };
      }
      case "frustration": {
        const v = parseFrustration(text);
        if (!v) return { ok: false };
        return {
          ok: true,
          display: getLabelForValue(FRUSTRATION_OPTIONS, v),
          apply: () => syncProfile((p) => ({ ...p, frustration: v })),
        };
      }
    }
  };

  const advanceStep = useCallback(() => {
    const step = currentStep();
    if (step === "brandSizes") {
      const brands = profileRef.current.brands ?? [];
      if (brandIndex < brands.length - 1) {
        setBrandIndex((i) => i + 1);
        return false;
      }
    }

    if (step === "brands" && (profileRef.current.brands?.length ?? 0) === 0) {
      setStepIndex(STEP_ORDER.indexOf("frustration"));
      return false;
    }

    if (stepIndex >= STEP_ORDER.length - 1) return true;

    if (step === "brands" && (profileRef.current.brands?.length ?? 0) > 0) {
      setStepIndex(STEP_ORDER.indexOf("brandSizes"));
      setBrandIndex(0);
      return false;
    }

    setStepIndex((i) => i + 1);
    return false;
  }, [brandIndex, stepIndex]);

  const confirmAndContinue = useCallback(
    async (parsed: { display: string; apply: () => void }) => {
      setPhase("confirming");
      parsed.apply();
      await speakAndSet(`Got it — ${parsed.display}.`);
      const done = advanceStep();
      if (done) {
        setPhase("complete");
        const p = profileRef.current;
        const final: FitProfile = {
          height: p.height!,
          weight: p.weight,
          waist: p.waist!,
          hip: p.hip!,
          waistFit: p.waistFit!,
          rise: p.rise!,
          thighFit: p.thighFit!,
          brands: p.brands ?? [],
          brandSizes: p.brandSizes ?? [],
          frustration: p.frustration!,
          completedAt: new Date().toISOString(),
          source: "voice",
        };
        setCompletedProfile(final);
        await speakAndSet(
          "Perfect — your fit profile is complete. Taking you to Jackie Jeans now."
        );
        return;
      }
      await askCurrentQuestion();
    },
    [advanceStep, askCurrentQuestion, speakAndSet]
  );

  const handleListen = useCallback(async () => {
    const step = currentStep();
    if (!step || phase === "complete") return;

    try {
      setPhase("listening");
      setStatus("Listening…");
      const transcript = await listenOnce();
      setUserCaption(transcript);

      if (pending) {
        if (isAffirmative(transcript)) {
          setPending(null);
          await confirmAndContinue({
            display: pending.display,
            apply: pending.apply,
          });
          return;
        }
        if (isNegative(transcript)) {
          setPending(null);
          await speakAndSet("No problem, let's try that again.");
          await askCurrentQuestion();
          return;
        }
      }

      const parsed = parseAnswer(step, transcript);
      if (!parsed.ok) {
        setPhase("asking");
        await speakAndSet(
          "Sorry, I didn't quite catch that. Could you say it again?"
        );
        setPhase("listening");
        setStatus("Listening…");
        return;
      }

      setPhase("confirming");
      setStatus("Confirming…");
      const confirmText = `I heard ${parsed.display}. Is that right?`;
      await speakAndSet(confirmText);

      setPending({
        raw: transcript,
        display: parsed.display,
        apply: parsed.apply,
      });

      const confirmListen = await listenOnce(8000);
      setUserCaption(confirmListen);
      if (isAffirmative(confirmListen)) {
        setPending(null);
        await confirmAndContinue(parsed);
      } else {
        setPending(null);
        await speakAndSet("Okay, let's try that question again.");
        await askCurrentQuestion();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setStatus(message);
      setPhase("asking");
      await speakAndSet(message);
      setPhase("listening");
    }
  }, [askCurrentQuestion, confirmAndContinue, pending, phase, speakAndSet]);

  handleListenRef.current = handleListen;

  const startQuiz = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setStepIndex(0);
    setBrandIndex(0);
    profileRef.current = { brands: [], brandSizes: [] };
    setProfile({ brands: [], brandSizes: [] });
    await askCurrentQuestion();
  };

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const totalSteps = STEP_ORDER.length;
  const progressStep = Math.min(stepIndex + 1, totalSteps);

  if (completedProfile) {
    return <CompletionScreen profile={completedProfile} />;
  }

  if (phase === "unsupported") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-2xl text-indigo-950">
          Voice not supported here
        </h1>
        <p className="mt-3 max-w-sm text-stone-600">
          Please use Chrome or Safari on your phone for voice onboarding, or try
          the manual quiz instead.
        </p>
        <Link href="/manual" className="btn-primary mt-8 inline-block px-8">
          Manual quiz
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-[#faf8f5] to-indigo-50/40">
      <header className="px-5 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link href="/" className="text-sm text-stone-500 hover:text-indigo-900">
            ← Back
          </Link>
          <JackieLogo />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-8">
        {phase !== "intro" && (
          <ProgressBar current={progressStep} total={totalSteps} />
        )}

        <div className="flex flex-1 flex-col items-center justify-center py-8">
          <VoiceOrb phase={phase} />

          <p className="mt-8 text-center text-sm font-medium uppercase tracking-wider text-indigo-800/70">
            {status}
          </p>

          {caption && (
            <div className="mt-6 w-full rounded-2xl border border-indigo-100 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                Jackie
              </p>
              <p className="mt-2 text-base leading-relaxed text-indigo-950">
                {caption}
              </p>
            </div>
          )}

          {userCaption && (
            <div className="mt-3 w-full rounded-2xl border border-stone-200 bg-stone-50/80 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                You
              </p>
              <p className="mt-2 text-base leading-relaxed text-stone-700">
                {userCaption}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {phase === "intro" ? (
            <>
              <p className="text-center text-sm text-stone-600">
                A friendly stylist will guide you through the fit quiz by voice.
                Find a quiet spot and allow microphone access.
              </p>
              <button type="button" onClick={startQuiz} className="btn-primary w-full">
                Start voice quiz
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleListen}
                disabled={phase === "asking" || phase === "processing" || phase === "confirming"}
                className="btn-primary w-full disabled:opacity-50"
              >
                {phase === "listening" ? "Listening…" : "Tap to speak"}
              </button>
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  askCurrentQuestion().then(handleListen);
                }}
                className="btn-secondary w-full"
              >
                Repeat question
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function VoiceOrb({ phase }: { phase: VoicePhase }) {
  const isActive = phase === "listening" || phase === "asking";
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      {isActive && (
        <>
          <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400/20" />
          <span className="absolute inset-2 animate-pulse rounded-full bg-indigo-400/30" />
        </>
      )}
      <div
        className={`relative flex h-28 w-28 items-center justify-center rounded-full shadow-xl transition-all duration-500 ${
          isActive
            ? "bg-indigo-900 ring-4 ring-indigo-300/50"
            : "bg-indigo-950 ring-2 ring-indigo-200"
        }`}
      >
        <svg
          className="h-12 w-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          {phase === "listening" ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
