---
name: create-theme-from-kit
description: Turn a UI asset kit dropped into design/kits/<kit>/ into a new Bones Bucket theme — survey the sheets, write a slicer script, cut the slices, register the theme, credit the artist, verify with screenshots. Use when the user asks to add a theme from a kit or asset pack.
argument-hint: <kit-folder> [theme-id ...]
---

# Create a theme from a UI kit

Arguments: `$ARGUMENTS` — the kit folder name under `design/kits/`, then optional theme ids. Turn
the kit into one theme per palette (ids from the arguments, else propose short evocative names like
the existing `gilded`/`tarnished`/`cobalt`/`umber`).
`design/kits/*` is git-ignored: the raw pack stays local and only the slices the app uses are
committed. The reference implementation for everything below is the Gothic Pixel UI pipeline —
`scripts/kit-pixel.mjs`, `src/assets/themes/pixel/`, the `[data-kit='pixel']` rules in
`src/index.css`. Read those first, then follow the steps in order.

## 1. License first

Read the license file shipped with the kit (if there is none, stop and ask the user for the pack
URL and terms). Continue only if redistribution of edited slices inside an app is allowed; note
whether attribution is required. Never commit the raw pack.

## 2. Survey the kit

```sh
node scripts/kit-sheet.mjs design/kits/<kit> design/shots/<kit>-sheet.png
```

Read the contact sheet (and individual sheets with Read) and map the kit onto the slots the app
draws. Record pixel coordinates as you go; a connected-component pass with `sharp` (raw alpha
buffer) is more reliable than eyeballing.

| slot         | used by                                       | Gothic Pixel UI reference   |
| ------------ | --------------------------------------------- | --------------------------- |
| screen frame | `Atmosphere` border-image, `--frame` width    | `frame-24.png`, slice 28    |
| panel frame  | `.plaque` border-image                        | `frame-16.png`, slice 17    |
| button frame | `.etched` border-image (buttons, inputs)      | `frame-16b.png`, slice 15   |
| gauge track  | `.gauge` border-image                         | `bar.png`, slice 12         |
| gauge fill   | `.gauge > i` repeat-x swatch                  | `bar-fill.png` (4px wide)   |
| medallion    | `Avatar` behind the collector's icon/initial  | `oval.png` 50×63            |
| toggle       | Settings switches (flipped horizontally = on) | `toggle.png` 52×26          |
| sigil        | `CrestSigil` header crest                     | `icon-bone.png` 32×32       |
| icon atlas   | `Avatar` character icons (optional)           | `icons.png` 8×9 cells of 24 |

Frames are 9-sliced from one corner tile plus one edge tile: `frame()` in `kit-pixel.mjs` flips
and rotates them into a full border image and aligns the edge to the inner side of the corner's
arms. Reuse it. Kits that stack palettes as rows on one sheet are handled with a per-section row
offset table (`PALETTES`), and the build asserts every palette's alpha mask equals the first one's
so a wrong offset fails instead of producing shifted art.

## 3. Same kit family, or a new one?

- **Same geometry as Gothic Pixel UI** (tiles of 24/16px, same slot shapes): add the ids to
  `PIXEL_THEMES`, write slices to `src/assets/themes/pixel/<id>/` with the same file names, add
  `ASSETS` entries in `src/assets/themes/pixel/index.ts`. Nothing else in the component layer
  changes.
- **Different geometry or art style**: give it a kit id. Add `<KIT>_THEMES` / `is<Kit>Theme` to
  `src/domain/types.ts`, set `document.documentElement.dataset.kit` for it in `App.tsx`, and copy
  the `[data-kit='pixel']` block in `index.css` into a `[data-kit='<kit>']` block with the
  `border` widths and `border-image-slice` numbers of the new tiles (slice = corner tile size in
  px). Drop `image-rendering: pixelated` for non-pixel art. Add a `src/assets/themes/<kit>/index.ts`
  exposing the same asset shape as `PixelAssets`, and switch on it where the components call
  `pixelAssets()` (`Atmosphere`, `Avatar`, `Ornaments`, `SettingsScreen`) — prefer generalising
  that call to one `kitAssets(theme)` over adding parallel branches.

## 4. Write the slicer

`scripts/kit-<kit>.mjs`, modelled on `kit-pixel.mjs`: coordinates in one table at the top, `sharp`
crops, `frame()` for 9-slices, PNG output to `src/assets/themes/<kit>/<id>/`, assertions (palette
masks match; nothing falls into atlas gutters). Add an npm script if the kit will be re-cut often.
Run it and Read the output PNGs — check that frames are closed at the corners and edges tile
seamlessly.

## 5. Register the theme(s)

The `Record<Theme, …>` maps make TypeScript flag anything missed; the tests iterate `THEMES`.

1. `src/domain/types.ts` — `THEMES` (+ the kit's theme list).
2. `src/index.css` — `:root[data-theme='<id>']` with the full `--t-*` palette (copy the closest
   block; pick colours from the kit's own pixels), `--frame`, `--font-display`, and the `--g-*`
   slice URLs. Dark palettes need a lit `--g-plate` behind avatar icons.
3. `src/App.tsx` — `THEME_COLOR` (browser chrome) and `THEME_PULSE` (flash when a bone lands).
4. `src/screens/SettingsScreen.tsx` — `THEME_LABELS`; one `THEME_CARDS` card per kit, its palettes
   cycling on tap.
5. Optional flavour: `src/lib/taglines.ts`, `bucketMaterial` in `src/lib/sound.ts`, theme-specific
   ornaments/avatar/container in `src/components/{Ornaments,Avatar,BucketGraphic}.tsx`.

## 6. Credit

- `src/assets/themes/<kit>/LICENSE.md`: pack name, author, URL, the terms in your own words, and
  the note that only slices are redistributed.
- Settings footer credit line in `SettingsScreen.tsx` (link to the pack).
- README "Themes" list: one bullet describing the look, linking the pack.

## 7. Verify

```sh
npm run lint && npm test && npm run build
VITE_DEMO=1 npm run dev            # seeds sample bones, theme from ?theme=
npm run shots http://localhost:5173 <id>   # → design/shots/<id>-{bucket,report,settings}.png
```

Headless Chrome fails inside the Claude Code sandbox (`nice(5) failed`); run `shots` with the
sandbox disabled. Read every screenshot: frame seams, plaque corners, gauge fill under the track,
toggle on/off, medallion + icon legibility, display type over the panel colour. Iterate, then hand
the screenshots to the user — they judge themes on their phone. Do not commit unless asked.
