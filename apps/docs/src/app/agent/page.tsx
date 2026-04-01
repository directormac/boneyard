"use client";

import { useState } from "react";
import { CopyIcon } from "@/components/ui/icons/copy";
import { CheckIcon } from "@/components/ui/icons/check";

const AGENT_PROMPT = `# boneyard

Pixel-perfect skeleton loading screens, extracted directly from your real DOM. No manual measurement, no hand-tuned placeholders.

## How it works

1. Wrap your component with \`<Skeleton>\` and give it a \`name\`
2. Run \`npx boneyard build\` — it visits your app, snapshots the DOM, and writes \`.bones.json\` files + a \`registry.js\`
3. Add \`import './bones/registry'\` once in your app entry — every Skeleton auto-resolves its bones by name

## Install

\`\`\`
npm install boneyard
\`\`\`

## Quick start

\`\`\`tsx
// app/layout.tsx — import the registry once
import './bones/registry'
\`\`\`

\`\`\`tsx
// app/blog/page.tsx — no per-file JSON import needed
import { Skeleton } from 'boneyard/react'

function BlogPage() {
  const { data, isLoading } = useFetch('/api/post')
  return (
    <Skeleton name="blog-card" loading={isLoading}>
      {data && <BlogCard data={data} />}
    </Skeleton>
  )
}
\`\`\`

## Generate the bones

With your dev server running:

\`\`\`
npx boneyard build
\`\`\`

This opens a headless browser, visits your app at 375px, 768px, and 1280px, finds every \`<Skeleton name="...">\`, measures the layout, and saves \`.bones.json\` files + a \`registry.js\` to \`src/bones/\`.

The registry calls \`registerBones()\` for each skeleton name so that \`<Skeleton name="x">\` auto-resolves without needing \`initialBones\`.

Auto-detects your dev server by scanning common ports (3000, 5173, 4321, 8080…). Or pass a URL: \`npx boneyard build http://localhost:5173\`.

Re-run it whenever your layout changes to regenerate.

**Next.js App Router:** \`<Skeleton>\` uses hooks — add \`"use client"\` to any file that imports it.

### Skeleton props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| loading | boolean | required | Show skeleton when true, real content when false |
| name | string | required | Unique name — the CLI uses this to generate the \`.bones.json\` file |
| initialBones | ResponsiveBones | — | Optional manual override. If you use the registry, you don't need this |
| color | string | '#e0e0e0' | Bone fill color (pulse auto-shimmers to a lighter shade) |
| animate | boolean | true | Pulse animation (set false for static) |
| className | string | — | Extra CSS class on the wrapper div |
| fallback | ReactNode | — | What to show if bones haven't been generated yet |
| snapshotConfig | SnapshotConfig | — | Control which elements are included/excluded |

### snapshotConfig

Use \`snapshotConfig\` to hide elements from the skeleton:

\`\`\`tsx
<Skeleton
  snapshotConfig={{
    excludeSelectors: ['.icon', '[data-no-skeleton]', 'svg'],
    excludeTags: ['nav', 'footer'],
  }}
>
\`\`\`

| Option | Default | Description |
|--------|---------|-------------|
| excludeSelectors | [] | CSS selectors to skip (with all children) |
| excludeTags | [] | HTML tags to skip entirely |
| leafTags | p, h1–h6, li, tr | Tags treated as one solid block |
| captureRoundedBorders | true | Capture containers with border + border-radius as bones |

### npx boneyard build options

\`\`\`
npx boneyard build [url] [options]
  --out <dir>          Output directory (default: ./src/bones)
  --breakpoints <bp>   Viewport widths, comma-separated (default: 375,768,1280)
  --wait <ms>          Extra wait after page load (default: 800)
\`\`\`

Playwright is included as a dependency. On first run: \`npx playwright install chromium\`.

## Bone format

Each bone is \`{ x, y, w, h, r, c? }\` — pixel offsets from the container's top-left. \`r\` is border radius (number or "50%"). \`c: true\` marks container bones (rendered lighter so child bones stand out).

## Low-level API (non-React)

\`\`\`ts
import { snapshotBones } from 'boneyard'
const result = snapshotBones(document.querySelector('.card'))

import { renderBones } from 'boneyard'
const html = renderBones(result, '#d4d4d4')
container.innerHTML = html

// Manual bone registration (what the generated registry.js does automatically)
import { registerBones } from 'boneyard'
registerBones('my-card', bonesJson)
\`\`\`

## Known limitations

- **Images**: Bone captures the bounding box — works even before the image loads
- **Dynamic content**: Bones reflect the layout at capture time. Re-run the build if layout changes
- **CSS transforms**: Bones use bounding rects, so transforms affect position but not bone sizing
- **React portals**: Elements outside the snapshot root aren't captured

## Package exports

- \`boneyard\` — snapshotBones, renderBones, registerBones, computeLayout, fromElement
- \`boneyard/react\` — Skeleton component
`;

export default function AgentPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(AGENT_PROMPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-[720px] px-6 pt-14 pb-12 space-y-10">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight mb-2">Agent</h1>
        <p className="text-[15px] text-[#78716c]">
          Feed this to Claude, ChatGPT, or any LLM to teach it boneyard.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 h-9 px-3.5 rounded-lg bg-[#1c1917] text-[13px] text-[#e7e5e4] hover:bg-[#292524] transition-colors"
          >
            {copied ? (
              <>
                <CheckIcon size={14} />
                Copied
              </>
            ) : (
              <>
                <CopyIcon size={14} />
                Copy prompt
              </>
            )}
          </button>
          <span className="text-[12px] text-[#a8a29e]">
            {AGENT_PROMPT.length.toLocaleString()} chars
          </span>
        </div>

        <p className="text-[13px] text-[#a8a29e]">
          Also available at{" "}
          <code className="text-[12px] bg-stone-100 px-1.5 py-0.5 rounded">/agent/llms.txt</code>
          {" "}for automated agent consumption.
        </p>
      </div>

      <div className="rounded-lg bg-[#1a1a1a] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 text-[12px] text-[#a8a29e]">
          <span>llms.txt</span>
          <button
            onClick={handleCopy}
            className="text-[11px] text-[#78716c] hover:text-[#d6d3d1] transition-colors flex items-center gap-1"
          >
            {copied ? (
              <>
                <CheckIcon size={12} />
                copied
              </>
            ) : (
              <>
                <CopyIcon size={12} />
                copy
              </>
            )}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed font-[family-name:var(--font-mono)] text-[#d6d3d1] max-h-[600px] overflow-y-auto whitespace-pre-wrap">
          {AGENT_PROMPT}
        </pre>
      </div>

      <div className="border-l-2 border-[#d6d3d1] pl-4 py-1">
        <p className="text-[14px] text-[#78716c]">
          <strong className="text-[#1c1917]">CLAUDE.md:</strong> Drop this into your project&apos;s{" "}
          <code className="text-[13px] bg-stone-100 px-1 py-0.5 rounded">CLAUDE.md</code> or{" "}
          <code className="text-[13px] bg-stone-100 px-1 py-0.5 rounded">.cursorrules</code> file
          to give your AI assistant full context on boneyard.
        </p>
      </div>
    </div>
  );
}
