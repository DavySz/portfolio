'use client'

import { useEffect, useRef } from 'react'
import { detectQuality } from '../experience/quality'
import type { Experience } from '../experience/Experience'

interface ExperienceCanvasProps {
  className?: string
}

/**
 * Monta o canvas depois que a página já está interativa.
 * three.js vai num chunk separado (dynamic import) e nunca entra no caminho do LCP.
 * O fallback é o próprio background CSS do container, visível até o fade-in.
 */
export function ExperienceCanvas({ className }: ExperienceCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const quality = detectQuality()
    if (quality.tier === 'off') return

    let experience: Experience | undefined
    let cancelled = false

    const start = async () => {
      try {
        const { Experience } = await import('../experience/Experience')
        if (cancelled) return
        const instance = await Experience.create(container, quality)
        if (cancelled) instance.dispose()
        else experience = instance
      } catch (error) {
        // sem WebGPU nem WebGL2: o gradiente CSS continua lá, ninguém percebe
        console.warn('[experience] desativado:', error)
      }
    }

    // Safari antigo não tem requestIdleCallback
    const hasIdle = 'requestIdleCallback' in window
    const handle = hasIdle
      ? window.requestIdleCallback(() => void start(), { timeout: 2000 })
      : window.setTimeout(() => void start(), 300)

    return () => {
      cancelled = true
      if (hasIdle) window.cancelIdleCallback(handle)
      else window.clearTimeout(handle)
      experience?.dispose()
    }
  }, [])

  return <div ref={containerRef} className={className} aria-hidden="true" />
}
