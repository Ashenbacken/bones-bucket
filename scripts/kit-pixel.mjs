// Builds the pixel themes (Gilded, Tarnished, Cobalt, Umber) from design/kits/gothic-pixel-ui_v1-0-1
// (local only). The kit ships as sprite sheets with four palette rows per section; every slice
// below is a pixel region of the gold row plus a per-section row offset for the other palettes.
// Coordinates were measured once with a connected-component pass; the offsets by matching alpha
// masks, and the build asserts each palette's output has the same mask as gold.
// Usage: node scripts/kit-pixel.mjs   → writes src/assets/themes/pixel/<palette>/*.png
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const KIT = 'design/kits/gothic-pixel-ui_v1-0-1'
const SHEET = `${KIT}/gothic-pixel-ui_v1-0-1.png`
const ICONS = `${KIT}/gothic-pixel-icons_v1-0-0.png`
const OUT = 'src/assets/themes/pixel'

/** Row offsets from the gold row, per sheet section; checkboxes sit in a 2×2 grid instead. */
const PALETTES = {
  gilded: {
    corner: 0,
    edge24: 0,
    edge16: 0,
    bar: 0,
    oval: 0,
    ornate: 0,
    arch: 0,
    selector: 0,
    toggle: 0,
    check: [718, 1113],
    icon: 0,
  },
  tarnished: {
    corner: 135,
    edge24: 32,
    edge16: 32,
    bar: 52,
    oval: 101,
    ornate: 82,
    arch: 93,
    selector: 80,
    toggle: 34,
    check: [719, 1234],
    icon: 315,
  },
  cobalt: {
    corner: 270,
    edge24: 64,
    edge16: 64,
    bar: 104,
    oval: 202,
    ornate: 164,
    arch: 202,
    selector: 169,
    toggle: 69,
    check: [949, 1113],
    icon: 630,
  },
  umber: {
    corner: 404,
    edge24: 97,
    edge16: 99,
    bar: 156,
    oval: 303,
    ornate: 246,
    arch: 295,
    selector: 252,
    toggle: 103,
    check: [949, 1234],
    icon: 945,
  },
}

const clear = { r: 0, g: 0, b: 0, alpha: 0 }
const { data: px, info } = await sharp(SHEET)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
const opaque = (x, y) => px[(y * info.width + x) * 4 + 3] > 0

/** Crop a region of a sheet to a PNG buffer. */
const cut = (left, top, width, height, sheet = SHEET) =>
  sharp(sheet).extract({ left, top, width, height }).ensureAlpha().png().toBuffer()
const rot = (buf, deg) => sharp(buf).rotate(deg, { background: clear }).png().toBuffer()
const flip = (buf, { h, v }) => {
  let s = sharp(buf)
  if (h) s = s.flop()
  if (v) s = s.flip()
  return s.png().toBuffer()
}
const compose = (width, height, comps) =>
  sharp({ create: { width, height, channels: 4, background: clear } })
    .composite(comps)
    .png()

/**
 * 9-slice frame from the kit's "Corners – Outer Detail" and "Edge tiles": the top-left corner
 * box `c` in all four corners (flipped), the top edge tile `e` repeated between (rotated for the
 * sides). The edge tile is aligned to the inner side of the corner's arms, not to its bounding
 * box, so ornaments that overhang the corner are padded rather than clipped. Returns the CSS
 * border-image-slice to use.
 */
async function frame(c, e, file) {
  const corner = await cut(...c),
    edge = await cut(...e)
  const [cx, cy, cw, ch] = c,
    [, , len, t] = e
  let armBottom = -1
  for (let y = cy; y < cy + ch; y++) if (opaque(cx + cw - 1, y)) armBottom = y - cy
  let armRight = -1
  for (let x = cx; x < cx + cw; x++) if (opaque(x, cy + ch - 1)) armRight = x - cx
  let edgeTop = armBottom - (t - 1),
    edgeLeft = armRight - (t - 1)
  const pad = Math.max(0, -edgeTop, -edgeLeft)
  const w = cw + pad,
    h = ch + pad
  edgeTop += pad
  edgeLeft += pad
  const width = 2 * w + len,
    height = 2 * h + len
  const comps = [
    { input: corner, left: pad, top: pad },
    { input: await flip(corner, { h: true }), left: width - w, top: pad },
    { input: await flip(corner, { v: true }), left: pad, top: height - h },
    { input: await flip(corner, { h: true, v: true }), left: width - w, top: height - h },
    { input: edge, left: w, top: edgeTop },
    { input: await flip(edge, { v: true }), left: w, top: height - edgeTop - t },
    { input: await rot(edge, 270), left: edgeLeft, top: h },
    { input: await rot(edge, 90), left: width - edgeLeft - t, top: h },
  ]
  await compose(width, height, comps).toFile(file)
  return `${width}x${height} slice ${w === h ? w : `${h} ${w}`}`
}

/** Alpha mask of a PNG, to assert the palettes line up. */
const mask = async (file) => {
  const { data } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return Buffer.from(data.filter((_, i) => i % 4 === 3).map((a) => (a ? 1 : 0))).toString('hex')
}

