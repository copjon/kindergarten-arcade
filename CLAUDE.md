# Kindergarten Arcade

React + TypeScript (Vite) SPA of learning games for a kindergartner, with an 8-bit arcade look. No backend: all state lives in the browser (`localStorage`). Deployed to GitHub Pages at `/kindergarten-arcade/` (the Vite `base`). See README.md for what each game does.

## Commands

```bash
npm ci               # Node version is in .nvmrc (24)
npm run dev          # dev server on :5173
npm test             # unit tests (Vitest + Testing Library, jsdom)
npm run lint         # oxlint
npx tsc -b           # typecheck app (+ e2e: npx tsc -p tsconfig.e2e.json --noEmit)
npm run build        # runs unit tests first, then tsc + vite build
npm run test:e2e     # Playwright (desktop + mobile Chrome) against a local production build
```

Before committing: `npm run lint && npm run build`, and `npm run test:e2e` if gameplay or UI changed. CI (`.github/workflows/deploy.yml`) runs lint + build on push to `main`, deploys, then runs the Playwright suite against the live site.

In a Claude Code cloud container, Playwright's bundled browser may not match; point it at the preinstalled one with a throwaway config that sets `use.launchOptions.executablePath: '/opt/pw-browsers/chromium'` (don't commit it).

## Layout

- `src/games/index.ts` — the game registry (`GAMES`). The home screen and App routing come from it.
- `src/games/<game>/` — one folder per game:
  - `<Name>Game.tsx` — wraps `GameShell` + `VoicePicker` and a `mode-toggle` between a scored mode and a no-pressure learn/explore mode.
  - `rounds.ts` — pure logic: `GAME_ID`, session picking, distractor building. Unit-tested in `rounds.test.ts`.
  - The scored mode component (e.g. `InvadersMode.tsx`, `BlastMode.tsx`) takes `{ speech }` so tests can pass `fakeSpeech()`.
- `src/data/` — content (letters, sight words, math facts) plus guardrail tests.
- `src/lib/` — shared logic: `scoring` (points + speed bonus), `practice` (adaptive weighting from history), `history` (localStorage), `itemDisplay` (how items show in reports/parent dashboard), `sound` (Web Audio blaster/buzzer), `random.shuffle`.
- `src/components/` — shared UI: `GameShell`, `SessionReport`, `ParentsView`, `SpeechBubble`, `BlastBurst`, `LaserShot`, `VoicePicker`.
- `src/hooks/useSpeech.ts` — Web Speech API wrapper; `speak()` returns a promise that resolves when done.
- `src/index.css` — all styles in one file, one commented section per feature; colors are CSS variables on `:root`.
- `e2e/arcade.spec.ts` — Playwright functional tests.

## Adding a game

1. Create `src/games/<game>/` following the pattern above, and register it in `src/games/index.ts` (`id`, `title`, `tagline`, `emoji`, `color`).
2. Scored modes should: pick a short session (~10 items) via `practiceWeights` + `pickPracticeItems` with the game's `GAME_ID`; score with `pointsFor`; show `SessionReport` at the end; and save one `saveSessionEntry` per session (with `items` set).
3. Add the game to `PRACTICE_KINDS` in `src/lib/itemDisplay.ts` so the parent dashboard can show its trouble items.
4. Tests: `rounds.test.ts` for the logic, a gameplay test for the scored mode, and an e2e test. `src/App.test.tsx` already covers opening/exiting every registered game.
5. Update README.md (Games section).

## Gotchas

- `SessionEntry.missedLetters` / `slowLetters` hold practice items for **every** game (words, math facts like `"7-2"`). The names are kept so already-saved history still loads. Don't rename them or change the storage key `phonics.history.v1`.
- Item ids stored in history must stay stable: changing a word, letter, or fact key format orphans past data.
- Keep wrong answers pedagogically meaningful: no distractor that is also correct by ear (cat/kite), and use likely mistakes (look-alike words, off-by-one numbers).
- Moving targets (invader fleets) never settle; Playwright clicks on them need `{ force: true }`.
- `prefers-reduced-motion` shrinks every animation to ~0ms, so an `animationend` handler fires instantly. The invader fleets are exempted (`animation: none`) because their landing handler would otherwise loop; do the same for any new animation that drives game logic.
- Kid-facing text is short, encouraging, and spoken aloud; math says "subtract" (not "take away" or "minus"). When a game helps with counting, the child does the counting; never count or reveal the answer for them.
