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

Seven themes, switchable in Settings and stored per device (`settings.theme`):

- **Crypt** (default) — cracked slate, pewter, gold chain, blood-red glow.
- **Necro** — obsidian mausoleum tiles, cold stone frames, hexagonal stone ossuary instead
  of the bucket (relic bones with chips and fractures stack in a recessed chamber), iron skull
  badges with the initial burning across the face, blackletter type with a pulsing ghoul-green aura.
- **Gilded**, **Tarnished**, **Cobalt**, **Umber** — pixel-art frames from the "Gothic Pixel UI"
  kit, one theme per palette row of its sprite sheet (gold, olive, blue, brown): 9-sliced corner
  and edge tiles, ornate bars as gauges, oval medallions, kit toggle, bone sigil, Jacquard 24 pixel
  blackletter, hard pixel shadows. Pixel art by [AbyssOwl](https://abyssowl.itch.io/gothic-pixel-ui)
  (license in `src/assets/themes/pixel/LICENSE.md`); rebuild the slices for all four palettes from
  the raw kit's sprite sheets with `node scripts/kit-pixel.mjs`.
- **Hades** — black marble with gold veins, weathered bronze, Greek meander trim, laurel-wreathed
  skulls, amber flame glow, extra Greek taglines. Made for the Athens trip.

Themes are CSS variables (`--t-*` in `src/index.css`) overridden on `html[data-theme]` (the pixel
themes also share component rules keyed on `html[data-kit='pixel']`); SVG
ornaments read the same variables or switch on `themeAtom`. Adding a theme = one variable block
plus optional ornament variants in `src/components/Ornaments.tsx`.

## Players

A fresh install starts with the seven founding collectors (`src/domain/seed.ts`) and an empty
bucket; anyone can still be added, renamed or removed in the app.

## How it works

- State is one JSON document in `localStorage` (`src/domain/store.ts`), validated on every read.
- Bones are stored as per-collector, per-day counts. A "day" is the phone's local calendar day.
- The tap sound is synthesised with Web Audio (`src/lib/sound.ts`): a hollow oak-bucket thud (or a
  dry stone crack in Necro's sarcophagus) followed by a short bone rattle, randomised per tap. No
  audio assets.
- In a browser tab the app requests fullscreen on the first tap (installed PWAs are already
  standalone; iOS Safari has no document fullscreen).
- Settings → Day boundary lets the "day" roll over at e.g. 04:00 instead of midnight (per device;
  it re-buckets history too, since bones are keyed by day at the time they were given).
- Importing a handed-off bucket offers Merge (higher count per person per day, new people added)
  or Replace.
- Hand-off links carry the compressed bucket in the URL fragment (`#h=…`); nothing is uploaded.
- Characters (`src/characters/catalog.ts`) give each collector a crest medallion (shape, metal, gem,
  ornament — the initial is engraved at render time) and a title template ("Erik the Digger"). In
  the pixel themes the medallion shows the character's kit icon instead
  (`src/assets/themes/pixel/icons.ts`).
- Visual language: dark-fantasy UI kit — cracked slate ground, grey stone panels with pewter rims
  and spiked corners, gold chain trim, skull corner ornaments, red-glow Cinzel lettering. All
  textures are inline SVG/CSS; there are no image assets besides the icons.
