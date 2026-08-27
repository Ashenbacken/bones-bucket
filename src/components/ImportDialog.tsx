import { useAtomValue } from 'jotai'
import { storeAtom } from '@/atoms/store'
import type { Store } from '@/domain/types'
import { summarize } from '@/domain/store'
import { previewMerge } from '@/domain/merge'
import { formatDay } from '@/domain/days'
import { Button } from './Button'
import { Dialog } from './Dialog'

interface Props {
  incoming: Store | null
  error?: string | null
  source: 'link' | 'file'
  onReplace: () => void
  /** Offered when set: combine the incoming bucket with the local one instead of replacing it. */
  onMerge?: () => void
  onClose: () => void
}

export function ImportDialog({ incoming, error, source, onReplace, onMerge, onClose }: Props) {
  const local = useAtomValue(storeAtom)
  const open = incoming !== null || !!error
  const s = incoming ? summarize(incoming) : null
  const merge = incoming && onMerge ? previewMerge(local, incoming) : null
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={source === 'link' ? 'Bucket handed to you' : 'Import backup'}
    >
      {error && <p className="etched p-3 text-center font-semibold text-ivory">{error}</p>}
      {s && (
        <>
          <div className="etched etched-quiet p-3 text-center">
            <div className="font-display glow-red text-2xl">{s.bones} bones</div>
            <div className="text-sm text-ivory-2">
              {s.collectors} collector{s.collectors === 1 ? '' : 's'}
              {s.latest ? ` · latest ${formatDay(s.latest).toLowerCase()}` : ''}
            </div>
          </div>
          {merge ? (
            <div className="mt-3 flex flex-col gap-1 text-sm text-ivory-2">
              <p>
                <span className="engraved font-bold">Merge</span> keeps your bucket and adds{' '}
                {merge.addedBones} bone{merge.addedBones === 1 ? '' : 's'}
                {merge.newCollectors
                  ? ` and ${merge.newCollectors} new collector${merge.newCollectors === 1 ? '' : 's'}`
                  : ''}
                . Days you both counted keep the higher number.
              </p>
              <p>
                <span className="engraved font-bold">Replace</span> throws yours away and takes
                theirs as is.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-center text-sm text-ivory-2">
              This replaces the bucket on this phone. The other phone keeps its copy.
            </p>
          )}
        </>
      )}
      <div className="mt-4 flex gap-2">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          {s ? 'Keep mine' : 'Close'}
        </Button>
        {s && merge && (
          <Button variant="wood" onClick={onMerge} className="flex-1">
            Merge
          </Button>
        )}
        {s && (
          <Button variant="primary" onClick={onReplace} className="flex-1">
            Replace
          </Button>
        )}
      </div>
    </Dialog>
  )
}
