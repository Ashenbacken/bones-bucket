import { isPixelTheme, type PixelTheme, type Theme } from '@/domain/types'
import gildedFrame from './gilded/frame-24.png'
import gildedOval from './gilded/oval.png'
import gildedToggle from './gilded/toggle.png'
import gildedSigil from './gilded/icon-bone.png'
import tarnishedFrame from './tarnished/frame-24.png'
import tarnishedOval from './tarnished/oval.png'
import tarnishedToggle from './tarnished/toggle.png'
import tarnishedSigil from './tarnished/icon-bone.png'
import cobaltFrame from './cobalt/frame-24.png'
import cobaltOval from './cobalt/oval.png'
import cobaltToggle from './cobalt/toggle.png'
import cobaltSigil from './cobalt/icon-bone.png'
import umberFrame from './umber/frame-24.png'
import umberOval from './umber/oval.png'
import umberToggle from './umber/toggle.png'
import umberSigil from './umber/icon-bone.png'
import gildedIcons from './gilded/icons.png'
import tarnishedIcons from './tarnished/icons.png'
import cobaltIcons from './cobalt/icons.png'
import umberIcons from './umber/icons.png'

/** Kit slices the components draw directly; the rest are CSS `--g-*` variables in index.css. */
export interface PixelAssets {
  /** Outer screen frame, 9-sliced (`border-image-slice: 28`). */
  frame: string
  /** 50×63 oval medallion behind the collector's initial. */
  oval: string
  /** 52×26 pill switch; flip horizontally for "on". */
  toggle: string
  /** 32×32 header crest. */
  sigil: string
  /** 24px icon atlas for the avatars; see icons.ts for the cells. */
  icons: string
}

const ASSETS: Record<PixelTheme, PixelAssets> = {
  gilded: {
    frame: gildedFrame,
    oval: gildedOval,
    toggle: gildedToggle,
    sigil: gildedSigil,
    icons: gildedIcons,
  },
  tarnished: {
    frame: tarnishedFrame,
    oval: tarnishedOval,
    toggle: tarnishedToggle,
    sigil: tarnishedSigil,
    icons: tarnishedIcons,
  },
  cobalt: {
    frame: cobaltFrame,
    oval: cobaltOval,
    toggle: cobaltToggle,
    sigil: cobaltSigil,
    icons: cobaltIcons,
  },
  umber: {
    frame: umberFrame,
    oval: umberOval,
    toggle: umberToggle,
    sigil: umberSigil,
    icons: umberIcons,
  },
}

/** The pixel-kit slices for a theme, or null for the hand-drawn themes. */
export function pixelAssets(theme: Theme): PixelAssets | null {
  return isPixelTheme(theme) ? ASSETS[theme] : null
}
