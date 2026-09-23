# Phonics Playground

A little React SPA of phonics games for early readers. Built entirely with [Claude Code](https://claude.com/claude-code).

🔗 **Play it here:** https://copjon.github.io/phonics-arcade/

## Games

### Letter Sounds

- **Explore Letters** — browse the alphabet, hear each letter's name and sound, and see a picture for a word that starts with it. Tap the picture for another example — every letter has several so it doesn't turn into rote memorization.
- **Picture Match** — hear/see a letter and tap the picture whose word starts with it. Runs through all 26 letters, scores points (with a speed bonus for quick, correct first tries), and ends with a report of which letters need more practice — flagged either because they were missed or because they took a while to answer.

### For Parents

A dashboard (linked from the home screen) that stores every finished round in the browser's `localStorage` — no account or server needed. It shows:

- An aggregate "letters to work on" list, weighted by how often a letter was missed or answered slowly across all past sessions.
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

## Deployment

Pushing to `main` builds the app and deploys it to GitHub Pages via the workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## License

[MIT](LICENSE)
