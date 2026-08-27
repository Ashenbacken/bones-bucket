// Dev tool: phone-sized screenshots of every theme × tab, for eyeballing theme changes.
// Usage: VITE_DEMO=1 npm run dev   (in another shell, seeds sample bones)
//        node scripts/shots.mjs [baseUrl] [theme ...]   → writes design/shots/<theme>-<tab>.png
// Drives the locally installed Google Chrome through playwright-core (no browser download).
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const [base = 'http://localhost:5173', ...only] = process.argv.slice(2)
const THEMES = only.length
  ? only
  : ['crypt', 'hades', 'necro', 'gilded', 'tarnished', 'cobalt', 'umber']
const TABS = ['bucket', 'report', 'settings']
const OUT = 'design/shots'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
const page = await ctx.newPage()
for (const theme of THEMES) {
  // Fresh storage per theme so the demo seed applies the theme from the URL.
  await page.goto(`${base}/?theme=${theme}`)
  await page.evaluate(() => localStorage.clear())
  for (const tab of TABS) {
    await page.goto(`${base}/?theme=${theme}&tab=${tab}`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(400)
    const file = `${OUT}/${theme}-${tab}.png`
    await page.screenshot({ path: file })
    console.log(file)
  }
}
await browser.close()
