export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export const canShare = () =>
  typeof navigator !== 'undefined' && typeof navigator.share === 'function'

export async function shareLink(
  url: string,
  title: string,
): Promise<'shared' | 'cancelled' | 'unsupported'> {
  if (!canShare()) return 'unsupported'
  try {
    await navigator.share({ title, url })
    return 'shared'
  } catch {
    return 'cancelled'
  }
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function shareJsonFile(filename: string, data: unknown): Promise<boolean> {
  if (!canShare()) return false
  const file = new File([JSON.stringify(data)], filename, { type: 'application/json' })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (!nav.canShare?.({ files: [file] })) return false
  try {
    await navigator.share({ files: [file], title: 'Bones Bucket backup' })
    return true
  } catch {
    return false
  }
}
