# Steward

Voice-first AI advisory companion for small farms in England.

Steward answers plain-language farm questions using a curated knowledge base of GOV.UK, AHDB and Met Office sources. It shows a confidence tag and citations on every answer, abstains when unsure, and steps back to a licensed adviser for regulated decisions (vet, pesticide, disposal).

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript, Tailwind 4
- Serverless API routes (`app/api/*`) — no separate backend service
- Optional Google Gemini via `GEMINI_API_KEY` (falls back to a TF-IDF extractive answerer that still cites sources and abstains correctly)

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Configuration

Optional env vars (add to `.env.local` or Vercel project settings):

```
GEMINI_API_KEY=...           # Enables LLM-generated answers grounded in the KB
GEMINI_MODEL=gemini-flash-latest
```

Without a key the app runs in **offline mode** — retrieval + guardrails + citation still work; the answer text is composed extractively from the KB passages.

## Testing

```bash
npm test        # Vitest — unit tests for retrieval, guardrails, dialect, plan, sensors, gamification
npm run build   # Type-check + production build
```

## Deployment

Push to `main` on the linked GitHub repo — Vercel deploys automatically.

## Product surface

- `/onboard` — 4 steps: name, accent (11 regional voices), farm type, sensors on/off
- `/home` — level ring + XP, daily plan, live sensor panel (if enabled), suggested questions
- `/ask` — chat with voice input (browser Web Speech API), rich bubbles with topic / confidence / sources / follow-ups / read-aloud
- `/learn` — 5 lessons + 2-question quiz on AI literacy
- `/settings` — accent, farm type, sensors, read-aloud, dark mode, larger text, reset progress
