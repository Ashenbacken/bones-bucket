# Bones Bucket

Every time you're slow on your beer, you collect a bone. The fuller the bucket, the stronger the
statement. Installable phone web app; all data stays on the device.

## Develop

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run lint       # eslint
npm run build      # tsc + vite build (PWA)
npm run preview    # serve dist on the LAN for phone testing
npm run icons      # regenerate PNG icons from public/favicon.svg
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which lints, tests, builds with
`BASE_PATH=/<repo>/` and publishes `dist/` to GitHub Pages. In the repository settings set
**Pages → Source → GitHub Actions** once.

## Themes

Three themes, switchable in Settings and stored per device (`settings.theme`):

- **Crypt** (default) — cracked slate, pewter, gold chain, blood-red glow.
- **Necro** — obsidian mausoleum tiles, cold stone frames, hexagonal stone ossuary instead
  of the bucket (relic bones with chips and fractures stack in a recessed chamber), iron skull
  badges with the initial burning across the face, blackletter type with a pulsing ghoul-green aura.
- **Hades** — black marble with gold veins, weathered bronze, Greek meander trim, laurel-wreathed
  skulls, amber flame glow, extra Greek taglines. Made for the Athens trip.

Themes are CSS variables (`--t-*` in `src/index.css`) overridden on `html[data-theme]`; SVG
ornaments read the same variables or switch on `themeAtom`. Adding a theme = one variable block
plus optional ornament variants in `src/components/Ornaments.tsx`.

## Players

A fresh install starts with the seven founding collectors (`src/domain/seed.ts`) and an empty
bucket; anyone can still be added, renamed or removed in the app.

## How it works

- State is one JSON document in `localStorage` (`src/domain/store.ts`), validated on every read.
- Bones are stored as per-collector, per-day counts. A "day" is the phone's local calendar day.
- The tap sound is synthesised with Web Audio (`src/lib/sound.ts`): an iron-bucket clang followed
  by a short bone rattle, randomised per tap. No audio assets.
- In a browser tab the app requests fullscreen on the first tap (installed PWAs are already
  standalone; iOS Safari has no document fullscreen).
- Hand-off links carry the compressed bucket in the URL fragment (`#h=…`); nothing is uploaded.
- Characters (`src/characters/catalog.ts`) give each collector a crest medallion (shape, metal, gem,
  ornament — the initial is engraved at render time) and a title template ("Erik the Digger").
- Visual language: dark-fantasy UI kit — cracked slate ground, grey stone panels with pewter rims
  and spiked corners, gold chain trim, skull corner ornaments, red-glow Cinzel lettering. All
  textures are inline SVG/CSS; there are no image assets besides the icons.
