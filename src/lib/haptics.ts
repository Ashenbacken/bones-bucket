export function buzz(pattern: number | number[] = 18) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* unsupported */
  }
}
