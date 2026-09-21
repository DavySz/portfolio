/**
 * Decide o quanto de WebGL a página pode pagar ANTES de baixar o three.js.
 * Este arquivo é importado de forma estática: precisa ficar minúsculo.
 */
export type QualityTier = 'off' | 'low' | 'high'

export interface Quality {
  tier: QualityTier
  /** false = renderiza um único frame estático (prefers-reduced-motion) */
  animate: boolean
  pixelRatio: number
}

type NavigatorHints = Navigator & {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

export function detectQuality(): Quality {
  if (typeof window === 'undefined') return { tier: 'off', animate: false, pixelRatio: 1 }

  const nav = navigator as NavigatorHints
  const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (nav.connection?.saveData) return { tier: 'off', animate, pixelRatio: 1 }

  const isCoarse = window.matchMedia('(pointer: coarse)').matches
  const isLowMemory = nav.deviceMemory !== undefined && nav.deviceMemory <= 4

  if (isCoarse || isLowMemory) return { tier: 'low', animate, pixelRatio: 1 }

  return { tier: 'high', animate, pixelRatio: Math.min(window.devicePixelRatio, 2) }
}
