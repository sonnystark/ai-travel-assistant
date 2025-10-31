# AI Travel Assistant

This is a small Next.js app written in TypeScript and styled with TailwindCSS that demonstrates a simple AI-powered travel planner using Google Gemini API.

## Local setup

1. Copy the example env and add your Google API key:

```bash
cp .env.example .env.local
# edit .env.local and set GOOGLE_API_KEY
```

2. Install dependencies and run the dev server (using pnpm):

```bash
pnpm install
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Where things live
- Server generator: `app/lib/generator.ts` (talks to Gemini, handles retries and extraction).
- API route: `app/api/generate/route.ts` (thin wrapper used by the frontend).
- UI & styles: `app/components/`, `app/globals.css`.

## Gemini API note
The generator (see `app/lib/generator.ts`) makes authenticated requests to Google’s Gemini models using `process.env.GOOGLE_API_KEY` and runs a small orchestration: try a preferred model with a low token budget, retry with a higher budget if needed, and optionally try fallback models. Responses are parsed with deterministic extraction followed by heuristic checks to reliably pull the user-facing itinerary text. The API route `app/api/generate/route.ts` simply forwards requests to the generator and returns the structured result — this keeps secrets and model logic server-side only.


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
