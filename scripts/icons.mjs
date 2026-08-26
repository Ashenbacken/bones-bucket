// Generates PWA icons from public/favicon.svg. Run: npm run icons
import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url))
const out = (name) => new URL(`../public/${name}`, import.meta.url).pathname

await sharp(svg, { density: 384 }).resize(512, 512).png().toFile(out('pwa-512.png'))
await sharp(svg, { density: 384 }).resize(192, 192).png().toFile(out('pwa-192.png'))
await sharp(svg, { density: 384 }).resize(180, 180).png().toFile(out('apple-touch-icon.png'))
console.log('icons written')
