import { JackieLogo } from "@/components/JackieLogo";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#faf8f5]">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-amber-100/40 blur-3xl" />

      <header className="relative px-6 py-6">
        <JackieLogo />
      </header>

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 pb-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-800/60">
          Fit Quiz
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.1] text-indigo-950 sm:text-5xl">
          Jeans that fit.
          <br />
          <span className="text-indigo-700">The first time.</span>
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-stone-600">
          A short, intelligent quiz to learn your shape and preferences — then
          we&apos;ll recommend denim with confidence.
        </p>

        <div className="mt-10 space-y-4">
          <Link href="/voice" className="group block">
            <div className="rounded-3xl border border-indigo-900/10 bg-indigo-950 p-6 text-white shadow-xl transition-transform hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-indigo-300">
                    Recommended
                  </p>
                  <h2 className="mt-1 font-serif text-2xl">Voice onboarding</h2>
                  <p className="mt-2 text-sm leading-relaxed text-indigo-100/80">
                    Talk to your virtual stylist — hands-free, natural, and fast.
                  </p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          <Link href="/manual" className="group block">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                    Classic
                  </p>
                  <h2 className="mt-1 font-serif text-2xl text-indigo-950">
                    Manual onboarding
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    A calm, step-by-step quiz — one question at a time.
                  </p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-stone-100 text-indigo-900">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.085M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.085M15.75 18v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.25 0h.008v.008h-.008V7.5zm-11.25 0h.008v.008H5.25V7.5z" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-stone-400">
          ~2 minutes · Mobile optimized · All answers stay on your device
        </p>
      </main>
    </div>
  );
}
