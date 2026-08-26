import { useEffect, useState } from 'react'
import { useAtomValue } from 'jotai'
import QRCode from 'qrcode'
import { storeAtom } from '@/atoms/store'
import { buildHandoffUrl, encodeHandoff } from '@/domain/handoff'
import { summarize } from '@/domain/store'
import { canShare, copyText, shareLink } from '@/lib/share'
import { Button } from './Button'
import { Dialog } from './Dialog'

const QR_MAX = 2900 // byte-mode capacity of a version-40 QR at error level L is 2953

export function HandoffDialog({ onClose }: { onClose: () => void }) {
  const store = useAtomValue(storeAtom)
  const [url, setUrl] = useState<string | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const payload = await encodeHandoff(store)
      const link = buildHandoffUrl(payload)
      if (cancelled) return
      setUrl(link)
      setCopied(await copyText(link))
      if (link.length <= QR_MAX) {
        try {
          setQr(
            await QRCode.toDataURL(link, {
              errorCorrectionLevel: 'L',
              margin: 1,
              width: 640,
              color: { dark: '#070b12', light: '#d8d3c6' },
            }),
          )
        } catch {
          setQr(null)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [store])

  const s = summarize(store)
  const kb = url ? (url.length / 1024).toFixed(1) : null

  return (
    <Dialog open onClose={onClose} title="Hand off the bucket">
      <p className="text-center text-sm text-ivory-2">
        {s.collectors} collectors · {s.bones} bones
      </p>
      <div className="etched etched-quiet mx-auto mt-3 aspect-square w-full max-w-[280px] overflow-hidden p-3">
        {qr ? (
          <img src={qr} alt="QR code with the hand-off link" className="h-full w-full rounded-sm" />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm font-semibold text-ivory-2">
            {url ? 'Too much history for a QR code — share the link instead.' : 'Packing bones…'}
          </div>
        )}
      </div>
      <p className="glow-gold mt-2 text-center text-sm font-semibold">
        {copied === true && 'Link copied ✓'}
        {copied === false && 'Could not copy automatically'}
      </p>
      <p className="text-center text-xs text-ivory-3">
        The whole bucket travels inside the link{kb ? ` (${kb} KB)` : ''}. Nothing is uploaded.
      </p>
      <div className="mt-4 flex gap-2">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Done
        </Button>
        {canShare() ? (
          <Button
            variant="primary"
            disabled={!url}
            onClick={() => url && shareLink(url, 'Bones Bucket')}
            className="flex-1"
          >
            Share link
          </Button>
        ) : (
          <Button
            variant="primary"
            disabled={!url}
            onClick={async () => url && setCopied(await copyText(url))}
            className="flex-1"
          >
            Copy link
          </Button>
        )}
      </div>
    </Dialog>
  )
}
