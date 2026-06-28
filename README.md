# Jackie Jeans — Smart Fit Onboarding

Mobile-first Fit Quiz onboarding for Jackie Jeans with **Manual** and **AI Voice** flows.

## Features

- All 10 Fit Quiz questions in both flows
- Conditional brand sizing (Q9 follows Q8)
- Optional weight with easy skip
- Voice-to-voice onboarding (Web Speech API)
- Fit profile saved to localStorage + passed to main site via URL
- Redirect to [jackie-jeans.vercel.app](https://jackie-jeans.vercel.app/)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Voice flow:** Use Chrome or Safari on mobile/desktop and allow microphone access.

## Deploy (Vercel)

```bash
npx vercel
```

Or connect this repo to Vercel for automatic deploys.

## Routes

| Route     | Description        |
| --------- | ------------------ |
| `/`       | Choose manual/voice |
| `/manual` | Form-based quiz    |
| `/voice`  | Voice-based quiz   |

## Tech

- Next.js 16 · React · TypeScript · Tailwind CSS
- Web Speech API (speech synthesis + recognition)
- Client-side answer parsing for natural voice input
