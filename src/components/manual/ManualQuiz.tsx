"use client";

import { CompletionScreen } from "@/components/CompletionScreen";
import { JackieLogo } from "@/components/JackieLogo";
import { ProgressBar } from "@/components/ProgressBar";
import {
  DENIM_BRANDS,
  FRUSTRATION_OPTIONS,
  HEIGHTS,
  HIPS,
  QUIZ_STEPS,
  RISE_OPTIONS,
  THIGH_FIT_OPTIONS,
  WAIST_FIT_OPTIONS,
  WAISTS,
} from "@/lib/quiz-data";
import type { BrandSize, FitProfile, QuestionId } from "@/lib/quiz-types";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

type Answers = Partial<
  Omit<FitProfile, "completedAt" | "source" | "brandSizes"> & {
    brandSizes: BrandSize[];
  }
>;

function getVisibleSteps(answers: Answers) {
  return QUIZ_STEPS.filter((step) => {
    if (step.id === "brandSizes") {
      return (answers.brands?.length ?? 0) > 0;
    }
    return true;
  });
}

export function ManualQuiz() {
  const [showIntro, setShowIntro] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    brands: [],
    brandSizes: [],
  });
  const [brandIndex, setBrandIndex] = useState(0);
  const [completedProfile, setCompletedProfile] = useState<FitProfile | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const visibleSteps = useMemo(() => getVisibleSteps(answers), [answers]);
  const currentStep = visibleSteps[stepIndex];
  const totalSteps = visibleSteps.length;

  const updateAnswer = useCallback(<K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }, []);

  const validateCurrent = (): boolean => {
    if (!currentStep) return false;
    switch (currentStep.id) {
      case "height":
        if (!answers.height) {
          setError("Please select your height.");
          return false;
        }
        break;
      case "weight":
        break;
      case "waist":
        if (!answers.waist) {
          setError("Please select your waist measurement.");
          return false;
        }
        break;
      case "hip":
        if (!answers.hip) {
          setError("Please select your hip measurement.");
          return false;
        }
        break;
      case "waistFit":
        if (!answers.waistFit) {
          setError("Please choose a waist fit preference.");
          return false;
        }
        break;
      case "rise":
        if (!answers.rise) {
          setError("Please choose a rise preference.");
          return false;
        }
        break;
      case "thighFit":
        if (!answers.thighFit) {
          setError("Please choose a thigh fit preference.");
          return false;
        }
        break;
      case "brands":
        break;
      case "brandSizes": {
        const brand = answers.brands?.[brandIndex];
        const existing = answers.brandSizes?.find((b) => b.brand === brand);
        if (brand && !existing?.size) {
          setError(`Please enter your size for ${brand}.`);
          return false;
        }
        break;
      }
      case "frustration":
        if (!answers.frustration) {
          setError("Please select your biggest fit frustration.");
          return false;
        }
        break;
    }
    return true;
  };

  const goNext = () => {
    if (!validateCurrent()) return;

    if (currentStep?.id === "brandSizes") {
      const brands = answers.brands ?? [];
      if (brandIndex < brands.length - 1) {
        setBrandIndex((i) => i + 1);
        return;
      }
    }

    if (stepIndex >= totalSteps - 1) {
      setCompletedProfile({
        height: answers.height!,
        weight: answers.weight,
        waist: answers.waist!,
        hip: answers.hip!,
        waistFit: answers.waistFit!,
        rise: answers.rise!,
        thighFit: answers.thighFit!,
        brands: answers.brands ?? [],
        brandSizes: answers.brandSizes ?? [],
        frustration: answers.frustration!,
        completedAt: new Date().toISOString(),
        source: "manual",
      });
      return;
    }

    setStepIndex((i) => i + 1);
  };

  const goBack = () => {
    setError(null);
    if (currentStep?.id === "brandSizes" && brandIndex > 0) {
      setBrandIndex((i) => i - 1);
      return;
    }
    if (stepIndex > 0) {
      if (visibleSteps[stepIndex - 1]?.id === "brandSizes") {
        const brands = answers.brands ?? [];
        setBrandIndex(Math.max(0, brands.length - 1));
      }
      setStepIndex((i) => i - 1);
    }
  };

  if (completedProfile) {
    return <CompletionScreen profile={completedProfile} />;
  }

  if (showIntro) {
    return (
      <div className="flex min-h-dvh flex-col bg-[#faf8f5]">
        <header className="px-5 py-4">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            <Link href="/" className="text-sm text-stone-500 hover:text-indigo-900">
              ← Back
            </Link>
            <JackieLogo />
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-800/60">
            Fit Quiz
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-indigo-950">
            Let&apos;s learn your fit
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            Ten quick questions about your shape and preferences — one at a
            time, no rush.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-stone-600">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-900">
                1
              </span>
              Measurements &amp; fit preferences
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-900">
                2
              </span>
              Brands you&apos;ve worn before
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-900">
                3
              </span>
              Your biggest fit frustration
            </li>
          </ul>
          <p className="mt-6 text-sm text-stone-400">~2 minutes · You can go back anytime</p>
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            className="btn-primary mt-10 w-full"
          >
            Start quiz
          </button>
        </main>
      </div>
    );
  }

  const renderInput = () => {
    if (!currentStep) return null;
    const id = currentStep.id as QuestionId;

    switch (id) {
      case "height":
        return (
          <select
            value={answers.height ?? ""}
            onChange={(e) => updateAnswer("height", e.target.value)}
            className="input-field"
          >
            <option value="">Select height</option>
            {HEIGHTS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        );

      case "weight":
        return (
          <div className="space-y-4">
            <input
              type="number"
              min={70}
              max={400}
              placeholder="Enter weight in lbs"
              value={answers.weight ?? ""}
              onChange={(e) =>
                updateAnswer(
                  "weight",
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
              className="input-field"
            />
            <button
              type="button"
              onClick={() => {
                updateAnswer("weight", undefined);
                goNext();
              }}
              className="w-full py-3 text-sm text-stone-500 underline-offset-2 hover:text-indigo-900 hover:underline"
            >
              Skip this question
            </button>
          </div>
        );

      case "waist":
        return (
          <select
            value={answers.waist ?? ""}
            onChange={(e) => updateAnswer("waist", parseInt(e.target.value, 10))}
            className="input-field"
          >
            <option value="">Select waist (inches)</option>
            {WAISTS.map((w) => (
              <option key={w} value={w}>
                {w}&quot;
              </option>
            ))}
          </select>
        );

      case "hip":
        return (
          <select
            value={answers.hip ?? ""}
            onChange={(e) => updateAnswer("hip", parseInt(e.target.value, 10))}
            className="input-field"
          >
            <option value="">Select hip (inches)</option>
            {HIPS.map((h) => (
              <option key={h} value={h}>
                {h}&quot;
              </option>
            ))}
          </select>
        );

      case "waistFit":
        return (
          <OptionGrid
            options={WAIST_FIT_OPTIONS}
            value={answers.waistFit}
            onChange={(v) => updateAnswer("waistFit", v)}
          />
        );

      case "rise":
        return (
          <OptionGrid
            options={RISE_OPTIONS}
            value={answers.rise}
            onChange={(v) => updateAnswer("rise", v)}
          />
        );

      case "thighFit":
        return (
          <OptionGrid
            options={THIGH_FIT_OPTIONS}
            value={answers.thighFit}
            onChange={(v) => updateAnswer("thighFit", v)}
          />
        );

      case "brands":
        return (
          <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DENIM_BRANDS.map((brand) => {
              const selected = answers.brands?.includes(brand);
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => {
                    const current = answers.brands ?? [];
                    const next = selected
                      ? current.filter((b) => b !== brand)
                      : [...current, brand];
                    updateAnswer("brands", next);
                    updateAnswer(
                      "brandSizes",
                      (answers.brandSizes ?? []).filter((bs) =>
                        next.includes(bs.brand)
                      )
                    );
                  }}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition-all ${
                    selected
                      ? "border-indigo-900 bg-indigo-950 text-white shadow-md"
                      : "border-stone-200 bg-white text-stone-700 hover:border-indigo-300"
                  }`}
                >
                  {brand}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              updateAnswer("brands", []);
              updateAnswer("brandSizes", []);
              goNext();
            }}
            className="w-full py-3 text-sm text-stone-500 underline-offset-2 hover:text-indigo-900 hover:underline"
          >
            I haven&apos;t bought denim from these brands
          </button>
          </div>
        );

      case "brandSizes": {
        const brand = answers.brands?.[brandIndex];
        if (!brand) return null;
        const currentSize =
          answers.brandSizes?.find((b) => b.brand === brand)?.size ?? "";
        return (
          <div>
            <p className="mb-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-900">
              {brand} — brand {brandIndex + 1} of {answers.brands?.length}
            </p>
            <input
              type="text"
              placeholder="e.g. 28, 30, M, 8"
              value={currentSize}
              onChange={(e) => {
                const size = e.target.value;
                const existing = answers.brandSizes ?? [];
                const filtered = existing.filter((b) => b.brand !== brand);
                if (size) {
                  updateAnswer("brandSizes", [...filtered, { brand, size }]);
                } else {
                  updateAnswer("brandSizes", filtered);
                }
              }}
              className="input-field"
            />
          </div>
        );
      }

      case "frustration":
        return (
          <OptionGrid
            options={FRUSTRATION_OPTIONS}
            value={answers.frustration}
            onChange={(v) => updateAnswer("frustration", v)}
          />
        );

      default:
        return null;
    }
  };

  const isLastStep = stepIndex >= totalSteps - 1;
  const isBrandSizeLast =
    currentStep?.id === "brandSizes" &&
    brandIndex >= (answers.brands?.length ?? 1) - 1;

  return (
    <div className="flex min-h-dvh flex-col bg-[#faf8f5]">
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-[#faf8f5]/90 px-5 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link href="/" className="text-sm text-stone-500 hover:text-indigo-900">
            ← Back
          </Link>
          <JackieLogo />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-8">
        <ProgressBar current={stepIndex + 1} total={totalSteps} />

        <div key={currentStep?.id} className="mt-10 animate-slide-up flex-1">
          <h1 className="font-serif text-3xl leading-tight text-indigo-950">
            {currentStep?.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-stone-600">
            {currentStep?.subtitle}
          </p>

          <div className="mt-8">{renderInput()}</div>

          {error && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 mt-auto flex gap-3 border-t border-stone-200/80 bg-[#faf8f5] py-5">
          {stepIndex > 0 && (
            <button type="button" onClick={goBack} className="btn-secondary flex-1">
              Back
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            className="btn-primary flex-[2]"
          >
            {isLastStep && (currentStep?.id !== "brandSizes" || isBrandSizeLast)
              ? "Finish"
              : "Continue"}
          </button>
        </div>
      </main>
    </div>
  );
}

function OptionGrid<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value?: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`w-full rounded-2xl border px-5 py-4 text-left text-base transition-all ${
            value === opt.value
              ? "border-indigo-900 bg-indigo-950 text-white shadow-lg"
              : "border-stone-200 bg-white text-stone-800 hover:border-indigo-300 hover:shadow-sm"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
