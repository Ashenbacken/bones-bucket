/** Shape of the crest medallion behind the collector's initial. */
export type Crest = 'shield' | 'round' | 'lozenge' | 'banner'
/** Finish of the medallion's rim. */
export type Metal = 'pewter' | 'gold' | 'bronze' | 'iron'

export interface Character {
  id: string
  /** `{name}` is replaced with the player's name. */
  title: string
  crest: Crest
  metal: Metal
  /** Gem colour set into the rim. */
  gem: string
  /** Small ornament mounted at the top of the crest. */
  ornament: 'skull' | 'horns' | 'spikes' | 'wings' | 'none'
}

export const UNKNOWN_CHARACTER: Character = {
  id: 'unknown',
  title: '{name}',
  crest: 'round',
  metal: 'iron',
  gem: '#6b7078',
  ornament: 'none',
}

export const CHARACTERS: Character[] = [
  {
    id: 'digger',
    title: '{name} the Digger',
    crest: 'shield',
    metal: 'iron',
    gem: '#c8102e',
    ornament: 'spikes',
  },
  {
    id: 'captain',
    title: 'Captain {name}',
    crest: 'banner',
    metal: 'gold',
    gem: '#1f4e9a',
    ornament: 'skull',
  },
  {
    id: 'marrowbone',
    title: '{name} Marrowbone',
    crest: 'round',
    metal: 'pewter',
    gem: '#d8d3c6',
    ornament: 'skull',
  },
  {
    id: 'lord',
    title: 'Lord {name}',
    crest: 'shield',
    metal: 'gold',
    gem: '#5a1e8a',
    ornament: 'wings',
  },
  {
    id: 'raven',
    title: '{name} the Raven',
    crest: 'lozenge',
    metal: 'iron',
    gem: '#3b2a7a',
    ornament: 'wings',
  },
  {
    id: 'gnaw',
    title: '{name} Gnawsworth',
    crest: 'round',
    metal: 'bronze',
    gem: '#7a4a1a',
    ornament: 'spikes',
  },
  {
    id: 'shadow',
    title: '{name} of the Shadows',
    crest: 'lozenge',
    metal: 'pewter',
    gem: '#2c3e50',
    ornament: 'none',
  },
  {
    id: 'count',
    title: 'Count {name}',
    crest: 'shield',
    metal: 'pewter',
    gem: '#a3122a',
    ornament: 'horns',
  },
  {
    id: 'hollow',
    title: '{name} the Hollow',
    crest: 'round',
    metal: 'iron',
    gem: '#0e0f12',
    ornament: 'skull',
  },
  {
    id: 'mutt',
    title: 'Old {name}',
    crest: 'banner',
    metal: 'bronze',
    gem: '#8a5a2a',
    ornament: 'none',
  },
  {
    id: 'crypt',
    title: '{name} Cryptkeeper',
    crest: 'lozenge',
    metal: 'iron',
    gem: '#3e6b3a',
    ornament: 'skull',
  },
  {
    id: 'mcmarrow',
    title: '{name} McMarrow',
    crest: 'shield',
    metal: 'bronze',
    gem: '#2f6b4a',
    ornament: 'spikes',
  },
  {
    id: 'femurson',
    title: '{name} Femurson',
    crest: 'banner',
    metal: 'pewter',
    gem: '#7ab3d1',
    ornament: 'horns',
  },
  {
    id: 'howler',
    title: '{name} the Howler',
    crest: 'lozenge',
    metal: 'pewter',
    gem: '#b0b8c4',
    ornament: 'horns',
  },
  {
    id: 'brother',
    title: 'Brother {name}',
    crest: 'round',
    metal: 'gold',
    gem: '#8a1a1a',
    ornament: 'none',
  },
  {
    id: 'scavenger',
    title: '{name} the Scavenger',
    crest: 'banner',
    metal: 'iron',
    gem: '#d76b4a',
    ornament: 'wings',
  },
  {
    id: 'underfoot',
    title: '{name} Underfoot',
    crest: 'round',
    metal: 'bronze',
    gem: '#4e4a52',
    ornament: 'spikes',
  },
  {
    id: 'widow',
    title: '{name} the Widow',
    crest: 'lozenge',
    metal: 'gold',
    gem: '#c8102e',
    ornament: 'horns',
  },
  {
    id: 'lanternjaw',
    title: '{name} Lanternjaw',
    crest: 'shield',
    metal: 'bronze',
    gem: '#e07a2f',
    ornament: 'skull',
  },
  {
    id: 'inspector',
    title: 'Inspector {name}',
    crest: 'banner',
    metal: 'gold',
    gem: '#1a6b6b',
    ornament: 'none',
  },
]

const byId = new Map(CHARACTERS.map((c) => [c.id, c]))

export function getCharacter(id: string): Character {
  return byId.get(id) ?? UNKNOWN_CHARACTER
}

export function displayName(name: string, characterId: string): string {
  const trimmed = name.trim()
  if (!trimmed) return ''
  return getCharacter(characterId).title.replace('{name}', trimmed)
}

/** Characters not used by any given (active) collector. */
export function freeCharacters(usedIds: Iterable<string>): Character[] {
  const used = new Set(usedIds)
  return CHARACTERS.filter((c) => !used.has(c.id))
}

/**
 * Pick a random unused character; if all are taken, pick any (the UI shifts the gem hue for
 * duplicates). `rng` is injectable for tests.
 */
export function pickCharacter(
  usedIds: Iterable<string>,
  rng: () => number = Math.random,
): Character {
  const pool = freeCharacters(usedIds)
  const from = pool.length ? pool : CHARACTERS
  return from[Math.min(from.length - 1, Math.floor(rng() * from.length))]
}
