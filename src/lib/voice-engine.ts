"use client";

export type SpeechRecognitionCtor = new () => SpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function speak(
  text: string,
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.lang = "en-US";

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.includes("Samantha") ||
        v.name.includes("Google") ||
        v.name.includes("Natural"))
  );
  if (preferred) utterance.voice = preferred;

  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined") {
    window.speechSynthesis.cancel();
  }
}

export function listenOnce(timeoutMs = 12000): Promise<string> {
  return new Promise((resolve, reject) => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      reject(new Error("Speech recognition is not supported in this browser."));
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      fn();
    };

    const timer = window.setTimeout(() => {
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
      finish(() => reject(new Error("I didn't catch that. Please try again.")));
    }, timeoutMs);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      finish(() => resolve(transcript.trim()));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted") return;
      finish(() =>
        reject(
          new Error(
            event.error === "not-allowed"
              ? "Microphone access was denied. Please allow mic access and try again."
              : "I couldn't hear you clearly. Please try again."
          )
        )
      );
    };

    recognition.onend = () => {
      if (!settled) {
        finish(() => reject(new Error("No speech detected. Please try again.")));
      }
    };

    try {
      recognition.start();
    } catch {
      finish(() => reject(new Error("Could not start listening. Please try again.")));
    }
  });
}

export function preloadVoices(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
