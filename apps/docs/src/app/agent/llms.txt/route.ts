const PROMPT = `# boneyard

Pixel-perfect skeleton loading screens, instantly generated from your real UI.

## What it is

boneyard reads a rendered DOM element once, extracts a compact layout descriptor (plain JSON), and turns it into a flat list of skeleton "bones" — positioned, sized rectangles that mirror the page exactly. No manual measurement. No hand-tuned placeholders.

## Install

\`\`\`
npm install boneyard
\`\`\`

## Quick start (React)

\`\`\`tsx
import { Skeleton } from 'boneyard/react'

const DEFAULT_POST = { title: 'Loading...', body: '...' }

function BlogPage() {
  const { data, isLoading } = useFetch('/api/post')
  return (
    <Skeleton loading={isLoading}>
      <BlogPost data={data ?? DEFAULT_POST} />
    </Skeleton>
  )
}
\`\`\`

Children always render — pass default/placeholder data when real data isn't available yet. When \`loading\` is true, the component extracts the layout from rendered children and shows a pixel-perfect skeleton on top. When false, children show normally. Zero layout shift.

### Skeleton props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| loading | boolean | required | Show skeleton or children |
| color | string? | '#e0e0e0' | Bone color |
| animate | boolean? | true | Pulse animation |
| className | string? | — | Additional class for container |

## Low-level API

For non-React or advanced usage, boneyard exposes three functions:

### 1. fromElement(el) — Extract

\`\`\`ts
import { fromElement } from 'boneyard'

const descriptor = fromElement(document.querySelector('.card'))
// → plain JSON SkeletonDescriptor, ~200 bytes for a card component
// Save to a file, commit it, ship it. No runtime DOM access needed after.
\`\`\`

Walks the subtree and captures: display, flex direction, gap, padding, dimensions, border radius, text content with font metrics. Detects leaves (images, buttons, text nodes, SVGs) automatically.

### 2. computeLayout(descriptor, width) — Compute

\`\`\`ts
import { computeLayout } from 'boneyard/layout'

const skeleton = computeLayout(descriptor, 320)
// → { name, viewportWidth, width, height, bones: Bone[] }
\`\`\`

Pure layout math — no DOM, no browser needed. Works in SSR, Web Workers, React Server Components, edge functions. Uses @chenglou/pretext for pixel-perfect text measurement at any width.

### 3. renderBones(skeleton) — Render

\`\`\`ts
import { renderBones } from 'boneyard'

container.innerHTML = renderBones(skeleton)
// Each bone → absolutely positioned div with shimmer animation
\`\`\`

### All-in-one shortcut

\`\`\`ts
import { skeleton } from 'boneyard'

container.innerHTML = skeleton(element)
// extract + compute + render in one call
\`\`\`

## SkeletonDescriptor type

The descriptor is a tree of nodes describing your component's visual structure:

\`\`\`ts
interface SkeletonDescriptor {
  display?: 'block' | 'flex'
  flexDirection?: 'row' | 'column'
  alignItems?: string
  justifyContent?: string
  width?: number           // explicit px width
  height?: number          // explicit px height
  aspectRatio?: number     // e.g. 16/9
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number }
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number }
  gap?: number
  rowGap?: number
  columnGap?: number
  borderRadius?: number | string  // number for px, '50%' for circles
  font?: string            // CSS font string, e.g. '700 18px Inter'
  lineHeight?: number      // in px
  text?: string            // text content for measurement
  maxWidth?: number
  leaf?: boolean           // force as leaf bone
  children?: SkeletonDescriptor[]
}
\`\`\`

You can write descriptors by hand or extract them with \`fromElement\`.

## Bone output

Each bone in the output array is:

\`\`\`ts
interface Bone {
  x: number  // horizontal offset from container left
  y: number  // vertical offset from container top
  w: number  // width in px
  h: number  // height in px
  r: number | string  // border radius (px or '50%')
}
\`\`\`

## Key design decisions

- **Zero CLS**: Skeletons are computed from the same layout rules as real UI. Bones and real elements occupy identical positions.
- **Extract once, use forever**: The descriptor is plain JSON. Save it, commit it, ship it.
- **Responsive**: One descriptor produces correct skeletons at any width. Text wraps realistically via @chenglou/pretext.
- **No DOM at runtime**: The layout engine is pure math. No document, no window, no canvas.
- **Tiny footprint**: Under 300 lines of TypeScript. Single dependency (@chenglou/pretext).

## Example descriptor

\`\`\`ts
const card: SkeletonDescriptor = {
  display: 'flex', flexDirection: 'column', gap: 12,
  children: [
    { aspectRatio: 16/9, borderRadius: 6 },
    { text: 'Article Title Here', font: '700 15px Inter', lineHeight: 20 },
    { text: 'Description text that wraps.', font: '400 13px Inter', lineHeight: 19 },
    { display: 'flex', alignItems: 'center', gap: 8, children: [
      { width: 24, height: 24, borderRadius: '50%' },
      { text: 'Author Name', font: '500 12px Inter', lineHeight: 18 },
    ]},
  ],
}
\`\`\`

## Package exports

- \`boneyard\` — fromElement, computeLayout, renderBones, skeleton
- \`boneyard/react\` — Skeleton component
- \`boneyard/layout\` — computeLayout (tree-shakeable)
`;

export async function GET() {
  return new Response(PROMPT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
