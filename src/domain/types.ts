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

export type Theme = 'crypt' | 'hades' | 'necro' | 'gilded'

export interface Settings {
  sound: boolean
  haptics: boolean
  /** Animated background/frame. */
  spooky: boolean
  /** Visual theme: Crypt (slate & pewter), Hades (marble & bronze) or Necromancer (obsidian & ghoul-green). */
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
