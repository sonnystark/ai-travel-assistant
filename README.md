# AI Travel Assistant

This is a small Next.js (App Router) + TypeScript + TailwindCSS app that demonstrates a simple AI-powered travel planner using Google's Generative Language (Gemini) API.

Features

- A text input for a trip idea (e.g. “3 days in Japan focused on food”).
- Calls the Gemini API to generate a short 3–5 bullet itinerary.
- Clean, mobile-friendly UI with TailwindCSS.

Local setup

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

3. Open http://localhost:3000

Notes and assumptions

- The server-side API route `app/api/generate/route.ts` expects an environment variable `GOOGLE_API_KEY` containing a valid API key for the Generative Language API. Keep this key secret — do not commit it.
- The request uses the v1beta2 `text-bison-001` model generate endpoint. If your Google API surface or model names differ, update `app/api/generate/route.ts` accordingly.

How it works

- The client component `app/components/PlannerForm.tsx` POSTs the user prompt to `/api/generate`.
- The server route calls the Generative Language API and returns a parsed array of itinerary bullet strings.

Next steps / improvements

- Add validation and rate-limiting on the API route.
- Improve prompt engineering for richer itineraries (time estimates, transport, maps).
- Add tests and edge-case handling for different Gemini response shapes.
  This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Design tokens
Design tokens and how to tweak them
- Location: tokens live in `app/globals.css`. They drive colors, radius, shadows, and card sizing used by Tailwind via CSS variables.
- Change tokens to adjust the look and feel globally without touching components.
- Generally you can edit `app/globals.css` and the UI will update. If you change `tailwind.config.cjs` you may need to restart the dev server.

Current token block (from project)
```ai-travel-assistant/app/globals.css#L1-40
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Design tokens */
:root{
  --bg: #f7f8fb;
  --surface: #ffffff;
  --text: #0f172a;
  --muted: #6b7280;
  --primary: #0ea5e9;
  --radius: 0.75rem;
  --card-max-w: 48rem;
  --shadow: 0 8px 24px rgba(2,6,23,0.06);
}
```

Token reference and recommended tweaks
- `--bg` — page background color. Change for light/dark backgrounds.
  - Example: set to `#ffffff` for a cleaner, pure-white background or `#f3f4f6` for a softer grey.
- `--surface` — card / surface background. Keep this a bit lighter/darker than `--bg` for subtle contrast.
- `--text` — primary text color. Use high contrast against `--surface`.
- `--muted` — secondary / helper text color (labels, captions).
- `--primary` — primary accent color used for buttons and focus rings. Pick a color that works for both light and dark.
- `--radius` — base border radius used by components (e.g., `0.5rem` = 8px). Reduce for a crisper look or increase for softer UI.
- `--card-max-w` — maximum width of the main card (e.g., `48rem` = 768px). Lower to 42rem for more compact layout on desktop.
- `--shadow` — card shadow; R G B and alpha values control the depth and darkness. Use smaller offsets for minimal UIs.

Dark-mode tokens
- The file already contains a dark-mode override block. Edit the colors in that block to tune the dark appearance.

Quick override examples
- Add/replace the :root rules (or edit existing ones) to change the look. Example — increase radius, narrow card width, and change primary color:

```/dev/null/example.css#L1-20
:root {
  --bg: #ffffff;
  --surface: #ffffff;
  --text: #0b1220;
  --muted: #6b7280;
  --primary: #7c3aed;        /* purple accent */
  --radius: 0.5rem;          /* slightly sharper corners */
  --card-max-w: 42rem;       /* 672px card for tighter layout */
  --shadow: 0 6px 18px rgba(2,6,23,0.05);
}
```

Practical tips
- Start by changing `--primary` and `--card-max-w` to see immediate visual effect.
- Use accessible color contrasts (check primary vs surface/text) — try tools like the WebAIM contrast checker.
- If you change Tailwind tokens or add new CSS variables referenced by `tailwind.config.cjs`, restart Next's dev server so Tailwind rebuilds.
- For temporary experimentation, use browser DevTools to edit the CSS variables live (Element panel -> :root styles), then paste final values into `app/globals.css`.
- Consider exposing a small set of tokens as environment variables if you plan to alter them per-deployment, otherwise keep them in `globals.css`.
