import { describe, expect, it } from 'vitest'
import { CHARACTERS, UNKNOWN_CHARACTER } from '@/characters/catalog'
import {
  ATLAS_COLS,
  ATLAS_ROWS,
  CHARACTER_ICON,
  characterIcon,
  iconCell,
  PIXEL_ICONS,
} from './icons'

describe('pixel icons', () => {
  it('names every cell of the 8×9 atlas exactly once', () => {
    expect(PIXEL_ICONS).toHaveLength(ATLAS_COLS * ATLAS_ROWS)
    expect(new Set(PIXEL_ICONS).size).toBe(PIXEL_ICONS.length)
    expect(iconCell('heart')).toEqual({ x: 0, y: 0 })
    expect(iconCell('skull')).toEqual({ x: 24, y: 48 })
    expect(iconCell('antlers')).toEqual({ x: 168, y: 192 })
  })

  it('gives every character its own icon', () => {
    const ids = [UNKNOWN_CHARACTER.id, ...CHARACTERS.map((c) => c.id)]
    for (const id of ids) expect(CHARACTER_ICON[id], id).toBeDefined()
    const icons = ids.map((id) => CHARACTER_ICON[id])
    expect(new Set(icons).size).toBe(icons.length)
    expect(characterIcon('no-such-character')).toBe('question')
  })
})
