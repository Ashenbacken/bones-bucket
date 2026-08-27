// Builds the Gilded theme assets from design/kits/gothic_pixel_ui_free_v_1-0-2 (local only).
// Usage: node scripts/kit-gilded.mjs   → writes src/assets/themes/gilded/*.png
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const KIT = 'design/kits/gothic_pixel_ui_free_v_1-0-2/split_assets'
const FB = `${KIT}/frames and bars`
const OUT = 'src/assets/themes/gilded'
mkdirSync(OUT, { recursive: true })

const png = (p) => sharp(p).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const rot = (p, deg) =>
  sharp(p)
    .ensureAlpha()
    .rotate(deg, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
const flip = (p, { h, v }) => {
  let s = sharp(p).ensureAlpha()
  if (h) s = s.flop()
  if (v) s = s.flip()
  return s.png().toBuffer()
}

/**
 * 9-slice frame: corner (c×c) in all four corners, edge strip (len×thick) repeated between.
 * The strip is drawn for the TOP edge (ornament facing up); other edges are rotations.
 */
async function frame({ corner, edge, out }) {
  const cm = await sharp(corner).metadata(),
    em = await sharp(edge).metadata()
  const c = cm.width,
    len = em.width,
    t = em.height
  const size = c * 2 + len
  const comps = [
    { input: await flip(corner, {}), left: 0, top: 0 },
    { input: await flip(corner, { h: true }), left: size - c, top: 0 },
    { input: await flip(corner, { v: true }), left: 0, top: size - c },
    { input: await flip(corner, { h: true, v: true }), left: size - c, top: size - c },
    { input: await flip(edge, {}), left: c, top: 0 },
    { input: await flip(edge, { v: true }), left: c, top: size - t },
    { input: await rot(edge, 270), left: 0, top: c },
    { input: await rot(edge, 90), left: size - t, top: c },
  ]
  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(comps)
    .png()
    .toFile(`${OUT}/${out}.png`)
  console.log(out, `${size}x${size}`, 'slice', c, 'edge thickness', t)
}

await frame({
  corner: `${FB}/24px_corner_outer_01.png`,
  edge: `${FB}/24px_border_01.png`,
  out: 'frame-24',
})
await frame({
  corner: `${FB}/24px_corner_outer_02.png`,
  edge: `${FB}/24px_border_03.png`,
  out: 'frame-24b',
})
await frame({
  corner: `${FB}/16px_outer_corner_01.png`,
  edge: `${FB}/16px_border_01.png`,
  out: 'frame-16',
})
await frame({
  corner: `${FB}/16px_outer_corner_02.png`,
  edge: `${FB}/16px_border_03.png`,
  out: 'frame-16b',
})

const copy = async (src, out) => {
  await sharp(src).png().toFile(`${OUT}/${out}.png`)
  console.log(out)
}
await copy(`${FB}/60x24px_bar_01.png`, 'bar')
await copy(`${FB}/54x20px_bar_02.png`, 'bar-b')
await copy(`${FB}/bar_fill_01.png`, 'bar-fill')
await copy(`${FB}/ornate_oval.png`, 'oval')
await copy(`${FB}/large_ornate_frame1.png`, 'ornate-1')
await copy(`${FB}/large_ornate_frame3.png`, 'ornate-3')
await copy(`${FB}/ornate_arch.png`, 'arch')
await copy(`${FB}/light_boundary_large.png`, 'divider')
await copy(`${FB}/small_selector_03.png`, 'selector')
await copy(`${KIT}/toggles and switches/toggle_01.png`, 'toggle')
await copy(`${KIT}/toggles and switches/check_01_strip3.png`, 'check-strip')
for (const i of ['crow', 'pocketwatch', 'potion', 'hat', 'satchel', 'beetle', 'teapot'])
  await copy(`${KIT}/grids and icons/32px/32px_${i}.png`, `icon-${i}`)
void png
