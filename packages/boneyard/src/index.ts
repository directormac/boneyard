import { fromElement } from './extract.js'
import { computeLayout } from './layout.js'
import { renderBones } from './runtime.js'
import type { SkeletonDescriptor } from './types.js'

export type { Bone, SkeletonResult, ResponsiveBones, SkeletonDescriptor, ResponsiveDescriptor, SnapshotConfig } from './types.js'

/**
 * Snapshot exact pixel positions of a rendered element as skeleton bones.
 * Reads `getBoundingClientRect()` on every visible element — no simulation,
 * just what the browser already computed.
 *
 * Use this to pre-generate bones at dev time, save as JSON, and pass as
 * `initialBones` to `<Skeleton>` for zero first-load flash.
 *
 * @example In a browser console or dev script:
 * ```ts
 * import { snapshotBones } from 'boneyard'
 * const bones = snapshotBones(document.querySelector('.my-card'))
 * console.log(JSON.stringify(bones, null, 2))
 * // → paste into my-card.bones.json
 * ```
 */
export { snapshotBones } from './extract.js'

/**
 * Extract a skeleton descriptor from a rendered DOM element.
 * Captures layout structure as plain JSON — use with `computeLayout` for
 * SSR or build-time paths where a live browser DOM isn't available.
 */
export { fromElement } from './extract.js'

/**
 * Extract responsive descriptors at multiple breakpoints.
 * Resizes the container to each width, extracts a descriptor per breakpoint.
 * Returns a `ResponsiveDescriptor` you can serialize and ship as JSON.
 */
export { extractResponsive } from './responsive.js'

/**
 * Compute skeleton bone positions from a descriptor at a given width.
 * Uses @chenglou/pretext for text measurement — no DOM needed.
 * Ideal for SSR or workers where `snapshotBones` isn't available.
 */
export { computeLayout } from './layout.js'

/**
 * Render a `SkeletonResult` to an HTML string.
 * Use for `innerHTML`, SSR, edge functions, etc.
 */
export { renderBones } from './runtime.js'

/**
 * All-in-one convenience: extract descriptor → compute layout → render HTML.
 *
 *   container.innerHTML = skeleton(element)
 *
 * For React, prefer `<Skeleton>` from 'boneyard/react' — it calls
 * `snapshotBones()` directly and handles caching automatically.
 */
export function skeleton(
  el: Element,
  options?: { width?: number; color?: string; animate?: boolean },
): string {
  const structure: SkeletonDescriptor = fromElement(el)
  const w = options?.width ?? el.getBoundingClientRect().width
  const result = computeLayout(structure, w)
  return renderBones(result, options?.color, options?.animate)
}
