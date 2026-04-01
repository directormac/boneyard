#!/usr/bin/env node
/**
 * boneyard CLI
 *
 * Visits your running app at every breakpoint, captures all named <Skeleton>
 * components, and writes responsive bones JSON files to disk.
 *
 * Usage:
 *   npx boneyard build [url] [options]
 *   npx boneyard build                          ← auto-detects your dev server
 *   npx boneyard build http://localhost:5173     ← explicit URL
 *   npx boneyard build http://localhost:3000/blog http://localhost:3000/shop
 *
 * Options:
 *   --out <dir>          Where to write .bones.json files (default: auto-detected)
 *   --breakpoints <bp>   Viewport widths to capture, comma-separated (default: 375,768,1280)
 *   --wait <ms>          Extra ms to wait after page load (default: 800)
 *
 * Requires playwright:
 *   npm install -D playwright && npx playwright install chromium
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import http from 'http'
import https from 'https'

const args = process.argv.slice(2)
const command = args[0]

if (!command || command === '--help' || command === '-h') {
  printHelp()
  process.exit(0)
}

if (command !== 'build') {
  console.error(`boneyard: unknown command "${command}". Try: npx boneyard build`)
  process.exit(1)
}

// ── Parse args ────────────────────────────────────────────────────────────────

const urls = []
// Auto-detect: prefer ./src/bones for projects with a src/ directory (Next.js, Vite, etc.)
let outDir = existsSync(resolve(process.cwd(), 'src')) ? './src/bones' : './bones'
let breakpoints = [375, 768, 1280]
let waitMs = 800

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--out') {
    outDir = args[++i]
  } else if (args[i] === '--breakpoints') {
    breakpoints = args[++i].split(',').map(Number).filter(n => n > 0)
  } else if (args[i] === '--wait') {
    waitMs = Math.max(0, Number(args[++i]) || 800)
  } else if (!args[i].startsWith('--')) {
    urls.push(args[i])
  }
}

// ── Auto-detect dev server ────────────────────────────────────────────────────

/**
 * Check if a URL is responding. Returns true if we get any HTTP response
 * (even 4xx/5xx — we just want to know something is listening).
 */
function probe(url) {
  return new Promise(resolve => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, { timeout: 1500 }, res => {
      res.destroy()
      resolve(true)
    })
    req.on('error', () => resolve(false))
    req.on('timeout', () => { req.destroy(); resolve(false) })
  })
}

/** Common dev server ports in priority order */
const DEV_PORTS = [3000, 3001, 3002, 5173, 5174, 4321, 8080, 8000, 4200, 8888]

async function detectDevServer() {
  for (const port of DEV_PORTS) {
    const url = `http://localhost:${port}`
    const ok = await probe(url)
    if (ok) return url
  }
  return null
}

if (urls.length === 0) {
  process.stdout.write('  boneyard: no URL provided — scanning for dev server...')
  const detected = await detectDevServer()
  if (detected) {
    process.stdout.write(` found ${detected}\n`)
    urls.push(detected)
  } else {
    process.stdout.write(' none found\n\n')
    console.error(
      '  boneyard: could not find a running dev server.\n\n' +
      '  Start your dev server first, then run:\n' +
      '    npx boneyard build\n\n' +
      '  Or pass your URL explicitly:\n' +
      '    npx boneyard build http://localhost:3000\n'
    )
    process.exit(1)
  }
}

// ── Load playwright ───────────────────────────────────────────────────────────

let chromium
try {
  const pw = await import('playwright')
  chromium = pw.chromium
} catch {
  console.error(
    '\nboneyard: playwright not found.\n\n' +
    'Install it:\n' +
    '  npm install -D playwright\n' +
    '  npx playwright install chromium\n'
  )
  process.exit(1)
}

// ── Capture ───────────────────────────────────────────────────────────────────

console.log(`\n  boneyard build`)
console.log(`  URLs:        ${urls.join(', ')}`)
console.log(`  Breakpoints: ${breakpoints.join(', ')}px`)
console.log(`  Output:      ${outDir}\n`)

const browser = await chromium.launch()
const page = await browser.newPage()

// { [skeletonName]: { breakpoints: { [width]: SkeletonResult } } }
const collected = {}

