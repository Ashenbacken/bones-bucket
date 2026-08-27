// Dev tool: contact sheet of a UI kit folder. Usage: node scripts/kit-sheet.mjs <kitDir> <out.png>
// Contact sheet of every PNG in a kit folder, nearest-neighbour upscaled, labelled by index.
import sharp from 'sharp'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
const root = process.argv[2],
  out = process.argv[3]
const files = []
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (f.endsWith('.png')) files.push(p)
  }
}
walk(root)
files.sort()
const CELL = 260,
  PAD = 12,
  COLS = 5
const tiles = []
for (let i = 0; i < files.length; i++) {
  const img = sharp(files[i])
  const m = await img.metadata()
  const scale = Math.max(1, Math.floor(Math.min((CELL - 30) / m.width, (CELL - 30) / m.height)))
  const w = Math.min(CELL - 8, m.width * scale),
    h = Math.min(CELL - 30, m.height * scale)
  const buf = await img
    .resize({ width: w, height: h, fit: 'inside', kernel: 'nearest' })
    .png()
    .toBuffer()
  const label = Buffer.from(
    `<svg width="${CELL}" height="26"><text x="4" y="18" font-family="Helvetica" font-size="12" fill="#ddd">${i}: ${relative(root, files[i]).replace(/&/g, '&amp;').slice(-38)}</text></svg>`,
  )
  tiles.push({ buf, label, w, h })
}
const rows = Math.ceil(tiles.length / COLS)
const W = COLS * (CELL + PAD) + PAD,
  H = rows * (CELL + PAD) + PAD
const comps = []
tiles.forEach((t, i) => {
  const x = PAD + (i % COLS) * (CELL + PAD),
    y = PAD + Math.floor(i / COLS) * (CELL + PAD)
  comps.push({ input: t.label, left: x, top: y })
  comps.push({ input: t.buf, left: x + Math.floor((CELL - t.w) / 2), top: y + 28 })
})
await sharp({ create: { width: W, height: H, channels: 4, background: '#3a3f47' } })
  .composite(comps)
  .png()
  .toFile(out)
console.log(files.length, 'tiles ->', out, W + 'x' + H)
