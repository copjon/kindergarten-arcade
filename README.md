# Kindergarten Arcade

A little React SPA of learning games for kindergartners, with an 8-bit arcade look. Phonics today, more subjects (starting with math) on the way. Built entirely with [Claude Code](https://claude.com/claude-code).

🔗 **Play it here:** https://copjon.github.io/kindergarten-arcade/

## Games

### Word Invaders

*(high-frequency "heart words": I, a, the, and, me, to, an, is, am)*

- **Invaders** — hear a word, then blast the alien ship carrying it before the fleet lands. A miss tells you what the word you hit actually says; after two misses the right ship glows as a hint. Each word comes up twice per session.
- **Learn Words** — see each heart word with a picture and a sentence (word highlighted), and tap to hear it said, spelled out, or used in context. Heart words often can't be sounded out, so this mode is about learning them by heart.

### Alpha Blast

*(letter recognition and phonics)*

- **Explore Letters** — browse the alphabet, hear each letter's name and sound, and see a picture for a word that starts with it. Tap the picture for another example — every letter has several so it doesn't turn into rote memorization.
- **Picture Match** — hear/see a letter and tap the picture whose word starts with it. Prompts with the letter and its sound, and never offers two pictures that start with the same sound (e.g. cat and kite). Runs through every letter except X (no common word starts with its /ks/ sound), scores points (with a speed bonus for quick, correct first tries only), and ends with a report of which letters need more practice — flagged either because they were missed or because they took a while to answer.

### For Parents

A dashboard (linked from the home screen) that stores every finished round in the browser's `localStorage` — no account or server needed. It shows:

- "Words to work on" and "letters to work on" lists, weighted by how often each was missed or answered slowly across all past sessions.
- Full game history with score, first-try accuracy, and average response time per session.

## Tech

- React + TypeScript, scaffolded with Vite
- No backend — all state (including history) lives in the browser
- Speech via the Web Speech API (`speechSynthesis`)

## Running locally

```bash
npm install
npm run dev
```

## Testing

```bash
npm test            # unit tests (Vitest + Testing Library)
npm run test:e2e    # functional tests (Playwright) against a local production build
```

- **Unit tests** live next to the code (`src/**/*.test.ts(x)`) and cover scoring, round building, history storage, the report and parent dashboard, gameplay, and data guardrails (e.g. every picture word starts with its letter, and no emoji is reused across letters). They run as part of `npm run build`, so a failing test stops the build.
- **Functional tests** live in `e2e/` and play the games in real desktop and mobile Chrome. Set `BASE_URL` to run them against a deployed site instead of a local build.

## Deployment

Pushing to `main` runs the workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. **Build + unit tests:** lint, unit tests, then the production build. Any failure stops here and nothing is deployed.
2. **Deploy** to GitHub Pages.
3. **Functional tests:** waits until the live site serves the new commit (each build is stamped with its commit SHA), then runs the Playwright suite against it. On failure, the Playwright report is attached to the run.

## License

[MIT](LICENSE)
