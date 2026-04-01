/**
 * Layout engine — uses @chenglou/pretext for exact text measurement.
 *
 * Takes a SkeletonDescriptor (developer-defined component structure) and a
 * width, then computes pixel-perfect bone positions using pretext for text
 * and box-model arithmetic for containers.
 *
 * No DOM, no puppeteer, no build step. Describe your component, get bones.
 */

import { prepare, layout as pretextLayout } from '@chenglou/pretext'
import type { SkeletonDescriptor, Bone, SkeletonResult } from './types.js'

/** Resolved padding/margin — always four sides */
interface Sides { top: number; right: number; bottom: number; left: number }

function resolveSides(v: number | Partial<Sides> | undefined): Sides {
  if (v === undefined) return { top: 0, right: 0, bottom: 0, left: 0 }
  if (typeof v === 'number') return { top: v, right: v, bottom: v, left: v }
  return { top: v.top ?? 0, right: v.right ?? 0, bottom: v.bottom ?? 0, left: v.left ?? 0 }
}

/**
 * Compute skeleton bones from a descriptor at a given width.
 * Uses pretext for all text measurement — no DOM needed.
 */
export function computeLayout(
  desc: SkeletonDescriptor,
  width: number,
  name: string = 'component',
): SkeletonResult {
  const bones: Bone[] = []
  layoutNode(desc, 0, 0, width, bones)

  let maxBottom = 0
  for (const b of bones) {
    const bottom = b.y + b.h
    if (bottom > maxBottom) maxBottom = bottom
  }

  return {
    name,
    viewportWidth: width,
    width,
    height: round(maxBottom),
    bones,
  }
}

/**
 * Recursively layout a node and its children, producing bones.
 * Returns the height consumed (including margin).
 */
function layoutNode(
  desc: SkeletonDescriptor,
  offsetX: number,
  offsetY: number,
  availableWidth: number,
  bones: Bone[],
): number {
  const pad = resolveSides(desc.padding)
  const mar = resolveSides(desc.margin)

  const nodeX = offsetX + mar.left
  const nodeY = offsetY + mar.top
  const nodeWidth = clampWidth(
    desc.width !== undefined ? Math.min(desc.width, availableWidth) : availableWidth,
    desc.maxWidth,
    availableWidth,
  )

  const contentX = nodeX + pad.left
  const contentY = nodeY + pad.top
  const contentWidth = Math.max(0, nodeWidth - pad.left - pad.right)

  if (isLeaf(desc)) {
    const contentHeight = resolveLeafHeight(desc, contentWidth, pad)
    const totalHeight = contentHeight + pad.top + pad.bottom

    // For single-line text, use intrinsic text width instead of full container width
    let boneWidth = nodeWidth
    if (desc.text && desc.font && desc.lineHeight && contentHeight < desc.lineHeight * 1.5) {
      const intrinsic = getIntrinsicWidth(desc, contentWidth)
      boneWidth = Math.min(intrinsic, nodeWidth)
    }

    bones.push({
      x: round(nodeX),
      y: round(nodeY),
      w: round(boneWidth),
      h: round(totalHeight),
      r: desc.borderRadius ?? 8,
    })

    return totalHeight + mar.top + mar.bottom
  }

  const children = desc.children ?? []
  let innerHeight: number

  const display = desc.display ?? 'block'
  const direction = desc.flexDirection ?? 'row'

  if (display === 'flex' && direction === 'row') {
    innerHeight = layoutFlexRow(desc, children, contentX, contentY, contentWidth, bones)
  } else if (display === 'flex' && direction === 'column') {
    innerHeight = layoutFlexColumn(desc, children, contentX, contentY, contentWidth, bones)
  } else {
    // Block layout with CSS margin collapsing
    let y = 0
    let prevMarBottom = 0
    for (let i = 0; i < children.length; i++) {
      const childMar = resolveSides(children[i].margin)
      if (i > 0) {
        // CSS collapses adjacent margins: gap = max(prev bottom, current top)
        y -= Math.min(prevMarBottom, childMar.top)
      }
      y += layoutNode(children[i], contentX, contentY + y, contentWidth, bones)
      prevMarBottom = childMar.bottom
    }
    innerHeight = y
  }

  const totalHeight = innerHeight + pad.top + pad.bottom
  return totalHeight + mar.top + mar.bottom
}

/** Flex column: children stack vertically with gap */
function layoutFlexColumn(
  parent: SkeletonDescriptor,
  children: SkeletonDescriptor[],
  contentX: number,
  contentY: number,
  contentWidth: number,
  bones: Bone[],
): number {
  const gap = parent.rowGap ?? parent.gap ?? 0
  let y = 0

  for (let i = 0; i < children.length; i++) {
    const h = layoutNode(children[i], contentX, contentY + y, contentWidth, bones)
    y += h
    if (i < children.length - 1 && h > 0) y += gap
  }

  return y
}

