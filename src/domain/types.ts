/** Calendar day in the device's local time zone, formatted YYYY-MM-DD. */
export type DayKey = string

export interface Collector {
  id: string
  /** The player's real (first) name, as typed. */
  name: string
  /** Character from the catalog; drives artwork and title. */
  characterId: string
  createdAt: string
  /** Removed collectors are hidden but their bones stay in history. */
  removed?: boolean
}

export const THEMES = ['crypt', 'hades', 'necro', 'gilded', 'tarnished', 'cobalt', 'umber'] as const
export type Theme = (typeof THEMES)[number]
/** Themes drawn with the Gothic Pixel UI kit; one per palette row of the sprite sheet. */
export const PIXEL_THEMES = ['gilded', 'tarnished', 'cobalt', 'umber'] as const
export type PixelTheme = (typeof PIXEL_THEMES)[number]
export const isPixelTheme = (t: Theme): t is PixelTheme =>
  (PIXEL_THEMES as readonly string[]).includes(t)

export interface Settings {
  sound: boolean
  haptics: boolean
  /** Animated background/frame. */
  spooky: boolean
  /** Visual theme: Crypt, Hades, Necro, or one of the pixel-kit palettes (Gilded, Tarnished, Cobalt, Umber). */
  theme: Theme
  /** Hour (0–12) at which a new day starts; 0 = midnight, 4 = the night runs until 04:00. */
  dayStartHour: number
}

/** Per collector, per day bone counts. Absent = 0. */
export type BoneLedger = Record<string, Record<DayKey, number>>

export interface Store {
  version: 1
  collectors: Collector[]
  bones: BoneLedger
  settings: Settings
}
