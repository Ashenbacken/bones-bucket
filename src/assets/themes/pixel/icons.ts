/**
 * The kit's 24px icon set, as laid out in `<palette>/icons.png` (8 columns × 9 rows of 24px
 * cells, built by scripts/kit-pixel.mjs). Names are ours; the row/column is the cell.
 */
const GRID = [
  ['heart', 'potion', 'bottle', 'flask', 'jar', 'hat', 'bone', 'snail'],
  ['tail', 'gem-eye', 'cup', 'star', 'sword', 'shield', 'bow', 'arrow'],
  ['moon', 'skull', 'diamond', 'coin', 'dagger', 'pickaxe', 'axe', 'arrows'],
  ['broom', 'bucket', 'claw', 'drop', 'rock', 'waves', 'lightning', 'fire'],
  [
    'exclaim',
    'exclaim-double',
    'question',
    'cross',
    'check',
    'book',
    'diamond-cross',
    'celtic-cross',
  ],
  [
    'triangle',
    'triangle-solid',
    'hourglass',
    'frame-ornate',
    'frame-diamond',
    'grid',
    'sun',
    'horn',
  ],
  ['orb', 'lantern', 'egg', 'arrow-up', 'frame', 'ring', 'cube', 'feather'],
  ['syringe', 'cross-plus', 'key', 'key-ornate', 'spray', 'jar-tall', 'chest', 'target'],
  ['candle', 'candelabra', 'bell', 'envelope', 'pipe', 'tree', 'clock', 'antlers'],
] as const

export type PixelIcon = (typeof GRID)[number][number]
export const PIXEL_ICONS: readonly PixelIcon[] = GRID.flat()
export const ICON_SIZE = 24
export const ATLAS_COLS = GRID[0].length
export const ATLAS_ROWS = GRID.length

/** Cell of an icon in the atlas, in pixels. */
export function iconCell(icon: PixelIcon): { x: number; y: number } {
  const i = PIXEL_ICONS.indexOf(icon)
  return { x: (i % ATLAS_COLS) * ICON_SIZE, y: Math.floor(i / ATLAS_COLS) * ICON_SIZE }
}

/** Which kit icon stands in for each character's crest in the pixel themes. */
export const CHARACTER_ICON: Record<string, PixelIcon> = {
  unknown: 'question',
  digger: 'pickaxe',
  captain: 'sword',
  marrowbone: 'bone',
  lord: 'shield',
  raven: 'feather',
  gnaw: 'skull',
  shadow: 'moon',
  count: 'candelabra',
  hollow: 'hourglass',
  mutt: 'pipe',
  crypt: 'key',
  mcmarrow: 'axe',
  femurson: 'arrows',
  howler: 'bell',
  brother: 'book',
  scavenger: 'chest',
  underfoot: 'snail',
  widow: 'potion',
  lanternjaw: 'lantern',
  inspector: 'clock',
}

export const characterIcon = (characterId: string): PixelIcon =>
  CHARACTER_ICON[characterId] ?? CHARACTER_ICON.unknown
