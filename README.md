# PixelPress

A modern, responsive homepage for an image compression / image tools SaaS, built with Next.js (App Router), TypeScript, Tailwind CSS, and Framer Motion.

> "PixelPress" is a placeholder name — rename it freely (see [Renaming](#renaming) below).

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** — design tokens (colors, radii, type scale) configured in `tailwind.config.ts` to match the provided brief
- **Framer Motion** — scroll reveals, hover lifts, the animated upload/compression visual, counters, accordion
- **lucide-react** — icon set

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm start       # serve the production build
```

## Project structure

```
app/
  layout.tsx        # fonts, metadata, ThemeProvider
  page.tsx           # composes all homepage sections
  globals.css         # base styles, focus rings, reduced-motion, ripple utility
components/
  Header.tsx           # sticky nav, mobile menu, dark mode toggle
  Hero.tsx             # headline + CTA row, mounts UploadBox
  UploadBox.tsx        # drag-and-drop area with the signature "squeeze" animation
  Stats.tsx            # live-statistics cards
  AnimatedCounter.tsx  # count-up-on-scroll utility used by Stats
  Features.tsx / FeatureCard.tsx
  HowItWorks.tsx       # 4-step timeline
  Tools.tsx / ToolCard.tsx   # tool grid with "Coming Soon" badges
  WhyChooseUs.tsx
  SupportedFormats.tsx
  Testimonials.tsx
  FAQ.tsx              # accordion
  Footer.tsx
  ThemeProvider.tsx    # light/dark mode context (persisted to localStorage)
```

## Design notes

- Colors, type scale, radii, and spacing follow the brief's token list exactly (primary `#2563EB`, secondary `#14B8A6`, accent `#F59E0B`, etc.) — see the `theme.extend` block in `tailwind.config.ts`.
- Dark mode is class-based (`darkMode: "class"`); the toggle lives in the header and persists via `localStorage`.
- The signature interaction is the upload box's looping "squeeze" animation, a small file-shrinking visual metaphor rather than a generic upload icon, tying the hero directly to the product's core promise.
- `prefers-reduced-motion` is respected globally in `globals.css`.
- All interactive elements have visible focus rings for keyboard accessibility.

## Wiring up real compression (backend)

The UI is functional (file selection, drag-and-drop, and Framer Motion states) but does not yet call a compression API. To connect it to a Node.js backend:

1. Add an API route, e.g. `app/api/compress/route.ts`, that accepts `multipart/form-data` and runs the images through a library such as `sharp`.
2. In `UploadBox.tsx`, replace the local `fileNames` state handling with a `fetch("/api/compress", { method: "POST", body: formData })` call, and surface progress/results in the UI.
3. Return a ZIP (e.g. via `archiver`) for the "ZIP Download" flow, or return per-file signed URLs.

## Renaming

"PixelPress" appears in `app/layout.tsx` (metadata) and `components/Header.tsx` / `Footer.tsx` (logo text). Update those three spots to rebrand.
