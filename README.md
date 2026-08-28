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

### Adding a theme

Every theme id is registered in the same handful of places; TypeScript flags the ones you miss
because they are `Record<Theme, …>` maps, and the tests iterate `THEMES` so the new id is covered
without new test code.

1. `src/domain/types.ts` — add the id to `THEMES`. If it is drawn with the pixel kit, add it to
   `PIXEL_THEMES` too: that makes `App.tsx` set `html[data-kit='pixel']`, which switches on the
   shared kit component rules (frames, gauges, plaques) in `index.css`.
2. `src/index.css` — a `:root[data-theme='<id>']` block with the `--t-*` palette (copy the closest
   existing block). Pixel themes also set the `--g-*` slice URLs pointing at
   `src/assets/themes/pixel/<id>/`.
3. `src/App.tsx` — `THEME_COLOR` (browser chrome colour) and `THEME_PULSE` (the flash when a bone
   lands).
4. `src/screens/SettingsScreen.tsx` — `THEME_LABELS` and a `THEME_CARDS` entry, or add the id to
   the pixel card's cycle.
5. Pixel themes: `src/assets/themes/pixel/index.ts` — an `ASSETS` entry (frame, oval, toggle,
   sigil, icon atlas).
6. Optional flavour: taglines (`src/lib/taglines.ts`), bone sound (`src/lib/sound.ts`,
   `bucketMaterial`), and theme-specific ornaments, avatars or container in
   `src/components/{Ornaments,Avatar,BucketGraphic}.tsx`.

Then `npm test`, and eyeball it: `VITE_DEMO=1 npm run dev` in one shell and
`npm run shots http://localhost:5173 <id>` in another writes phone-sized screenshots of every tab
to `design/shots/`.

#### Adding a new palette of the Gothic Pixel UI kit

The kit's sheets stack one palette per row, so a new palette is only an offset. In
`scripts/kit-pixel.mjs` add an entry to `PALETTES` with the per-section row offsets from the gold
row (measure them on the sheet; `node scripts/kit-sheet.mjs <kitDir> <out.png>` renders a labelled
contact sheet) and the checkbox origin, then run the script. It asserts the new palette's alpha
masks match Gilded's, so a wrong offset fails loudly instead of producing shifted slices. Commit the
generated `src/assets/themes/pixel/<id>/` folder and register the id as above.

#### Bringing in a different kit

1. Unpack it under `design/kits/<kit>/` next to its license — that folder is git-ignored, only
   the slices actually used are committed.
2. Write a `scripts/kit-<kit>.mjs` slicer (see `kit-pixel.mjs`: `sharp` crops, the 9-slice
   `frame()` composer, alpha-mask assertions) that writes optimised PNGs to
   `src/assets/themes/<kit>/<palette>/`, plus a `LICENSE.md` there with the pack's terms and the
   attribution.
3. The `data-kit='pixel'` rules and the `border-image-slice` numbers in `index.css` (28, 17, 15, 12) are the geometry of the Gothic Pixel UI tiles. A kit with different tile sizes needs its
   own kit id (`isPixelTheme` → `is<Kit>Theme`, a second `data-kit` value in `App.tsx`) and its own
   `[data-kit='<kit>']` rule set, rather than reusing the pixel one.
4. Credit the artist where the pixel themes are credited: the Settings footer and this README.

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
