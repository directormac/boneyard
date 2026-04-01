import { CodeBlock } from "@/components/ui/code-block";

function PropItem({
  name,
  type,
  defaultValue,
  required,
  children,
}: {
  name: string;
  type: string;
  defaultValue?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-baseline gap-2 flex-wrap mb-1">
        <code className="font-[family-name:var(--font-mono)] text-[13px] font-semibold text-[#1c1917]">{name}</code>
        <code className="text-[11px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{type}</code>
        {required && <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">required</span>}
        {defaultValue && (
          <span className="text-[11px] text-stone-400">
            default: <code className="text-[11px] bg-stone-100 px-1 py-0.5 rounded">{defaultValue}</code>
          </span>
        )}
      </div>
      <div className="text-[13px] text-[#78716c] leading-relaxed">{children}</div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="max-w-[720px] px-6 pt-14 pb-12 space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold tracking-tight mb-2">API Reference</h1>
        <p className="text-[15px] text-[#78716c] leading-relaxed">
          Everything you can pass to <code className="text-[12px] bg-stone-100 px-1.5 py-0.5 rounded">&lt;Skeleton&gt;</code> and the build CLI.
        </p>
      </div>

      {/* ── <Skeleton> props ── */}
      <section>
        <div className="section-divider">
          <span><code className="font-[family-name:var(--font-mono)] text-[13px]">&lt;Skeleton&gt;</code> props</span>
        </div>

        <div className="mt-4 divide-y divide-stone-100">
          <PropItem name="loading" type="boolean" required>
            When <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">true</code>, shows the skeleton.
            When <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">false</code>, shows your real content.
          </PropItem>

          <PropItem name="children" type="ReactNode" required>
            Your actual component. This is what boneyard reads to figure out where to put the skeleton rectangles.
          </PropItem>

          <PropItem name="name" type="string" required>
            A unique name for this skeleton. The build CLI uses this to create the <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">.bones.json</code> file.
            <br />
            Example: <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">name=&quot;blog-card&quot;</code> → generates <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">blog-card.bones.json</code>
          </PropItem>

          <PropItem name="initialBones" type="ResponsiveBones">
            <p>Optional manual override — pass a bones JSON file directly to a specific Skeleton. If you use the registry (<code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">import &apos;./bones/registry&apos;</code> in your app entry), you don&apos;t need this prop. The registry auto-resolves bones by name.</p>
            <div className="mt-2 rounded-lg bg-[#1a1a1a] p-3 font-mono text-[12px]">
              <span className="text-stone-500">{"// Only needed if you're NOT using the registry"}</span>{"\n"}
              <span className="text-[#c084fc]">import</span><span className="text-stone-300"> blogBones </span><span className="text-[#c084fc]">from</span><span className="text-[#86efac]"> &apos;@/bones/blog-card.bones.json&apos;</span>
            </div>
          </PropItem>

          <PropItem name="color" type="string" defaultValue="#e0e0e0">
            The color of the skeleton rectangles. Any hex color works. The pulse animation automatically shimmers to a lighter version of whatever color you set.
          </PropItem>

          <PropItem name="animate" type="boolean" defaultValue="true">
            The pulse animation. Set to <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">false</code> if you want static gray rectangles with no animation.
          </PropItem>

          <PropItem name="className" type="string">
            An extra CSS class on the wrapper div. Use it if you need to add margins, padding, etc.
          </PropItem>

          <PropItem name="fallback" type="ReactNode">
            What to show if you haven&apos;t generated bones yet. You probably don&apos;t need this — just run the build command.
          </PropItem>
        </div>

        {/* Example */}
        <div className="mt-8">
          <p className="text-[13px] font-semibold text-stone-700 mb-3">Full example</p>
          <CodeBlock filename="app/blog/page.tsx" language="tsx" code={`<span class="text-stone-500">// Registry auto-resolves bones — no per-file JSON import needed</span>
<span class="text-[#c084fc]">import</span> { Skeleton } <span class="text-[#c084fc]">from</span> <span class="text-[#86efac]">'boneyard/react'</span>

<span class="text-[#c084fc]">function</span> <span class="text-[#fde68a]">BlogPage</span>() {
  <span class="text-[#c084fc]">const</span> { data, isLoading } = <span class="text-[#fde68a]">useFetch</span>(<span class="text-[#86efac]">'/api/post'</span>)

  <span class="text-[#c084fc]">return</span> (
    &lt;<span class="text-[#fde68a]">Skeleton</span>
      <span class="text-[#93c5fd]">name</span>=<span class="text-[#86efac]">"blog-card"</span>
      <span class="text-[#93c5fd]">loading</span>={isLoading}
      <span class="text-[#93c5fd]">color</span>=<span class="text-[#86efac]">"#d4d4d4"</span>
    &gt;
      {data &amp;&amp; &lt;<span class="text-[#fde68a]">BlogCard</span> data={data} /&gt;}
    &lt;/<span class="text-[#fde68a]">Skeleton</span>&gt;
  )
}`} />
        </div>
      </section>

      {/* ── Excluding elements ── */}
      <section>
        <div className="section-divider">
          <span>Hiding elements from the skeleton</span>
        </div>
        <p className="text-[14px] text-[#78716c] leading-relaxed mt-4 mb-4">
          Sometimes you don&apos;t want everything to show up in the skeleton. Maybe you have icons, decorative elements, or a live widget that should always be visible. You can tell boneyard to skip them.
        </p>

        <p className="text-[14px] text-[#78716c] leading-relaxed mb-4">
          Pass a <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">snapshotConfig</code> prop to control what gets included:
        </p>

        <div className="space-y-6">
          {/* Example 1 */}
          <div>
            <p className="text-[13px] font-medium text-stone-700 mb-2">Skip specific elements by CSS class or attribute</p>
            <p className="text-[13px] text-[#78716c] mb-2">
              Use <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">excludeSelectors</code> — any CSS selector works.
              The element and everything inside it gets ignored.
            </p>
            <CodeBlock filename="example" language="tsx" code={`&lt;<span class="text-[#fde68a]">Skeleton</span>
  <span class="text-[#93c5fd]">name</span>=<span class="text-[#86efac]">"dashboard"</span>
  <span class="text-[#93c5fd]">loading</span>={isLoading}
  <span class="text-[#93c5fd]">initialBones</span>={dashBones}
  <span class="text-[#93c5fd]">snapshotConfig</span>={{
    <span class="text-[#93c5fd]">excludeSelectors</span>: [
      <span class="text-[#86efac]">'.icon'</span>,                     <span class="text-stone-500">// skip all icons</span>
      <span class="text-[#86efac]">'[data-no-skeleton]'</span>,         <span class="text-stone-500">// skip anything with this attribute</span>
      <span class="text-[#86efac]">'svg'</span>,                        <span class="text-stone-500">// skip all SVGs</span>
    ]
  }}
&gt;`} />
          </div>

          {/* Example 2 */}
          <div>
            <p className="text-[13px] font-medium text-stone-700 mb-2">Skip entire HTML tags</p>
            <p className="text-[13px] text-[#78716c] mb-2">
              Use <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">excludeTags</code> to skip every instance of a tag type. Good for nav bars and footers that shouldn&apos;t be part of the skeleton.
            </p>
            <CodeBlock language="tsx" code={`<span class="text-[#93c5fd]">snapshotConfig</span>={{
  <span class="text-[#93c5fd]">excludeTags</span>: [<span class="text-[#86efac]">'nav'</span>, <span class="text-[#86efac]">'footer'</span>, <span class="text-[#86efac]">'aside'</span>]
}}`} />
          </div>

          {/* Example 3 */}
          <div>
            <p className="text-[13px] font-medium text-stone-700 mb-2">Mark elements in your JSX</p>
            <p className="text-[13px] text-[#78716c] mb-2">
              The easiest way — add <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">data-no-skeleton</code> to any element you want to hide, then exclude it:
            </p>
            <CodeBlock filename="your-component.tsx" language="tsx" code={`<span class="text-stone-500">// This chart will always render, even during loading</span>
&lt;<span class="text-[#fde68a]">div</span> <span class="text-[#93c5fd]">data-no-skeleton</span>&gt;
  &lt;<span class="text-[#fde68a]">LiveChart</span> /&gt;
&lt;/<span class="text-[#fde68a]">div</span>&gt;

<span class="text-stone-500">// Then in your Skeleton wrapper</span>
<span class="text-[#93c5fd]">snapshotConfig</span>={{ <span class="text-[#93c5fd]">excludeSelectors</span>: [<span class="text-[#86efac]">'[data-no-skeleton]'</span>] }}`} />
          </div>
        </div>

        {/* Other config options */}
        <div className="mt-8 rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-2">
          <p className="text-[13px] font-medium text-stone-700">Other snapshot options</p>
          <ul className="text-[13px] text-[#78716c] space-y-1.5 list-disc pl-4">
            <li>
              <code className="text-[12px] bg-white px-1 py-0.5 rounded border border-stone-200">leafTags</code> — Tags treated as one solid block (default: <code className="text-[12px] bg-white px-1 py-0.5 rounded border border-stone-200">p, h1–h6, li, tr</code>). Add <code className="text-[12px] bg-white px-1 py-0.5 rounded border border-stone-200">span</code> if your text renders inside span wrappers.
            </li>
            <li>
              <code className="text-[12px] bg-white px-1 py-0.5 rounded border border-stone-200">captureRoundedBorders</code> — Set <code className="text-[12px] bg-white px-1 py-0.5 rounded border border-stone-200">false</code> if your cards use shadows instead of borders (default: <code className="text-[12px] bg-white px-1 py-0.5 rounded border border-stone-200">true</code>).
            </li>
          </ul>
        </div>
      </section>

      {/* ── CLI ── */}
      <section>
        <div className="section-divider">
          <span>Build command</span>
        </div>

        <p className="text-[14px] text-[#78716c] leading-relaxed mt-4 mb-4">
          This is how you generate the bones JSON files. Run it with your dev server running:
        </p>

        <CodeBlock language="bash" code="npx boneyard build" />

        <p className="text-[14px] text-[#78716c] leading-relaxed mt-4 mb-4">
          It opens a headless browser, visits your app, finds every <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">&lt;Skeleton name=&quot;...&quot;&gt;</code>,
          measures the layout at different screen sizes, and saves the result as JSON files you can import.
        </p>

        <div className="mt-4 divide-y divide-stone-100">
          <PropItem name="url" type="positional" defaultValue="auto-detected">
            The URL(s) to visit. If you don&apos;t pass one, it scans common dev ports (3000, 5173, 4321, 8080…) and uses the first one that responds.
          </PropItem>

          <PropItem name="--breakpoints" type="string" defaultValue="375,768,1280">
            Screen widths to capture at, comma-separated. The defaults cover mobile, tablet, and desktop.
          </PropItem>

          <PropItem name="--wait" type="number" defaultValue="800">
            How long to wait (in ms) after the page loads before capturing. Increase this if your components take a while to render.
          </PropItem>

          <PropItem name="--out" type="string" defaultValue="./src/bones">
            Where to save the JSON files. Defaults to <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">src/bones/</code> if you have a <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">src/</code> folder, otherwise <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">./bones/</code>.
          </PropItem>
        </div>

        <div className="mt-6">
          <p className="text-[13px] font-semibold text-stone-700 mb-3">Examples</p>
          <CodeBlock language="bash" code={`<span class="text-stone-500"># Auto-detect server, default breakpoints</span>
npx boneyard build

<span class="text-stone-500"># Specific page</span>
npx boneyard build http://localhost:3000/dashboard

<span class="text-stone-500"># Multiple pages at once</span>
npx boneyard build http://localhost:3000 http://localhost:3000/profile

<span class="text-stone-500"># Custom breakpoints + output dir</span>
npx boneyard build --breakpoints 390,820,1440 --out ./public/bones`} />
        </div>

        <div className="border-l-2 border-stone-300 pl-4 py-1 mt-4">
          <p className="text-[13px] text-[#78716c]">
            Playwright is included as a dependency. On first run you may need to install the browser:{" "}
            <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">npx playwright install chromium</code>
          </p>
        </div>
      </section>
    </div>
  );
}
