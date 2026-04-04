import { CodeBlock } from "@/components/ui/code-block";

export default function ReactNativePage() {
  return (
    <div className="max-w-[720px] px-6 pt-14 pb-12 space-y-12">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight mb-2">React Native</h1>
        <p className="text-[15px] text-[#78716c] leading-relaxed">
          Use boneyard in React Native and Expo apps. Same pixel-perfect skeletons, same pre-generated bones — just a different renderer.
        </p>
      </div>

      {/* Step 1 — Install */}
      <section>
        <div className="section-divider">
          <span>1. Install</span>
        </div>
        <div className="mt-4">
          <CodeBlock language="bash" code="npm install boneyard-js" />
        </div>
        <p className="text-[13px] text-stone-400 mt-2">
          Same package — React Native support is built in. No extra dependencies needed.
        </p>
      </section>

      {/* Step 2 — Import */}
      <section>
        <div className="section-divider">
          <span>2. Import the native component</span>
        </div>
        <p className="text-[14px] text-[#78716c] leading-relaxed mt-4 mb-4">
          Import <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">Skeleton</code> and <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">registerBones</code> from
          the <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">boneyard-js/native</code> entry point instead of <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">boneyard-js/react</code>.
        </p>
        <CodeBlock language="tsx" code={`<span class="text-[#c084fc]">import</span> { Skeleton } <span class="text-[#c084fc]">from</span> <span class="text-[#86efac]">'boneyard-js/native'</span>
<span class="text-[#c084fc]">import</span> { registerBones } <span class="text-[#c084fc]">from</span> <span class="text-[#86efac]">'boneyard-js/native'</span>`} />

        <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-2">
          <p className="text-[13px] font-medium text-stone-700">Why a separate entry point?</p>
          <p className="text-[13px] text-[#78716c]">
            The native renderer uses React Native&apos;s <code className="text-[12px] bg-white px-1 py-0.5 rounded border border-stone-200">View</code>, <code className="text-[12px] bg-white px-1 py-0.5 rounded border border-stone-200">Animated</code>,
            and <code className="text-[12px] bg-white px-1 py-0.5 rounded border border-stone-200">StyleSheet</code> APIs
            instead of HTML divs and CSS keyframes. The bone data format is identical — only the rendering layer is different.
          </p>
        </div>
      </section>

      {/* Step 3 — Generate bones */}
      <section>
        <div className="section-divider">
          <span>3. Generate or create bones</span>
        </div>
        <p className="text-[14px] text-[#78716c] leading-relaxed mt-4 mb-4">
          You have two options for getting bone data into your React Native app:
        </p>

        <div className="space-y-4">
          <div>
            <p className="text-[13px] font-medium text-stone-700 mb-2">Option A: Generate from a web build</p>
            <p className="text-[14px] text-[#78716c] leading-relaxed mb-3">
              If you have a web version of your components (Next.js, Vite, etc.), run the CLI there and copy the <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">.bones.json</code> files
              into your React Native project. The format is the same.
            </p>
            <CodeBlock language="bash" code={`<span class="text-stone-500"># In your web project</span>
npx boneyard-js build

<span class="text-stone-500"># Copy bones to your RN project</span>
cp src/bones/*.bones.json ../my-rn-app/bones/`} />
          </div>

          <div>
            <p className="text-[13px] font-medium text-stone-700 mb-2">Option B: Write bones by hand</p>
            <p className="text-[14px] text-[#78716c] leading-relaxed mb-3">
              Create a <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">.bones.json</code> file manually. Each bone is a rectangle with position, size, and border radius:
            </p>
            <CodeBlock filename="bones/profile-card.bones.json" language="json" code={`{
  <span class="text-[#93c5fd]">"breakpoints"</span>: {
    <span class="text-[#93c5fd]">"375"</span>: {
      <span class="text-[#93c5fd]">"name"</span>: <span class="text-[#86efac]">"profile-card"</span>,
      <span class="text-[#93c5fd]">"viewportWidth"</span>: <span class="text-[#fbbf24]">375</span>,
      <span class="text-[#93c5fd]">"width"</span>: <span class="text-[#fbbf24]">343</span>,
      <span class="text-[#93c5fd]">"height"</span>: <span class="text-[#fbbf24]">200</span>,
      <span class="text-[#93c5fd]">"bones"</span>: [
        { <span class="text-[#93c5fd]">"x"</span>: <span class="text-[#fbbf24]">4</span>, <span class="text-[#93c5fd]">"y"</span>: <span class="text-[#fbbf24]">16</span>, <span class="text-[#93c5fd]">"w"</span>: <span class="text-[#fbbf24]">18</span>, <span class="text-[#93c5fd]">"h"</span>: <span class="text-[#fbbf24]">64</span>, <span class="text-[#93c5fd]">"r"</span>: <span class="text-[#86efac]">"50%"</span> },
        { <span class="text-[#93c5fd]">"x"</span>: <span class="text-[#fbbf24]">26</span>, <span class="text-[#93c5fd]">"y"</span>: <span class="text-[#fbbf24]">20</span>, <span class="text-[#93c5fd]">"w"</span>: <span class="text-[#fbbf24]">45</span>, <span class="text-[#93c5fd]">"h"</span>: <span class="text-[#fbbf24]">18</span>, <span class="text-[#93c5fd]">"r"</span>: <span class="text-[#fbbf24]">6</span> },
        { <span class="text-[#93c5fd]">"x"</span>: <span class="text-[#fbbf24]">26</span>, <span class="text-[#93c5fd]">"y"</span>: <span class="text-[#fbbf24]">44</span>, <span class="text-[#93c5fd]">"w"</span>: <span class="text-[#fbbf24]">35</span>, <span class="text-[#93c5fd]">"h"</span>: <span class="text-[#fbbf24]">14</span>, <span class="text-[#93c5fd]">"r"</span>: <span class="text-[#fbbf24]">6</span> }
      ]
    }
  }
}`} />
            <p className="text-[13px] text-stone-400 mt-2">
              <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">x</code> and <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">w</code> are percentages of the container width.
              <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded ml-1">y</code> and <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">h</code> are pixels.
              <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded ml-1">r</code> is border radius (px or &quot;50%&quot; for circles).
            </p>
          </div>
        </div>
      </section>

      {/* Step 4 — Register */}
      <section>
        <div className="section-divider">
          <span>4. Register and use</span>
        </div>
        <p className="text-[14px] text-[#78716c] leading-relaxed mt-4 mb-4">
          Create a registry file and import it once in your app entry. Then wrap components
          with <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">&lt;Skeleton&gt;</code> — same pattern as the web version.
        </p>
        <CodeBlock filename="bones/registry.ts" language="tsx" code={`<span class="text-[#c084fc]">import</span> { registerBones } <span class="text-[#c084fc]">from</span> <span class="text-[#86efac]">'boneyard-js/native'</span>
<span class="text-[#c084fc]">import</span> profileCard <span class="text-[#c084fc]">from</span> <span class="text-[#86efac]">'./profile-card.bones.json'</span>
<span class="text-[#c084fc]">import</span> feedItem <span class="text-[#c084fc]">from</span> <span class="text-[#86efac]">'./feed-item.bones.json'</span>

<span class="text-[#fde68a]">registerBones</span>({
  <span class="text-[#86efac]">'profile-card'</span>: profileCard,
  <span class="text-[#86efac]">'feed-item'</span>: feedItem,
})`} />

        <div className="mt-4">
          <CodeBlock filename="App.tsx" language="tsx" code={`<span class="text-[#c084fc]">import</span> { Skeleton } <span class="text-[#c084fc]">from</span> <span class="text-[#86efac]">'boneyard-js/native'</span>
<span class="text-[#c084fc]">import</span> <span class="text-[#86efac]">'./bones/registry'</span>

<span class="text-[#c084fc]">function</span> <span class="text-[#fde68a]">ProfileScreen</span>() {
  <span class="text-[#c084fc]">const</span> [loading, setLoading] = <span class="text-[#fde68a]">useState</span>(<span class="text-[#fbbf24]">true</span>)

  <span class="text-[#c084fc]">return</span> (
    &lt;<span class="text-[#fde68a]">Skeleton</span> <span class="text-[#93c5fd]">name</span>=<span class="text-[#86efac]">"profile-card"</span> <span class="text-[#93c5fd]">loading</span>={loading}&gt;
      &lt;<span class="text-[#fde68a]">ProfileCard</span> /&gt;
    &lt;/<span class="text-[#fde68a]">Skeleton</span>&gt;
  )
}`} />
        </div>

        <p className="text-[14px] text-[#78716c] leading-relaxed mt-4">
          You can also pass bones directly via <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">initialBones</code> without a registry:
        </p>
        <div className="mt-3">
          <CodeBlock language="tsx" code={`<span class="text-[#c084fc]">import</span> cardBones <span class="text-[#c084fc]">from</span> <span class="text-[#86efac]">'./bones/profile-card.bones.json'</span>

&lt;<span class="text-[#fde68a]">Skeleton</span> <span class="text-[#93c5fd]">loading</span>={loading} <span class="text-[#93c5fd]">initialBones</span>={cardBones}&gt;
  &lt;<span class="text-[#fde68a]">ProfileCard</span> /&gt;
&lt;/<span class="text-[#fde68a]">Skeleton</span>&gt;`} />
        </div>
      </section>

      {/* Props */}
      <section>
        <div className="section-divider">
          <span>Props</span>
        </div>
        <div className="mt-4 rounded-lg border border-stone-200 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left px-4 py-2 font-medium text-stone-700">Prop</th>
                <th className="text-left px-4 py-2 font-medium text-stone-700">Type</th>
                <th className="text-left px-4 py-2 font-medium text-stone-700">Default</th>
                <th className="text-left px-4 py-2 font-medium text-stone-700">Description</th>
              </tr>
            </thead>
            <tbody className="text-[#78716c]">
              <tr className="border-b border-stone-100">
                <td className="px-4 py-2 font-mono text-stone-800">loading</td>
                <td className="px-4 py-2">boolean</td>
                <td className="px-4 py-2">—</td>
                <td className="px-4 py-2">Show skeleton or children</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-2 font-mono text-stone-800">name</td>
                <td className="px-4 py-2">string</td>
                <td className="px-4 py-2">—</td>
                <td className="px-4 py-2">Resolve bones from registry by name</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-2 font-mono text-stone-800">initialBones</td>
                <td className="px-4 py-2">ResponsiveBones</td>
                <td className="px-4 py-2">—</td>
                <td className="px-4 py-2">Pass bones directly (takes precedence over registry)</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-2 font-mono text-stone-800">color</td>
                <td className="px-4 py-2">string</td>
                <td className="px-4 py-2">#d4d4d4</td>
                <td className="px-4 py-2">Bone color in light mode</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-2 font-mono text-stone-800">darkColor</td>
                <td className="px-4 py-2">string</td>
                <td className="px-4 py-2">#3a3a3c</td>
                <td className="px-4 py-2">Bone color in dark mode</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-2 font-mono text-stone-800">dark</td>
                <td className="px-4 py-2">boolean</td>
                <td className="px-4 py-2">auto</td>
                <td className="px-4 py-2">Force dark/light mode (defaults to system scheme)</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-2 font-mono text-stone-800">animate</td>
                <td className="px-4 py-2">boolean</td>
                <td className="px-4 py-2">true</td>
                <td className="px-4 py-2">Enable pulse animation</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-2 font-mono text-stone-800">style</td>
                <td className="px-4 py-2">ViewStyle</td>
                <td className="px-4 py-2">—</td>
                <td className="px-4 py-2">Additional style for the container</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-stone-800">fallback</td>
                <td className="px-4 py-2">ReactNode</td>
                <td className="px-4 py-2">—</td>
                <td className="px-4 py-2">Shown when loading but no bones are available</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Dark mode */}
      <section>
        <div className="section-divider">
          <span>Dark mode</span>
        </div>
        <p className="text-[14px] text-[#78716c] leading-relaxed mt-4 mb-4">
          The skeleton auto-detects dark mode via <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">useColorScheme()</code>.
          If your app manages its own theme, pass the <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">dark</code> prop explicitly:
        </p>
        <CodeBlock language="tsx" code={`<span class="text-stone-500">// Force light mode regardless of system theme</span>
&lt;<span class="text-[#fde68a]">Skeleton</span> <span class="text-[#93c5fd]">loading</span>={loading} <span class="text-[#93c5fd]">dark</span>={<span class="text-[#fbbf24]">false</span>}&gt;

<span class="text-stone-500">// Force dark mode</span>
&lt;<span class="text-[#fde68a]">Skeleton</span> <span class="text-[#93c5fd]">loading</span>={loading} <span class="text-[#93c5fd]">dark</span>={<span class="text-[#fbbf24]">true</span>}&gt;

<span class="text-stone-500">// Custom dark mode colors</span>
&lt;<span class="text-[#fde68a]">Skeleton</span> <span class="text-[#93c5fd]">loading</span>={loading} <span class="text-[#93c5fd]">dark</span> <span class="text-[#93c5fd]">darkColor</span>=<span class="text-[#86efac]">"#1e1e2e"</span>&gt;`} />
      </section>

      {/* Expo / Metro */}
      <section>
        <div className="section-divider">
          <span>Expo &amp; Metro setup</span>
        </div>
        <p className="text-[14px] text-[#78716c] leading-relaxed mt-4 mb-4">
          If you&apos;re using Expo or Metro bundler, import
          from <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">boneyard-js/native</code> (not <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">boneyard-js/react-native</code>).
          Metro has special handling for paths containing &quot;react-native&quot; which can cause resolution issues.
        </p>

        <p className="text-[14px] text-[#78716c] leading-relaxed mb-4">
          If you link the package locally during development (e.g. <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">npm install ../boneyard</code>),
          add the source directory to Metro&apos;s watch folders so it can resolve the symlink:
        </p>
        <CodeBlock filename="metro.config.js" language="js" code={`<span class="text-[#c084fc]">const</span> { getDefaultConfig } = <span class="text-[#fde68a]">require</span>(<span class="text-[#86efac]">'expo/metro-config'</span>)
<span class="text-[#c084fc]">const</span> path = <span class="text-[#fde68a]">require</span>(<span class="text-[#86efac]">'path'</span>)

<span class="text-[#c084fc]">const</span> config = <span class="text-[#fde68a]">getDefaultConfig</span>(__dirname)

<span class="text-stone-500">// Point to the local boneyard package if symlinked</span>
<span class="text-[#c084fc]">const</span> boneyardPath = path.<span class="text-[#fde68a]">resolve</span>(__dirname, <span class="text-[#86efac]">'../boneyard/packages/boneyard'</span>)
config.watchFolders = [boneyardPath]
config.resolver.nodeModulesPaths = [
  path.<span class="text-[#fde68a]">resolve</span>(__dirname, <span class="text-[#86efac]">'node_modules'</span>),
  path.<span class="text-[#fde68a]">resolve</span>(boneyardPath, <span class="text-[#86efac]">'node_modules'</span>),
]

module.exports = config`} />

        <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-2">
          <p className="text-[13px] font-medium text-stone-700">Published package</p>
          <p className="text-[13px] text-[#78716c]">
            When using boneyard-js from npm (not a local symlink), no Metro config changes are needed.
            Just <code className="text-[12px] bg-white px-1 py-0.5 rounded border border-stone-200">npm install boneyard-js</code> and import.
          </p>
        </div>
      </section>

      {/* Project structure */}
      <section>
        <div className="section-divider">
          <span>Project structure</span>
        </div>
        <div className="mt-4 rounded-lg border border-stone-200 bg-[#1a1a1a] p-5 font-mono text-[13px] leading-[1.8] overflow-x-auto">
          <div className="text-stone-500">my-rn-app/</div>
          <div className="text-stone-400 pl-4">├── bones/</div>
          <div className="text-[#86efac] pl-8">├── profile-card.bones.json</div>
          <div className="text-[#86efac] pl-8">├── feed-item.bones.json</div>
          <div className="text-[#fde68a] pl-8">└── registry.ts</div>
          <div className="text-stone-400 pl-4">├── components/</div>
          <div className="text-stone-400 pl-8">├── ProfileCard.tsx</div>
          <div className="text-stone-400 pl-8">└── FeedItem.tsx</div>
          <div className="text-[#93c5fd] pl-4">├── App.tsx <span className="text-stone-600">← import &apos;./bones/registry&apos;</span></div>
          <div className="text-stone-400 pl-4">├── app.json</div>
          <div className="text-stone-400 pl-4">└── package.json</div>
        </div>
      </section>

      {/* Differences from web */}
      <section>
        <div className="section-divider">
          <span>Differences from web</span>
        </div>
        <div className="mt-4 rounded-lg border border-stone-200 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left px-4 py-2 font-medium text-stone-700">Feature</th>
                <th className="text-left px-4 py-2 font-medium text-stone-700">Web</th>
                <th className="text-left px-4 py-2 font-medium text-stone-700">React Native</th>
              </tr>
            </thead>
            <tbody className="text-[#78716c]">
              <tr className="border-b border-stone-100">
                <td className="px-4 py-2 text-stone-800">Import</td>
                <td className="px-4 py-2 font-mono text-[12px]">boneyard-js/react</td>
                <td className="px-4 py-2 font-mono text-[12px]">boneyard-js/native</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-2 text-stone-800">Animation</td>
                <td className="px-4 py-2">CSS keyframes</td>
                <td className="px-4 py-2">Animated API (opacity pulse)</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-2 text-stone-800">Dark mode</td>
                <td className="px-4 py-2">prefers-color-scheme + .dark class</td>
                <td className="px-4 py-2">useColorScheme() + dark prop</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-2 text-stone-800">Responsive</td>
                <td className="px-4 py-2">ResizeObserver on container</td>
                <td className="px-4 py-2">useWindowDimensions (screen width)</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-2 text-stone-800">CLI build</td>
                <td className="px-4 py-2">npx boneyard-js build</td>
                <td className="px-4 py-2">Generate from web, or write by hand</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-stone-800">Bone format</td>
                <td className="px-4 py-2" colSpan={2}>Identical .bones.json — fully cross-platform</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next steps */}
      <section>
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
          <p className="text-[13px] font-medium text-stone-700 mb-2">Next steps</p>
          <ul className="text-[13px] text-[#78716c] space-y-1 list-disc pl-4">
            <li>See <a href="/install" className="text-stone-800 underline underline-offset-2">Getting Started</a> for the full web setup walkthrough</li>
            <li>See <a href="/output" className="text-stone-800 underline underline-offset-2">Output</a> to understand the .bones.json format in detail</li>
            <li>Browse <a href="/try-it" className="text-stone-800 underline underline-offset-2">Examples</a> for bone data you can use in your RN app</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
