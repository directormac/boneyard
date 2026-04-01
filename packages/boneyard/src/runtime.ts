/**
 * Runtime — renders skeleton bones to HTML.
 *
 * Usage:
 *   import { computeLayout, renderBones } from '@0xgf/boneyard'
 *
 *   const skeleton = computeLayout(myDescriptor, containerWidth)
 *   element.innerHTML = renderBones(skeleton)
 */

import type { Bone, SkeletonResult } from './types.js'

export type { Bone, SkeletonResult }
export type { SkeletonDescriptor } from './types.js'

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

/**
 * Render bones to an HTML string.
 * Use for SSR, innerHTML, or any HTML-based rendering.
 */
export function renderBones(
  skel: SkeletonResult,
  color?: string,
  animate?: boolean,
): string {
  const c = color ?? '#e0e0e0'
  const shouldAnimate = animate !== false
  const lighter = lightenHex(c, 0.3)

  const keyframes = shouldAnimate
    ? `<style>.boneyard-bone{animation:boneyard-pulse 1.8s ease-in-out infinite}@keyframes boneyard-pulse{0%,100%{background-color:${c}}50%{background-color:${lighter}}}</style>`
    : ''

  let html = `${keyframes}<div class="boneyard" style="position:relative;width:100%;height:${skel.height}px">`

  for (const b of skel.bones) {
    const radius = typeof b.r === 'string' ? b.r : `${b.r}px`
    html += `<div class="boneyard-bone" style="position:absolute;left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;border-radius:${radius};background-color:${c}"></div>`
  }

  html += '</div>'
  return html
}
