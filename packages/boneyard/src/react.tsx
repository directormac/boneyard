import { useRef, useState, useEffect, type ReactNode } from 'react'
import { snapshotBones } from './extract.js'
import type { Bone, SkeletonResult, ResponsiveBones, SnapshotConfig } from './types.js'

// ── Bones registry ──────────────────────────────────────────────────────────
// Module-level registry populated by registerBones() from the generated registry file.
// This lets <Skeleton name="x"> auto-resolve bones without an explicit initialBones prop.

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
 *
 * Then every `<Skeleton name="blog-card">` automatically gets its bones — no
 * `initialBones` prop needed.
 */
export function registerBones(map: Record<string, SkeletonResult | ResponsiveBones>): void {
  for (const [name, bones] of Object.entries(map)) {
    bonesRegistry.set(name, bones)
  }
}

/** Pick the right SkeletonResult from a responsive set for the current width */
function resolveResponsive(
  bones: SkeletonResult | ResponsiveBones,
  width: number,
): SkeletonResult | null {
  if (!('breakpoints' in bones)) return bones
  const bps = Object.keys(bones.breakpoints).map(Number).sort((a, b) => a - b)
  if (bps.length === 0) return null
  // Largest breakpoint that fits (same logic as CSS min-width media queries)
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
  /** When true, shows the skeleton. When false, shows children and extracts layout. */
  loading: boolean
  /** Your component — rendered when not loading. The skeleton is extracted from it. */
  children: ReactNode
  /**
   * Name this skeleton. When provided:
   * - After each snapshot, bones are registered to `window.__PRESKEL_BONES[name]`
   * - The `boneyard build` CLI reads this registry to generate bones JSON files
   *
   * @example
   * <Skeleton name="blog-card" loading={isLoading}>
   *   <BlogCard />
   * </Skeleton>
   *
   * Then run: npx boneyard capture http://localhost:3000 --out ./src/bones
   * Which writes: ./src/bones/blog-card.bones.json
   */
  name?: string
  /**
   * Pre-generated bones for zero first-load flash.
   * Accepts a single `SkeletonResult` or a `ResponsiveBones` map (from `boneyard build`).
   *
   * - Single: used regardless of viewport width
   * - Responsive: boneyard picks the nearest breakpoint match for the current container width
   *
   * After the first real render, live `snapshotBones` measurements replace the initial bones.
   *
   * @example
   * import blogBones from './src/bones/blog-card.bones.json'
   * <Skeleton loading={isLoading} initialBones={blogBones}>
   *   <BlogCard />
   * </Skeleton>
   */
  initialBones?: SkeletonResult | ResponsiveBones
  /** Bone color (default: '#e0e0e0') */
  color?: string
  /** Enable pulse animation (default: true) */
  animate?: boolean
  /** Additional className for the container */
  className?: string
  /**
   * Shown on the very first load if no cached bones and no initialBones.
   * Unnecessary when initialBones is provided.
   */
  fallback?: ReactNode
  /**
   * Controls how boneyard extracts bones from your component's DOM.
   * Override the default extraction rules to match your design system.
   *
   * @example
   * // Treat <Card> root divs as leaves, skip icons and footers
   * snapshotConfig={{
   *   leafTags: ['p', 'h1', 'h2', 'h3', 'li'],
   *   excludeSelectors: ['.icon', '[data-no-skeleton]', 'footer'],
   * }}
   */
  snapshotConfig?: SnapshotConfig
}

/**
 * Wrap any component to get automatic skeleton loading screens.
 *
 * How it works:
 * 1. When loading=false, your children render normally.
 *    After paint, boneyard snapshots the exact bone positions from the DOM.
 * 2. When loading=true, the cached bones are replayed as a skeleton overlay.
 * 3. On the very first load (no cache yet):
 *    - With `initialBones`: shows pre-generated bones immediately, no flash
 *    - Without: shows the `fallback` prop
 *
 * For zero first-load flash, run `npx boneyard capture` to generate initialBones.
 *
 * @example Basic
 * ```tsx
 * import { Skeleton } from 'boneyard/react'
 *
 * <Skeleton name="blog-card" loading={isLoading}>
 *   <BlogCard data={data} />
 * </Skeleton>
 * ```
 *
 * @example With pre-generated responsive bones (zero flash)
 * ```tsx
 * import blogBones from './src/bones/blog-card.bones.json'
 *
 * <Skeleton name="blog-card" loading={isLoading} initialBones={blogBones}>
 *   <BlogCard data={data} />
 * </Skeleton>
 * ```
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
  snapshotConfig,
}: SkeletonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cachedBones, setCachedBones] = useState<SkeletonResult | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Track container width so responsive initialBones picks the right breakpoint
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

  // After every non-loading render, snapshot the DOM and update the cache
  useEffect(() => {
    if (loading || !containerRef.current) return

    let raf1: number, raf2: number
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const el = containerRef.current
        if (!el) return
        const firstChild = el.firstElementChild as Element | null
        if (!firstChild) return
        try {
          const result = snapshotBones(firstChild, name ?? 'component', snapshotConfig)
          setCachedBones(result)

          // Register to global so `boneyard build` CLI can read it
          if (name && typeof window !== 'undefined') {
            const w = window as any
            w.__BONEYARD_BONES = w.__BONEYARD_BONES ?? {}
            w.__BONEYARD_BONES[name] = result
          }
        } catch {
          // keep existing cache on error
        }
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [loading, name])

  // Active bones: live cache > explicit initialBones > registry lookup
  const effectiveInitialBones = initialBones ?? (name ? bonesRegistry.get(name) : undefined)
  const resolved = !cachedBones && effectiveInitialBones && containerWidth > 0
    ? resolveResponsive(effectiveInitialBones, containerWidth)
    : null
  const activeBones = cachedBones ?? resolved

  const showSkeleton = loading && activeBones
  const showFallback = loading && !activeBones

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      {/* Real content — hidden but still rendered so we can snapshot it */}
      <div style={showSkeleton ? { visibility: 'hidden' } : undefined}>
        {showFallback ? fallback : children}
      </div>

      {/* Skeleton overlay */}
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
                  // Container bones are rendered lighter so children stand out on top
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
