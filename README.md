# Monotyped — Minimal Typing Trainer

Monotyped is a minimalist typing trainer built with React and Sass. It provides a focused typing test experience with live metrics, per-character feedback, and customizable audio and themes.

## Features

- Typing Test: Presents quotes to type and measures performance.
- Random Quotes: Ships with ~670+ bundled prompts (no external API).
- Start-on-first-keystroke: Timer begins on first keypress.
- Live WPM & Accuracy: Real-time WPM and accuracy while typing.
- Final Results: Post-run summary: WPM, CPM, time, accuracy, words, characters.
- Per-character correctness: Visual correct/incorrect marking and caret handling.
- Word-flow rules: Prevents moving to next word until current word fully typed; handles overwrite and extra characters.
- Backspace behavior: Backspace deletes last char without counting as a keystroke; tactile feedback included.
- Themes: Multiple built-in themes (midnight, cyberpunk, nord, dracula, emerald, retro) via `data-theme`.
- Results panel: Summary cards for quick review of stats.
- Accessibility: Focusable quote card and keyboard-driven interaction.
- Refresh quote: Button to load a new random quote.
- Polished visuals: Glow blobs, theme dots, stat pills, styled letter states.
- Audio: Web Audio API synthesizer with Cherry Blue, Brown, Red, and Mute profiles.
- Lazy Audio Init: Audio context initialized lazily to respect autoplay policies.
- Developer stack: React + Sass, `react-icons`. Dev scripts available in `package.json`.

## Quick Start

1. Install
   - macOS:
     - npm: `npm install`
     - yarn: `yarn`
2. Run (development)
   - `npm start` or `yarn start`
3. Build
   - `npm run build` or `yarn build`

## Project Structure (high level)

- `src/` — React source
  - `App.js` — core typing logic and UI
  - `utils/quotes.json` — bundled quotes
  - `utils/audioEngine.js` — synthesized key sounds
- `public/` — static assets

## Audio Profiles

- Cherry Blue — clicky tactile timbre
- Brown — softer tactile timbre
- Red — linear smooth timbre
- Mute — no sound

## Contributing

Report issues or open PRs. Keep changes focused and add tests for behavior changes.

## License

See `LICENSE` (if present).