const masks = {}
for (const [name, o] of Object.entries(PALETTES)) {
  const dir = `${OUT}/${name}`
  mkdirSync(dir, { recursive: true })
  const built = {}
  const y = (base, key) => base + o[key]
  // Outer screen frame: curled 24px set. Spare: leafy 24px set.
  built['frame-24'] = await frame(
    [220, y(654, 'corner'), 27, 27],
    [227, y(502, 'edge24'), 24, 12],
    `${dir}/frame-24.png`,
  )
  built['frame-24b'] = await frame(
    [155, y(687, 'corner'), 27, 27],
    [171, y(518, 'edge24'), 24, 11],
    `${dir}/frame-24b.png`,
  )
  // Panels: scalloped 16px set. Buttons and inputs: plain double-line 16px set.
  built['frame-16'] = await frame(
    [10, y(656, 'corner'), 17, 17],
    [8, y(505, 'edge16'), 16, 9],
    `${dir}/frame-16.png`,
  )
  built['frame-16b'] = await frame(
    [107, y(703, 'corner'), 15, 15],
    [141, y(522, 'edge16'), 16, 7],
    `${dir}/frame-16b.png`,
  )

  const copy = async (buf, out) => {
    await sharp(buf).png().toFile(`${dir}/${out}.png`)
    built[out] = ''
  }
  // Bars ("inner-bar area 40px wide") and the 4px fill swatch.
  await copy(await cut(126, y(1340, 'bar'), 58, 24), 'bar')
  await copy(await cut(186, y(1341, 'bar'), 50, 22), 'bar-b')
  await copy(await cut(255, y(1326, 'bar'), 4, 6), 'bar-fill')
  // Large frames and borders.
  await copy(await cut(994, y(32, 'oval'), 50, 63), 'oval')
  await copy(await cut(10, y(35, 'ornate'), 72, 68), 'ornate-1')
  await copy(await cut(163, y(35, 'ornate'), 44, 44), 'ornate-3')
  await copy(await cut(1052, y(30, 'arch'), 64, 88), 'arch')
  // Small frames: the "[ ]" bracket pair. Switches: the pill toggle (flip horizontally to activate).
  await copy(await cut(584, y(32, 'selector'), 19, 26), 'selector')
  await copy(await cut(865, y(1380, 'toggle'), 52, 26), 'toggle')

  // Checkbox as a 3-frame strip (off, hover, on), 34x28 each; the sheet stacks the states vertically.
  const [cxk, cyk] = o.check
  await compose(
    102,
    28,
    await Promise.all(
      [0, 33, 66].map(async (dy, i) => ({
        input: await cut(cxk, cyk + dy, 34, 28),
        left: i * 34,
        top: 0,
      })),
    ),
  ).toFile(`${dir}/check-strip.png`)
  built['check-strip'] = ''

  // The bone icon (32px) is the header sigil, centred on a 32x32 canvas.
  {
    const [ix, iy, w, h] = [601, 40, 27, 25]
    await compose(32, 32, [
      {
        input: await cut(ix, y(iy, 'icon'), w, h, ICONS),
        left: Math.floor((32 - w) / 2),
        top: Math.floor((32 - h) / 2),
      },
    ]).toFile(`${dir}/icon-bone.png`)
    built['icon-bone'] = ''
  }

  // Avatar icons: the whole 24px set as an 8×9 atlas of 24px cells (the sheet uses a 25px pitch).
  // Names per cell live in src/assets/themes/pixel/icons.ts.
  {
    const COLS = 8,
      ROWS = 9,
      PITCH = 25,
      [ox, oy] = [170, y(36, 'icon')]
    const cells = []
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        cells.push({
          input: await cut(ox + c * PITCH, oy + r * PITCH, 24, 24, ICONS),
          left: c * 24,
          top: r * 24,
        })
    await compose(COLS * 24, ROWS * 24, cells).toFile(`${dir}/icons.png`)
    // nothing may fall into the 1px gutters between cells
    const count = async (buf) =>
      (await sharp(buf).ensureAlpha().raw().toBuffer()).filter((_, i) => i % 4 === 3 && _ > 0)
        .length
    const block = await cut(ox, oy, COLS * PITCH - 1, ROWS * PITCH - 1, ICONS)
    const inBlock = await count(block),
      inAtlas = await count(await sharp(`${dir}/icons.png`).toBuffer())
    if (inBlock !== inAtlas)
      throw new Error(
        `${name}/icons: ${inBlock - inAtlas} opaque pixels fell outside the 24px cells`,
      )
    built.icons = `${COLS}x${ROWS} cells`
  }

  for (const [out, note] of Object.entries(built)) {
    const m = await mask(`${dir}/${out}.png`)
    if (!masks[out]) masks[out] = m
    else if (masks[out] !== m)
      throw new Error(`${name}/${out}: alpha mask differs from gilded — palette offset is off`)
  }
  console.log(
    name,
    Object.entries(built)
      .map(([k, n]) => (n ? `${k} (${n})` : k))
      .join(', '),
  )
}
