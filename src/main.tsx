import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App'

if (import.meta.env.VITE_DEMO) {
  const { seedDemo } = await import('./demo')
  seedDemo()
}

registerSW({ immediate: true })

// Best-effort portrait lock (works for installed PWAs on Android; ignored elsewhere).
const orientation = screen.orientation as ScreenOrientation & {
  lock?: (o: string) => Promise<void>
}
orientation?.lock?.('portrait').catch(() => {})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