/** Flex row: two-pass layout with alignment */
function layoutFlexRow(
  parent: SkeletonDescriptor,
  children: SkeletonDescriptor[],
  contentX: number,
  contentY: number,
  contentWidth: number,
  bones: Bone[],
): number {
  if (children.length === 0) return 0

  const gap = parent.columnGap ?? parent.gap ?? 0
  const justify = parent.justifyContent ?? 'flex-start'
  const align = parent.alignItems ?? 'stretch'

  // Phase 1: compute child widths
  const childWidths: number[] = []
  let totalFixed = 0
  let flexCount = 0

  for (const child of children) {
    if (child.width !== undefined) {
      const w = clampWidth(child.width, child.maxWidth, contentWidth)
      childWidths.push(w)
      totalFixed += w
    } else if (isContentSized(child)) {
      let w = getIntrinsicWidth(child, contentWidth)
      w = clampWidth(w, child.maxWidth, contentWidth)
      childWidths.push(w)
      totalFixed += w
    } else {
      childWidths.push(-1)
      flexCount++
    }
  }

  const totalGaps = Math.max(0, children.length - 1) * gap
  const remaining = Math.max(0, contentWidth - totalFixed - totalGaps)
  const flexWidth = flexCount > 0 ? remaining / flexCount : 0

  for (let i = 0; i < childWidths.length; i++) {
    if (childWidths[i] < 0) {
      childWidths[i] = clampWidth(flexWidth, children[i].maxWidth, contentWidth)
    }
  }

  // Phase 2: measure heights
  const childHeights: number[] = []
  for (let i = 0; i < children.length; i++) {
    const temp: Bone[] = []
    childHeights.push(layoutNode(children[i], 0, 0, childWidths[i], temp))
  }

  const maxHeight = Math.max(...childHeights, 0)

  // Phase 3: justify-content
  const totalUsed = childWidths.reduce((s, w) => s + w, 0) + totalGaps
  let xStart = 0
  let extraGap = 0

  if (justify === 'flex-end') {
    xStart = Math.max(0, contentWidth - totalUsed)
  } else if (justify === 'center') {
    xStart = Math.max(0, (contentWidth - totalUsed) / 2)
  } else if (justify === 'space-between' && children.length > 1) {
    const totalChildWidth = childWidths.reduce((s, w) => s + w, 0)
    extraGap = Math.max(0, (contentWidth - totalChildWidth) / (children.length - 1)) - gap
  }

  // Phase 4: position with alignment
  let x = xStart
  for (let i = 0; i < children.length; i++) {
    let yOff = 0
    if (align === 'center') yOff = Math.max(0, (maxHeight - childHeights[i]) / 2)
    else if (align === 'flex-end') yOff = Math.max(0, maxHeight - childHeights[i])

    layoutNode(children[i], contentX + x, contentY + yOff, childWidths[i], bones)
    x += childWidths[i]
    if (i < children.length - 1) x += gap + extraGap
  }

  return maxHeight
}

/** Is this a leaf that produces a bone? */
function isLeaf(desc: SkeletonDescriptor): boolean {
  if (desc.leaf === true) return true
  if (desc.text !== undefined) return true
  if (desc.height !== undefined && (!desc.children || desc.children.length === 0)) return true
  if (desc.aspectRatio !== undefined && (!desc.children || desc.children.length === 0)) return true
  if (!desc.children || desc.children.length === 0) return false
  return false
}

function isContentSized(child: SkeletonDescriptor): boolean {
  if (child.width !== undefined) return false
  return child.text !== undefined || child.leaf === true
}

function getIntrinsicWidth(child: SkeletonDescriptor, maxAvailable: number): number {
  if (child.text && child.font && child.lineHeight) {
    try {
      const pad = resolveSides(child.padding)
      const prepared = prepare(child.text, child.font)
      const singleLine = child.lineHeight * 1.5  // tolerance for font metric differences
      // Binary search for minimum width that keeps text on one line
      let lo = 1, hi = maxAvailable
      while (hi - lo > 0.5) {
        const mid = (lo + hi) / 2
        const r = pretextLayout(prepared, mid, child.lineHeight)
        if (r.height <= singleLine) hi = mid; else lo = mid
      }
      return Math.ceil(hi) + 1 + pad.left + pad.right
    } catch {
      return maxAvailable
    }
  }
  if (child.width !== undefined) return child.width
  return maxAvailable
}

/** Compute leaf height — pretext for text, arithmetic for everything else */
function resolveLeafHeight(desc: SkeletonDescriptor, contentWidth: number, pad: Sides): number {
  if (desc.text && desc.font && desc.lineHeight) {
    try {
      const prepared = prepare(desc.text, desc.font)
      const result = pretextLayout(prepared, contentWidth, desc.lineHeight)
      return result.height
    } catch {
      return desc.lineHeight ?? 20
    }
  }

  if (desc.height !== undefined) {
    return Math.max(0, desc.height - pad.top - pad.bottom)
  }

  if (desc.aspectRatio && desc.aspectRatio > 0 && isFinite(desc.aspectRatio)) {
    return contentWidth / desc.aspectRatio
  }

  return 20
}

function clampWidth(width: number, maxWidth: number | undefined, parentWidth: number): number {
  if (maxWidth === undefined) return width
  return Math.min(width, maxWidth)
}

function round(n: number): number {
  if (!isFinite(n)) return 0
  return Math.round(n * 100) / 100
}