for (const url of urls) {
  console.log(`  Visiting ${url}`)

  for (const width of breakpoints) {
    await page.setViewportSize({ width, height: 900 })

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15_000 })
    } catch {
      // networkidle can timeout on heavy pages — still try to capture
    }

    // Wait for React to render and boneyard to snapshot
    if (waitMs > 0) await page.waitForTimeout(waitMs)

    // Read the global registry that <Skeleton name="..."> populates
    const bones = await page.evaluate(() => {
      return window.__BONEYARD_BONES ?? {}
    })

    const names = Object.keys(bones)

    if (names.length === 0) {
      console.warn(`    ⚠  No named <Skeleton name="..."> found at ${width}px`)
      console.warn(`       Make sure your <Skeleton> has a name prop and loading=false`)
      continue
    }

    for (const name of names) {
      collected[name] ??= { breakpoints: {} }
      collected[name].breakpoints[width] = bones[name]
      const boneCount = bones[name].bones?.length ?? 0
      console.log(`    ✓  ${name} @ ${width}px  (${boneCount} bones)`)
    }
  }
}

await browser.close()

// ── Write files ───────────────────────────────────────────────────────────────

if (Object.keys(collected).length === 0) {
  console.error(
    '\n  boneyard: nothing captured.\n\n' +
    '  Make sure your components have <Skeleton name="my-component" loading={false}>\n' +
    '  so boneyard can snapshot them before the CLI reads the registry.\n'
  )
  process.exit(1)
}

const outputDir = resolve(process.cwd(), outDir)
mkdirSync(outputDir, { recursive: true })

console.log('')
for (const [name, data] of Object.entries(collected)) {
  const outPath = join(outputDir, `${name}.bones.json`)
  writeFileSync(outPath, JSON.stringify(data, null, 2))
  const bpCount = Object.keys(data.breakpoints).length
  console.log(`  Wrote  ${outPath}  (${bpCount} breakpoint${bpCount !== 1 ? 's' : ''})`)
}

// ── Generate registry.js ─────────────────────────────────────────────────────
const names = Object.keys(collected)
const registryLines = [
  '// Auto-generated by `npx boneyard build` — do not edit',
  "import { registerBones } from 'boneyard/react'",
  '',
]
for (const name of names) {
  const varName = '_' + name.replace(/[^a-zA-Z0-9]/g, '_')
  registryLines.push(`import ${varName} from './${name}.bones.json'`)
}
registryLines.push('')
registryLines.push('registerBones({')
for (const name of names) {
  const varName = '_' + name.replace(/[^a-zA-Z0-9]/g, '_')
  registryLines.push(`  "${name}": ${varName},`)
}
registryLines.push('})')
registryLines.push('')

const registryPath = join(outputDir, 'registry.js')
writeFileSync(registryPath, registryLines.join('\n'))
console.log(`  Wrote  ${registryPath}  (${names.length} skeleton${names.length !== 1 ? 's' : ''})`)

const count = names.length
console.log(`\n  ✓ ${count} skeleton${count !== 1 ? 's' : ''} captured.\n`)

// Check if this looks like a first-time setup
const isFirstRun = !existsSync(resolve(outputDir, 'registry.js'))
console.log(`  Add this once to your app entry point:`)
console.log(`    import '${outDir}/registry'\n`)
console.log(`  Then just use:`)
console.log(`    <Skeleton name="my-component" loading={isLoading}>`)
console.log(`      <MyComponent />`)
console.log(`    </Skeleton>\n`)
console.log(`  No initialBones import needed — boneyard resolves it from the registry.\n`)


// ── Help ──────────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
  boneyard build [url] [options]

  Visits your app in a headless browser, captures all named <Skeleton>
  components, and writes .bones.json files + a registry to disk.

  Auto-detects your dev server if no URL is given (scans ports 3000, 5173, etc.).

  Options:
    --out <dir>          Output directory             (default: ./src/bones)
    --breakpoints <bp>   Comma-separated px widths    (default: 375,768,1280)
    --wait <ms>          Extra wait after page load   (default: 800)

  Examples:
    npx boneyard build
    npx boneyard build http://localhost:5173
    npx boneyard build --breakpoints 390,820,1440 --out ./public/bones

  Setup:
    1. Wrap your component:
       <Skeleton name="blog-card" loading={isLoading}>
         <BlogCard />
       </Skeleton>

    2. Run: npx boneyard build

    3. Import the registry once in your app entry:
       import './bones/registry'

    Done. Every <Skeleton name="..."> auto-resolves its bones.
`)
}
