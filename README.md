<p align="center">
  <img src="boneyard-logo.gif" alt="Boneyard" width="1000" />
</p>

# boneyard

Pixel-perfect skeleton loading screens, extracted from your real UI. No manual measurement, no hand-tuned placeholders.

Works with **React**, **Svelte 5**, and **React Native**.

## Quick start

```bash
npm install boneyard-js
```

### React

```tsx
import { Skeleton } from 'boneyard-js/react'

function BlogPage() {
  const { data, isLoading } = useFetch('/api/post')
  return (
    <Skeleton name="blog-card" loading={isLoading}>
      {data && <BlogCard data={data} />}
    </Skeleton>
  )
}
```

```bash
npx boneyard-js build
```

```ts
// Add once in your app entry
import './bones/registry'
```

### Svelte 5

```svelte
<script>
  import Skeleton from 'boneyard-js/svelte'
  import '../bones/registry'
  let loading = true
</script>

<Skeleton name="card" {loading}>
  <Card />
</Skeleton>
```

```bash
npx boneyard-js build
```

### React Native

```tsx
import { Skeleton } from 'boneyard-js/native'

<Skeleton name="profile-card" loading={isLoading}>
  <ProfileCard />
</Skeleton>
```

```bash
npx boneyard-js build --native --out ./bones
# Open your app on device — bones capture automatically
```

```ts
// Add once in your app entry, then reload
import './bones/registry'
```

No browser needed. The `--native` flag scans the actual native layout on your device via the React fiber tree.

## How it works

**Web (React / Svelte):** The CLI opens a headless browser, visits your app, finds every `<Skeleton name="...">`, and snapshots their layout at multiple breakpoints.

**React Native:** The `<Skeleton>` component auto-scans in dev mode when the CLI is running. It walks the fiber tree, measures views via `UIManager`, and sends bone data to the CLI. Zero overhead in production.

Both output the same `.bones.json` format — cross-platform compatible.

## CLI

```bash
npx boneyard-js build                              # auto-detect dev server
npx boneyard-js build http://localhost:3000         # explicit URL
npx boneyard-js build --native --out ./bones        # React Native
npx boneyard-js build --breakpoints 390,820,1440    # custom breakpoints
npx boneyard-js build --force                       # skip incremental cache
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | boolean | — | Show skeleton or real content |
| `name` | string | — | Unique name (generates `name.bones.json`) |
| `color` | string | `rgba(0,0,0,0.08)` | Bone fill color |
| `darkColor` | string | `rgba(255,255,255,0.06)` | Bone color in dark mode |
| `animate` | `'pulse'` \| `'shimmer'` \| `'solid'` | `'pulse'` | Animation style |
| `fixture` | ReactNode / Snippet | — | Mock content for CLI capture (dev only) |
| `initialBones` | ResponsiveBones | — | Pass bones directly (overrides registry) |
| `fallback` | ReactNode / Snippet | — | Shown when loading but no bones available |

## Config file

```json
{
  "breakpoints": [375, 768, 1280],
  "out": "./src/bones",
  "wait": 800,
  "color": "#e5e5e5",
  "animate": "pulse"
}
```

Save as `boneyard.config.json`. Per-component props override config values.

## Package exports

| Import | Use |
|--------|-----|
| `boneyard-js` | `snapshotBones`, `renderBones`, `computeLayout` |
| `boneyard-js/react` | React `<Skeleton>` |
| `boneyard-js/native` | React Native `<Skeleton>` |
| `boneyard-js/svelte` | Svelte `<Skeleton>` |

## Links

- [Docs](https://boneyard.vercel.app/overview)
- [npm](https://www.npmjs.com/package/boneyard-js)
- [Twitter](https://x.com/0xGoodfuture/status/2039818750568878245)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=0xGF/boneyard&type=Date)](https://star-history.com/#0xGF/boneyard&Date)

## License

MIT
