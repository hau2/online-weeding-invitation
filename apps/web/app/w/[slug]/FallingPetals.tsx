'use client'

interface FallingPetalsProps {
  petalColors?: string[]
  enabled?: boolean
}

const DEFAULT_PETAL_COLORS = ['#FFD1DC', '#FFC0CB', '#FFE4E1', '#FFFFFF']

const KEYFRAMES_CSS = `
@keyframes petal-fall {
  0% {
    transform: translateY(-10vh) translateX(0px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  25% {
    transform: translateY(22vh) translateX(15px) rotate(90deg);
  }
  50% {
    transform: translateY(50vh) translateX(-10px) rotate(180deg);
  }
  75% {
    transform: translateY(78vh) translateX(20px) rotate(270deg);
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) translateX(-5px) rotate(360deg);
    opacity: 0;
  }
}
`

// Deterministic pseudo-random for consistent SSR/client render
// Simple seeded PRNG to avoid hydration mismatch from Math.random()
function seededValues(count: number): number[] {
  const values: number[] = []
  let seed = 42
  for (let i = 0; i < count; i++) {
    seed = (seed * 16807 + 11) % 2147483647
    values.push((seed % 1000) / 1000)
  }
  return values
}

const PETAL_COUNT = 18
// Pre-compute: 4 random values per petal (left offset, duration, delay, size)
const RANDOM_VALUES = seededValues(PETAL_COUNT * 4)

interface PetalData {
  left: string
  duration: string
  delay: string
  width: number
  height: number
  colorIndex: number
}

function buildPetals(): PetalData[] {
  return Array.from({ length: PETAL_COUNT }, (_, i) => {
    const base = i * 4
    return {
      left: `${(i * 5.5 + RANDOM_VALUES[base] * 5) % 100}%`,
      duration: `${8 + RANDOM_VALUES[base + 1] * 7}s`,
      delay: `${RANDOM_VALUES[base + 2] * 10}s`,
      width: 8 + RANDOM_VALUES[base + 3] * 8,
      height: 10 + RANDOM_VALUES[base + 3] * 10,
      colorIndex: i,
    }
  })
}

const PETALS = buildPetals()

export function FallingPetals({ petalColors, enabled = true }: FallingPetalsProps) {
  if (!enabled) return null
  if (petalColors && petalColors.length === 0) return null

  const colors = petalColors ?? DEFAULT_PETAL_COLORS

  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 30 }}
      aria-hidden="true"
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES_CSS }} />
      {PETALS.map((petal, i) => {
        const color = colors[petal.colorIndex % colors.length]
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: petal.left,
              top: 0,
              width: petal.width,
              height: petal.height,
              borderRadius: '50% 0 50% 0',
              background: `radial-gradient(ellipse at 30% 30%, ${color}, ${color}88)`,
              opacity: 0.7,
              animation: `petal-fall linear infinite`,
              animationDuration: petal.duration,
              animationDelay: petal.delay,
              willChange: 'transform',
            }}
          />
        )
      })}
    </div>
  )
}
