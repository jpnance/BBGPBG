# BBGPBG — The Big "Big Game" Prop Bets Game

A Super Bowl prop betting game. Players pick from a pool of prop bets submitted by participants.

## Setup

```bash
npm install
```

Create a `.env` file with your Google Sheets API key:

```bash
cp .env.example .env
# Edit .env with your actual key
```

## Data Source

Props and glossary are fetched from a Google Sheet. The sheet ID is hardcoded in `tsv-to-html.mjs`.

## Build & Deploy

```bash
runt build   # Generates dist/ from Google Sheets data + assets
runt deploy  # Rsyncs dist/ to coinflipper.org
```

The build script:
- Clears `dist/`
- Fetches props and glossary from Google Sheets
- Renders `index.html` via Pug template
- Converts `favicon.svg` → `favicon.ico` (multi-resolution)
- Copies CSS, JS, SVG, and logo.html to `dist/`
- Archives `index.html` to `old/index-{year}.html`

## Logo Generator

`dist/logo.html` (or `assets/logo.html` locally) lets you pick team colors for the favicon:

1. Select remaining teams in each conference
2. Browse generated color combinations
3. Click **Flip** to swap left/right
4. Click **Copy** to get hex codes: `#left / #right / #bg`
5. Update `assets/favicon.svg` with chosen colors
6. Rebuild

## File Structure

```
├── assets/
│   ├── bbgpbg.css        # Styles
│   ├── bbgpbg.js         # Client-side validation/clipboard
│   ├── favicon.svg       # Editable logo (update colors here)
│   └── logo.html         # Team color picker tool
├── dist/                 # Built output (gitignored)
├── old/                  # Archived index.html by year
├── runts/
│   ├── build             # Build script (Node)
│   └── deploy            # Deploy script (rsync)
├── template.pug          # HTML template
├── tsv-to-html.mjs       # Fetches data, renders template
├── .env                  # API key (gitignored)
└── .env.example          # Template for .env
```

## Yearly Checklist

1. Update `config.js` with the new year and sheet ID
2. Update the Google Sheet with new props
3. Pick logo colors via `logo.html`, update `favicon.svg`
4. `runt build && runt deploy`
5. Enjoy the game
