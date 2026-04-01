import { useRef, useState, useEffect, type ReactNode } from 'react'
import { snapshotBones } from './extract.js'
import type { Bone, SkeletonResult, ResponsiveBones, SnapshotConfig } from './types.js'

// ── Bones registry ──────────────────────────────────────────────────────────
const bonesRegistry = new Map<string, SkeletonResult | ResponsiveBones>()

/**
 * Register pre-generated bones so `<Skeleton name="...">` can auto-resolve them.
 *
 * Called by the generated `registry.js` file (created by `npx boneyard build`).
 * Import it once in your app entry point:
 *
 * ```ts
 * import './bones/registry'
 * ```
 */
export function registerBones(map: Record<string, SkeletonResult | ResponsiveBones>): void {
  for (const [name, bones] of Object.entries(map)) {
    bonesRegistry.set(name, bones)
  }
}

// ── Expose snapshotBones for CLI build mode (module-level, no useEffect) ────
if (typeof window !== 'undefined' && (window as any).__BONEYARD_BUILD) {
  (window as any).__BONEYARD_SNAPSHOT = snapshotBones
}

/** Pick the right SkeletonResult from a responsive set for the current width */
function resolveResponsive(
  bones: SkeletonResult | ResponsiveBones,
  width: number,
): SkeletonResult | null {
  if (!('breakpoints' in bones)) return bones
  const bps = Object.keys(bones.breakpoints).map(Number).sort((a, b) => a - b)
  if (bps.length === 0) return null
  const match = [...bps].reverse().find(bp => width >= bp) ?? bps[0]
  return bones.breakpoints[match] ?? null
}

/** Mix a hex color toward white by `amount` (0–1). */
function lightenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const nr = Math.round(r + (255 - r) * amount)
  const ng = Math.round(g + (255 - g) * amount)
  const nb = Math.round(b + (255 - b) * amount)
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}

export interface SkeletonProps {
  /** When true, shows the skeleton. When false, shows children. */
  loading: boolean
  /** Your component — rendered when not loading. */
  children: ReactNode
  /**
   * Name this skeleton. Used by `npx boneyard build` to identify and capture bones.
   * Also used to auto-resolve pre-generated bones from the registry.
   */
  name?: string
  /**
   * Pre-generated bones. Accepts a single `SkeletonResult` or a `ResponsiveBones` map.
   */
  initialBones?: SkeletonResult | ResponsiveBones
  /** Bone color (default: '#e0e0e0') */
  color?: string
  /** Enable pulse animation (default: true) */
  animate?: boolean
  /** Additional className for the container */
  className?: string
  /**
   * Shown when loading is true and no bones are available.
   */
  fallback?: ReactNode
  /**
   * Mock content rendered during `npx boneyard build` so the CLI can capture
   * bone positions even when real data isn't available.
   * Only rendered when the CLI sets `window.__BONEYARD_BUILD = true`.
   */
  fixture?: ReactNode
  /**
   * Controls how `npx boneyard build` extracts bones from the fixture.
   * Stored as a data attribute — the CLI reads it during capture.
   */
  snapshotConfig?: SnapshotConfig
}

/**
 * Wrap any component to get automatic skeleton loading screens.
 *
 * 1. Run `npx boneyard build` — captures bone positions from your rendered UI
 * 2. Import the generated registry in your app entry
 * 3. `<Skeleton name="..." loading={isLoading}>` auto-resolves bones by name
 */
export function Skeleton({
  loading,
  children,
  name,
  initialBones,
  color = '#e0e0e0',
  animate = true,
  className,
  fallback,
  fixture,
  snapshotConfig,
}: SkeletonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  const isBuildMode = typeof window !== 'undefined' && (window as any).__BONEYARD_BUILD === true

  // Track container width for responsive breakpoint selection
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      setContainerWidth(Math.round(entries[0]?.contentRect.width ?? 0))
    })
    ro.observe(el)
    setContainerWidth(Math.round(el.getBoundingClientRect().width))
    return () => ro.disconnect()
  }, [])

  // Data attributes for CLI discovery
  const dataAttrs: Record<string, string> = {}
  if (name) {
    dataAttrs['data-boneyard'] = name
    if (snapshotConfig) {
      dataAttrs['data-boneyard-config'] = JSON.stringify(snapshotConfig)
    }
  }

  // Build mode: render fixture so CLI can capture bones from it
  if (isBuildMode && fixture) {
    return (
      <div ref={containerRef} className={className} style={{ position: 'relative' }} {...dataAttrs}>
        <div>{fixture}</div>
      </div>
    )
  }

  // Resolve bones: explicit initialBones > registry lookup
  const effectiveBones = initialBones ?? (name ? bonesRegistry.get(name) : undefined)
  const activeBones = effectiveBones && containerWidth > 0
    ? resolveResponsive(effectiveBones, containerWidth)
    : null

  const showSkeleton = loading && activeBones
  const showFallback = loading && !activeBones

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }} {...dataAttrs}>
      <div style={showSkeleton ? { visibility: 'hidden' } : undefined}>
        {showFallback ? fallback : children}
      </div>

      {showSkeleton && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'relative', width: '100%', height: activeBones.height }}>
            {activeBones.bones.map((b: Bone, i: number) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: b.x,
                  top: b.y,
                  width: b.w,
                  height: b.h,
                  borderRadius: typeof b.r === 'string' ? b.r : `${b.r}px`,
                  backgroundColor: b.c ? lightenHex(color, 0.45) : color,
                  animation: animate ? 'boneyard-pulse 1.8s ease-in-out infinite' : undefined,
                }}
              />
            ))}
            {animate && (
              <style>{`@keyframes boneyard-pulse{0%,100%{background-color:${color}}50%{background-color:${lightenHex(color, 0.3)}}}`}</style>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
