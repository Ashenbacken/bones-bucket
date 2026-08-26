import type { Store } from './types'
import { parseStore, StoreParseError } from './store'

/**
 * Hand-off link format: `#h=<v><payload>` where <v> is a one-char codec marker:
 *   d  deflate-raw compressed JSON, base64url
 *   r  raw JSON, base64url (fallback when CompressionStream is unavailable)
 * The hash never leaves the device — fragments aren't sent to servers.
 */
export const HANDOFF_PARAM = 'h'

const enc = new TextEncoder()
const dec = new TextDecoder()

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)
  const bin = atob(b64)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

async function pipe(bytes: Uint8Array, stream: GenericTransformStream) {
  const source = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    },
  })
  const reader = source.pipeThrough(stream).getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    chunks.push(value)
    total += value.length
  }
  const out = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    out.set(c, offset)
    offset += c.length
  }
  return out
}

const hasCompression = () =>
  typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined'

/** Strip everything not needed for a hand-off (settings are device preferences). */
export function handoffPayload(store: Store) {
  return { version: store.version, collectors: store.collectors, bones: store.bones }
}

export async function encodeHandoff(store: Store): Promise<string> {
  const json = enc.encode(JSON.stringify(handoffPayload(store)))
  if (hasCompression()) {
    const packed = await pipe(json, new CompressionStream('deflate-raw'))
    return 'd' + toBase64Url(packed)
  }
  return 'r' + toBase64Url(json)
}

export async function decodeHandoff(payload: string): Promise<Store> {
  const marker = payload[0]
  const body = fromBase64Url(payload.slice(1))
  let json: string
  if (marker === 'd') {
    if (!hasCompression()) throw new StoreParseError('This browser cannot read compressed links')
    json = dec.decode(await pipe(body, new DecompressionStream('deflate-raw')))
  } else if (marker === 'r') {
    json = dec.decode(body)
  } else {
    throw new StoreParseError('Unknown link format')
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new StoreParseError('Link is corrupt')
  }
  return parseStore(parsed)
}

export function buildHandoffUrl(payload: string, base: string = location.href): string {
  const url = new URL(base)
  url.hash = `${HANDOFF_PARAM}=${payload}`
  return url.toString()
}

export function readHandoffFromHash(hash: string): string | null {
  const m = /^#?h=([A-Za-z0-9_-]+)$/.exec(hash)
  return m ? m[1] : null
}
