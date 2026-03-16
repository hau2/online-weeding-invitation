'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import type { TemplateId } from '@repo/types'
import { EnvelopeAnimationFallback } from './EnvelopeAnimationFallback'

interface EnvelopeAnimationProps {
  templateId: TemplateId
  groomName: string
  brideName: string
  guestName?: string
  onOpen: () => void
}

const ENVELOPE_COLORS: Record<TemplateId, { body: string; flap: string; seal: string; text: string }> = {
  traditional: { body: '#8B0000', flap: '#A52A2A', seal: '#DAA520', text: '#FFD700' },
  modern: { body: '#FFFFFF', flap: '#F5F5F5', seal: '#B76E79', text: '#333333' },
  minimalist: { body: '#FFFDD0', flap: '#F5F5DC', seal: '#888888', text: '#333333' },
}

type AnimationStage = 'sealed' | 'opening' | 'revealed'

export function EnvelopeAnimation({
  templateId,
  groomName,
  brideName,
  guestName,
  onOpen,
}: EnvelopeAnimationProps) {
  const [useFallback, setUseFallback] = useState<boolean | null>(null)
  const [stage, setStage] = useState<AnimationStage>('sealed')
  const colors = ENVELOPE_COLORS[templateId]
  const envelopeControls = useAnimation()
  const flapControls = useAnimation()
  const sealControls = useAnimation()
  const cardControls = useAnimation()
  const frameTimesRef = useRef<number[]>([])
  const lastFrameRef = useRef<number>(0)

  // Performance gate: measure 8 rAF frame times on mount
  useEffect(() => {
    let frameCount = 0
    let rafId: number
    const frameTimes: number[] = []
    let lastTime = 0

    const measure = (timestamp: number) => {
      if (lastTime > 0) {
        frameTimes.push(timestamp - lastTime)
      }
      lastTime = timestamp
      frameCount++

      if (frameCount < 9) {
        // Need 9 callbacks to get 8 frame time deltas
        rafId = requestAnimationFrame(measure)
      } else {
        // Done measuring - compute average
        const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
        setUseFallback(avg > 20)
      }
    }

    rafId = requestAnimationFrame(measure)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [])

  const measureFrameTime = useCallback(() => {
    const now = performance.now()
    if (lastFrameRef.current > 0) {
      frameTimesRef.current.push(now - lastFrameRef.current)
    }
    lastFrameRef.current = now
  }, [])

  const getConfettiParticleCount = useCallback(() => {
    const slowFrames = frameTimesRef.current.filter((t) => t > 20)
    return slowFrames.length > 0 ? 40 : 80
  }, [])

  const handleOpen = useCallback(async () => {
    if (stage !== 'sealed') return
    setStage('opening')

    // Start frame measurement
    let rafId: number
    const measureLoop = () => {
      measureFrameTime()
      rafId = requestAnimationFrame(measureLoop)
    }
    rafId = requestAnimationFrame(measureLoop)

    // 1. Flap lifts open
    await Promise.all([
      flapControls.start({
        rotateX: -180,
        transition: { duration: 0.8, ease: 'easeInOut' },
      }),
      sealControls.start({
        opacity: 0,
        transition: { duration: 0.3 },
      }),
    ])

    // 2. Card slides up from envelope
    await cardControls.start({
      y: -100,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    })

    // 3. Envelope fades away
    setStage('revealed')
    cancelAnimationFrame(rafId)

    await envelopeControls.start({
      scale: 0.8,
      opacity: 0,
      transition: { duration: 0.5, ease: 'easeIn' },
    })

    // Fire confetti
    try {
      const confettiModule = await import('canvas-confetti')
      const confetti = confettiModule.default ?? confettiModule
      if (typeof confetti === 'function') {
        confetti({
          particleCount: getConfettiParticleCount(),
          spread: 60,
          origin: { y: 0.6 },
        })
      }
    } catch {
      // Confetti failure is non-blocking
    }

    onOpen()
  }, [
    stage,
    flapControls,
    sealControls,
    cardControls,
    envelopeControls,
    onOpen,
    measureFrameTime,
    getConfettiParticleCount,
  ])

  const handleSkip = useCallback(() => {
    onOpen()
  }, [onOpen])

  // While measuring frames, show static sealed envelope (no animation yet)
  if (useFallback === null) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,245,245,0.95), rgba(255,255,255,0.95))',
        }}
      >
        <div
          className="relative cursor-pointer select-none"
          style={{ width: 280, height: 200 }}
        >
          {/* Envelope body */}
          <div
            data-testid="envelope-body"
            className="absolute inset-0 rounded-lg shadow-2xl"
            style={{
              backgroundColor: colors.body,
              backgroundImage:
                'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)',
            }}
          />

          {/* Envelope bottom fold */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: 80,
              clipPath: 'polygon(0 100%, 50% 20%, 100% 100%)',
              backgroundColor: colors.flap,
              opacity: 0.3,
            }}
          />

          {/* Envelope flap */}
          <div
            className="absolute left-0 right-0 top-0"
            style={{ height: 100, zIndex: 10 }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                backgroundColor: colors.flap,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              }}
            />
          </div>

          {/* Wax seal */}
          <div
            data-testid="wax-seal"
            className="absolute left-1/2 z-20 flex items-center justify-center rounded-full shadow-lg"
            style={{
              top: 70,
              width: 48,
              height: 48,
              marginLeft: -24,
              backgroundColor: colors.seal,
              border: `3px solid ${colors.seal}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)',
            }}
          >
            <span className="text-lg font-bold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {templateId === 'traditional' ? '\u56CD' : '\u2665'}
            </span>
          </div>

          {/* Greeting text */}
          <div
            className="absolute inset-x-0 flex flex-col items-center"
            style={{ top: 130, zIndex: 5 }}
          >
            <p
              className="text-xs font-medium tracking-widest uppercase"
              style={{ color: colors.text }}
            >
              Tran trong kinh moi
            </p>
            {guestName && (
              <p
                data-testid="guest-name"
                className="mt-1 text-sm font-semibold"
                style={{ color: colors.text }}
              >
                {guestName}
              </p>
            )}
          </div>
        </div>

        {/* Skip button - always visible during measurement */}
        <button
          onClick={handleSkip}
          aria-label="Bo qua"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 min-h-12 min-w-12 rounded-full px-6 py-3 text-sm font-medium tracking-wide text-gray-400 transition-colors hover:text-gray-600"
        >
          Bo qua &gt;&gt;
        </button>
      </div>
    )
  }

  // Slow device detected: use CSS-only fallback
  if (useFallback === true) {
    return (
      <EnvelopeAnimationFallback
        templateId={templateId}
        groomName={groomName}
        brideName={brideName}
        guestName={guestName}
        onOpen={onOpen}
      />
    )
  }

  // Fast device: use full framer-motion animation
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,245,245,0.95), rgba(255,255,255,0.95))',
        }}
        animate={envelopeControls}
      >
        {/* Envelope container */}
        <motion.div
          className="relative cursor-pointer select-none"
          style={{ width: 280, height: 200, perspective: 800 }}
          onClick={stage === 'sealed' ? handleOpen : undefined}
          role="button"
          aria-label="Mo thiep cuoi"
        >
          {/* Envelope body */}
          <motion.div
            data-testid="envelope-body"
            className="absolute inset-0 rounded-lg shadow-2xl"
            style={{
              backgroundColor: colors.body,
              backgroundImage:
                'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)',
            }}
          />

          {/* Envelope bottom fold (decorative triangle) */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: 80,
              clipPath: 'polygon(0 100%, 50% 20%, 100% 100%)',
              backgroundColor: colors.flap,
              opacity: 0.3,
            }}
          />

          {/* Card inside envelope */}
          <motion.div
            className="absolute left-4 right-4 rounded-t-md"
            style={{
              top: 20,
              height: 160,
              backgroundColor: '#FFF',
              boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
              opacity: 0,
              zIndex: 15,
            }}
            animate={cardControls}
          >
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <p className="text-xs tracking-widest text-gray-400 uppercase">Thiep cuoi</p>
              <p className="mt-2 font-serif text-lg font-bold text-gray-800">
                {groomName} & {brideName}
              </p>
            </div>
          </motion.div>

          {/* Envelope flap */}
          <motion.div
            className="absolute left-0 right-0 top-0"
            style={{
              height: 100,
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              zIndex: 10,
            }}
            animate={flapControls}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                backgroundColor: colors.flap,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              }}
            />
          </motion.div>

          {/* Wax seal */}
          <motion.div
            data-testid="wax-seal"
            className="absolute left-1/2 z-20 flex items-center justify-center rounded-full shadow-lg"
            style={{
              top: 70,
              width: 48,
              height: 48,
              marginLeft: -24,
              backgroundColor: colors.seal,
              border: `3px solid ${colors.seal}`,
              boxShadow: `0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)`,
            }}
            animate={sealControls}
          >
            <span className="text-lg font-bold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {templateId === 'traditional' ? '\u56CD' : '\u2665'}
            </span>
          </motion.div>

          {/* Greeting text */}
          <div
            className="absolute inset-x-0 flex flex-col items-center"
            style={{ top: 130, zIndex: 5 }}
          >
            <p
              className="text-xs font-medium tracking-widest uppercase"
              style={{ color: colors.text }}
            >
              Tran trong kinh moi
            </p>
            {guestName && (
              <p
                data-testid="guest-name"
                className="mt-1 text-sm font-semibold"
                style={{ color: colors.text }}
              >
                {guestName}
              </p>
            )}
          </div>
        </motion.div>

        {/* Skip button - centered at bottom, always visible */}
        <button
          onClick={handleSkip}
          aria-label="Bo qua"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 min-h-12 min-w-12 rounded-full px-6 py-3 text-sm font-medium tracking-wide text-gray-400 transition-colors hover:text-gray-600"
        >
          Bo qua &gt;&gt;
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
