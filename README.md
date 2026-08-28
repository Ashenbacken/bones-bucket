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
- **Gilded**, **Tarnished**, **Cobalt**, **Umber** — pixel-art frames from the full
  [Gothic Pixel UI – Game Asset Pack](https://abyssowl.itch.io/gothic-pixel-ui) by AbyssOwl (the paid
  pack, not its free sample sheet), one theme per palette row of its sprite sheet (gold, olive,
  blue, brown): 9-sliced corner and edge tiles, ornate bars as gauges, oval medallions, kit toggle,
  bone sigil, Jacquard 24 pixel blackletter, hard pixel shadows. License in
  `src/assets/themes/pixel/LICENSE.md`; rebuild the slices for all four palettes from the raw kit's
  sprite sheets with `node scripts/kit-pixel.mjs`.
- **Hades** — black marble with gold veins, weathered bronze, Greek meander trim, laurel-wreathed
  skulls, amber flame glow, extra Greek taglines. Made for the Athens trip.

Themes are CSS variables (`--t-*` in `src/index.css`) overridden on `html[data-theme]` (the pixel
themes also share component rules keyed on `html[data-kit='pixel']`); SVG
ornaments read the same variables or switch on `themeAtom`. Adding a theme = one variable block
plus optional ornament variants in `src/components/Ornaments.tsx`.

### Adding a theme kit

Themes can be cut from a UI asset pack. The four pixel themes are one kit (Gothic Pixel UI), one
theme per palette; a new pack becomes a new kit the same way:

1. Unpack it under `design/kits/<kit>/` next to its license file. That folder is git-ignored —
   the raw pack stays on your machine, only the slices the app uses get committed.
2. In Claude Code run `/create-theme-from-kit <kit> [theme-id ...]`. The skill
   (`.claude/skills/create-theme-from-kit/SKILL.md`) reads the license, renders a contact sheet of
   the pack, maps its parts onto the slots the app draws (screen/panel/button frames, gauge track
   and fill, medallion, toggle, sigil, optional icon atlas), writes a `scripts/kit-<kit>.mjs`
   slicer, registers the theme, adds `LICENSE.md` and the credits, and hands back phone-sized
   screenshots to judge.
3. Check the screenshots (and the app on your device), then commit.

Doing it by hand follows the same route — the skill file is the checklist. In short: a slicer
script writes PNGs to `src/assets/themes/<kit>/<id>/`; the theme id goes into `THEMES`
(`src/domain/types.ts`), a `:root[data-theme='<id>']` block with the `--t-*` palette and `--g-*`
slice URLs (`src/index.css`), `THEME_COLOR`/`THEME_PULSE` (`src/App.tsx`),
`THEME_LABELS`/`THEME_CARDS` (`src/screens/SettingsScreen.tsx`) and the kit's asset map. A kit
with the Gothic Pixel UI geometry can join `PIXEL_THEMES` and reuse the `[data-kit='pixel']` rules;
one with different tile sizes gets its own kit id and rule block. The `Record<Theme, …>` maps make
TypeScript flag anything missed, and the tests iterate `THEMES`.

A new palette of the Gothic Pixel UI kit is only a row offset: add it to `PALETTES` in
`scripts/kit-pixel.mjs` and run the script — it asserts the new palette's alpha masks match
Gilded's.

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
