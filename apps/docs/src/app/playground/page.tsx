"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { snapshotBones } from "@0xgf/boneyard";
import type { Bone, SkeletonResult, ResponsiveBones, SnapshotConfig } from "@0xgf/boneyard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import playgroundBones from "@/bones/playground.bones.json";
import {
  Sandpack,
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackLayout,
} from "@codesandbox/sandpack-react";

// ── Mock data ──────────────────────────────────────────────────────────────────

const navItems = [
  { label: "Inbox", icon: "✉", badge: 3 },
  { label: "Projects", icon: "◫", badge: 0 },
  { label: "Docs", icon: "❖", badge: 0 },
  { label: "Members", icon: "👥", badge: 0 },
  { label: "Calendar", icon: "▤", badge: 1 },
  { label: "Settings", icon: "⚙", badge: 0 },
];

const stats = [
  { label: "Open threads", value: "23", color: "bg-amber-50 border-amber-200", text: "text-amber-700", sub: "text-amber-500", dot: "bg-amber-400" },
  { label: "Due this week", value: "8", color: "bg-blue-50 border-blue-200", text: "text-blue-700", sub: "text-blue-500", dot: "bg-blue-400" },
  { label: "Shipped", value: "147", color: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", sub: "text-emerald-500", dot: "bg-emerald-400" },
  { label: "Active now", value: "6", color: "bg-purple-50 border-purple-200", text: "text-purple-700", sub: "text-purple-500", dot: "bg-purple-400" },
];

const tasks = [
  { title: "Finalize v2 launch copy", status: "In Review", statusColor: "bg-blue-100 text-blue-700", due: "Today", seed: 10, progress: 85 },
  { title: "iOS push notification sounds", status: "In Progress", statusColor: "bg-amber-100 text-amber-700", due: "Wed", seed: 20, progress: 60 },
  { title: "Migrate Stripe to usage billing", status: "Todo", statusColor: "bg-stone-100 text-stone-600", due: "Fri", seed: 30, progress: 15 },
  { title: "Fix Safari clipboard paste", status: "Done", statusColor: "bg-emerald-100 text-emerald-700", due: "Mon", seed: 40, progress: 100 },
  { title: "Redesign onboarding flow", status: "In Review", statusColor: "bg-blue-100 text-blue-700", due: "Thu", seed: 50, progress: 72 },
];

const members = [
  { name: "Nina R.", role: "Engineer", email: "nina@campsite.co", seed: 99 },
  { name: "Raj K.", role: "Designer", email: "raj@campsite.co", seed: 22 },
  { name: "Soph M.", role: "PM", email: "soph@campsite.co", seed: 33 },
  { name: "Tom W.", role: "Engineer", email: "tom@campsite.co", seed: 44 },
  { name: "Alex C.", role: "Lead", email: "alex@campsite.co", seed: 55 },
];

const activity = [
  { text: "Nina merged #891", time: "2m ago", seed: 11 },
  { text: "Raj commented on launch plan", time: "14m ago", seed: 22 },
  { text: "Soph uploaded new assets", time: "1h ago", seed: 33 },
  { text: "Tom deployed to staging", time: "3h ago", seed: 44 },
];

const chartBars = [35, 50, 42, 68, 55, 78, 62, 85, 70, 92, 80, 65];

// ── Tabs within the mock app ────────────────────────────────────────────────

type AppTab = "overview" | "members";

// ── The mock app UI ────────────────────────────────────────────────────────────

function AppUI({ narrow, contentRef, skeletonOverlay }: { narrow: boolean; contentRef?: React.RefObject<HTMLDivElement | null>; skeletonOverlay?: React.ReactNode }) {
  const [tab, setTab] = useState<AppTab>("overview");

  return (
    <div className="flex h-full min-h-[620px] bg-stone-50 text-[13px] overflow-hidden rounded-xl border border-stone-200">
      {/* Sidebar */}
      {!narrow && (
        <aside data-no-skeleton className="w-[180px] shrink-0 bg-white border-r border-stone-200 flex flex-col">
          <div className="flex items-center gap-2 px-4 pt-5 pb-4 border-b border-stone-100">
            <div className="w-7 h-7 rounded-lg bg-stone-900 flex items-center justify-center text-white font-bold text-[11px]">
              C
            </div>
            <span className="font-semibold text-stone-800 text-[13px]">Campsite</span>
          </div>
          <nav className="flex-1 px-3 py-3 space-y-0.5">
            {navItems.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
                  i === 0
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                }`}
              >
                <span className="text-[14px] opacity-70">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className="bg-indigo-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </nav>
          {/* Avatar stack */}
          <div className="px-4 py-3 border-t border-stone-100">
            <div className="text-[10px] text-stone-400 mb-2">Online now</div>
            <div className="flex items-center -space-x-1.5">
              {members.slice(0, 4).map((m) => (
                <img
                  key={m.seed}
                  src={`https://picsum.photos/seed/${m.seed}/24/24`}
                  alt={m.name}
                  className="w-6 h-6 rounded-full object-cover border-2 border-white"
                />
              ))}
              <span className="w-6 h-6 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-stone-500">
                +2
              </span>
            </div>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div data-no-skeleton className="flex items-center justify-between px-5 py-3 bg-white border-b border-stone-200 gap-3">
          <div className="flex items-center gap-1.5 text-[12px] text-stone-400 min-w-0">
            <span>Campsite</span>
            <span>/</span>
            <span className="text-stone-700 font-medium">Inbox</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-stone-100 rounded-md px-2.5 py-1.5 text-stone-400 text-[12px]">
              <span className="text-[11px]">⌕</span>
              <span>Search…</span>
            </div>
            <img
              src="https://picsum.photos/seed/99/28/28"
              alt="avatar"
              className="w-7 h-7 rounded-full object-cover"
            />
          </div>
        </div>

        {/* Tab bar */}
        <div data-no-skeleton className="flex items-center gap-0 px-5 bg-white border-b border-stone-200">
          {(["overview", "members"] as AppTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2.5 text-[12px] font-medium border-b-2 transition-colors capitalize ${
                tab === t
                  ? "border-indigo-500 text-indigo-700"
                  : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div ref={contentRef} className="relative">
        {skeletonOverlay}
        {tab === "overview" ? (
          <div className="p-5 space-y-4">
            {/* Stats */}
            <div className={`grid gap-3 ${narrow ? "grid-cols-2" : "grid-cols-4"}`}>
              {stats.map((s) => (
                <div key={s.label} className={`rounded-xl border p-3 ${s.color}`}>
                  <div className={`text-[10px] font-medium mb-1 ${s.sub} flex items-center gap-1`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </div>
                  <div className={`text-[22px] font-bold leading-none ${s.text}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Task list with progress bars */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                <span className="font-semibold text-stone-700">Recent Tasks</span>
                <div className="flex items-center gap-2">
                  <Badge className="text-[10px] bg-stone-100 text-stone-500">{tasks.length} tasks</Badge>
                  <Button variant="ghost" size="sm" className="text-[11px] text-indigo-600 h-7 px-2">View all →</Button>
                </div>
              </div>
              <div className="divide-y divide-stone-50">
                {tasks.map((task) => (
                  <div key={task.title} className="flex items-center gap-3 px-4 py-2.5">
                    <img
                      src={`https://picsum.photos/seed/${task.seed}/24/24`}
                      alt="avatar"
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-stone-700 font-medium truncate text-[13px] block">{task.title}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden max-w-[120px]">
                          <div
                            className={`h-full rounded-full ${task.progress === 100 ? "bg-emerald-400" : "bg-indigo-400"}`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-stone-400">{task.progress}%</span>
                      </div>
                    </div>
                    <Badge className={`text-[10px] shrink-0 ${task.statusColor}`}>{task.status}</Badge>
                    <span className="text-[11px] text-stone-400 shrink-0">{task.due}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart + Activity */}
            <div className={`grid gap-3 ${narrow ? "grid-cols-1" : "grid-cols-2"}`}>
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[12px] font-semibold text-stone-700">PRs merged (12 wk)</div>
                  <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">+18%</span>
                </div>
                <div className="flex items-end gap-[3px] h-[72px]">
                  {chartBars.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-indigo-400 rounded-t opacity-80"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="text-[12px] font-semibold text-stone-700 mb-3">Recent Activity</div>
                <div className="space-y-2.5">
                  {activity.map((a) => (
                    <div key={a.text} className="flex items-center gap-2">
                      <img
                        src={`https://picsum.photos/seed/${a.seed}/20/20`}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                      />
                      <span className="flex-1 text-[12px] text-stone-600 truncate">{a.text}</span>
                      <span className="text-[11px] text-stone-400 shrink-0">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Members tab — data table */
          <div className="p-5">
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                <span className="font-semibold text-stone-700">Team Members</span>
                <Button variant="ghost" size="sm" className="text-[11px] text-indigo-600 h-7 px-2">Invite →</Button>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 text-left">
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Email</th>
                    <th className="px-4 py-2 font-medium">Role</th>
                    <th className="px-4 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {members.map((m) => (
                    <tr key={m.name} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://picsum.photos/seed/${m.seed}/24/24`}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-medium text-stone-700">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-stone-500">{m.email}</td>
                      <td className="px-4 py-2.5">
                        <Badge className={`text-[10px] ${
                          m.role === "Lead" ? "bg-indigo-100 text-indigo-700" :
                          m.role === "Engineer" ? "bg-blue-100 text-blue-700" :
                          m.role === "Designer" ? "bg-pink-100 text-pink-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>{m.role}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button className="text-stone-400 hover:text-stone-600 text-[11px]">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

// ── Sandpack code templates ─────────────────────────────────────────────────

const TEMPLATES = {
  "blog-card": {
    label: "Blog Card",
    code: `import { Skeleton } from '@0xgf/boneyard/react'
import { useState, useEffect } from 'react'

function BlogCard({ data }) {
  return (
    <div style={{ maxWidth: 400, fontFamily: 'system-ui' }}>
      <img
        src="https://picsum.photos/seed/blog/400/200"
        alt=""
        style={{ width: '100%', aspectRatio: '2/1', objectFit: 'cover', borderRadius: 8 }}
      />
      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>
        {data.title}
      </h2>
      <p style={{ fontSize: 14, color: '#78716c', marginTop: 8, lineHeight: 1.5 }}>
        {data.excerpt}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <img
          src="https://picsum.photos/seed/author/32/32"
          alt=""
          style={{ width: 32, height: 32, borderRadius: '50%' }}
        />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Sarah Chen</div>
          <div style={{ fontSize: 11, color: '#a8a29e' }}>5 min read</div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        title: 'Understanding Layout Shift',
        excerpt: 'Layout shift happens when elements move during page load. Here is how skeleton screens fix it.',
      })
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <button
        onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000) }}
        style={{ marginBottom: 16, padding: '6px 12px', borderRadius: 6, border: '1px solid #d6d3d1', cursor: 'pointer', fontSize: 13 }}
      >
        Reload
      </button>
      <Skeleton name="blog-card" loading={loading}>
        {data && <BlogCard data={data} />}
      </Skeleton>
    </div>
  )
}`,
  },
  dashboard: {
    label: "Dashboard",
    code: `import { Skeleton } from '@0xgf/boneyard/react'
import { useState, useEffect } from 'react'

function Dashboard({ data }) {
  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 500 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        {data.stats.map((s) => (
          <div key={s.label} style={{ padding: 12, borderRadius: 8, border: '1px solid #e7e5e4', background: '#fafaf9' }}>
            <div style={{ fontSize: 11, color: '#a8a29e' }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ border: '1px solid #e7e5e4', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #f5f5f4', fontWeight: 600, fontSize: 13 }}>
          Recent Activity
        </div>
        {data.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: i < data.items.length - 1 ? '1px solid #f5f5f4' : 'none' }}>
            <img src={\`https://picsum.photos/seed/\${i}/24/24\`} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
            <span style={{ flex: 1, fontSize: 13 }}>{item.text}</span>
            <span style={{ fontSize: 11, color: '#a8a29e' }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        stats: [
          { label: 'Revenue', value: '$12.3k' },
          { label: 'Users', value: '1,204' },
          { label: 'Orders', value: '342' },
        ],
        items: [
          { text: 'Nina merged PR #891', time: '2m ago' },
          { text: 'Raj updated the design', time: '14m ago' },
          { text: 'Soph shipped v2.1', time: '1h ago' },
          { text: 'Tom deployed staging', time: '3h ago' },
        ],
      })
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <button
        onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000) }}
        style={{ marginBottom: 16, padding: '6px 12px', borderRadius: 6, border: '1px solid #d6d3d1', cursor: 'pointer', fontSize: 13 }}
      >
        Reload
      </button>
      <Skeleton name="dashboard" loading={loading}>
        {data && <Dashboard data={data} />}
      </Skeleton>
    </div>
  )
}`,
  },
  "e-commerce": {
    label: "Product Grid",
    code: `import { Skeleton } from '@0xgf/boneyard/react'
import { useState, useEffect } from 'react'

function ProductGrid({ products }) {
  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 500 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Search products..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #d6d3d1', fontSize: 13 }}
          readOnly
        />
        <button style={{ padding: '8px 14px', borderRadius: 8, background: '#1c1917', color: 'white', fontSize: 13, border: 'none' }}>
          Filter
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {products.map((p) => (
          <div key={p.name} style={{ border: '1px solid #e7e5e4', borderRadius: 8, overflow: 'hidden' }}>
            <img src={p.image} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
            <div style={{ padding: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: '#a8a29e', marginTop: 2 }}>{p.category}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{p.price}</span>
                <button style={{ padding: '4px 10px', borderRadius: 6, background: '#4f46e5', color: 'white', fontSize: 11, border: 'none' }}>
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setData([
        { name: 'Minimalist Watch', category: 'Accessories', price: '$89', image: 'https://picsum.photos/seed/watch/200/200' },
        { name: 'Canvas Backpack', category: 'Bags', price: '$65', image: 'https://picsum.photos/seed/bag/200/200' },
        { name: 'Wireless Earbuds', category: 'Audio', price: '$129', image: 'https://picsum.photos/seed/earbuds/200/200' },
        { name: 'Desk Lamp', category: 'Home', price: '$45', image: 'https://picsum.photos/seed/lamp/200/200' },
      ])
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <button
        onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000) }}
        style={{ marginBottom: 16, padding: '6px 12px', borderRadius: 6, border: '1px solid #d6d3d1', cursor: 'pointer', fontSize: 13 }}
      >
        Reload
      </button>
      <Skeleton name="product-grid" loading={loading}>
        {data && <ProductGrid products={data} />}
      </Skeleton>
    </div>
  )
}`,
  },
};

type TemplateKey = keyof typeof TEMPLATES;

// ── Playground ─────────────────────────────────────────────────────────────────

const MIN_WIDTH = 320;
const PRESETS = [
  { label: "Mobile", width: 375 },
  { label: "Tablet", width: 768 },
  { label: "Desktop", width: null },
];

type View = "ui" | "skeleton";

export default function PlaygroundPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [maxWidth, setMaxWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [view, setView] = useState<View>("ui");

  const [snapshot, setSnapshot] = useState<SkeletonResult | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>("blog-card");

  // snapshotConfig controls
  const [captureRoundedBorders, setCaptureRoundedBorders] = useState(false);
  const [excludeSelectorsInput, setExcludeSelectorsInput] = useState("[data-no-skeleton]");
  const [leafTagsInput, setLeafTagsInput] = useState("");

  const excludeSelectors = excludeSelectorsInput.split(",").map((s) => s.trim()).filter(Boolean);
  const leafTags = leafTagsInput.split(",").map((s) => s.trim()).filter(Boolean);
  const snapshotCfg: SnapshotConfig = { captureRoundedBorders, excludeSelectors, leafTags };
  const configRef = useRef<SnapshotConfig>(snapshotCfg);
  configRef.current = snapshotCfg;

  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartW = useRef(0);
  const atDesktop = useRef(true);

  useEffect(() => {
    if (!outerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0]?.contentRect.width ?? 0);
      setMaxWidth(w);
    });
    ro.observe(outerRef.current);
    const w = Math.floor(outerRef.current.getBoundingClientRect().width);
    setMaxWidth(w);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (maxWidth <= 0) return;
    if (atDesktop.current) {
      setContainerWidth(maxWidth);
      const rb = playgroundBones as unknown as ResponsiveBones;
      const bps = Object.keys(rb.breakpoints).map(Number).sort((a, b) => a - b);
      const match = [...bps].reverse().find((bp) => maxWidth >= bp) ?? bps[0];
      const pre = rb.breakpoints[match] ?? null;
      if (pre) setSnapshot((prev) => prev ?? pre);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxWidth]);

  const [contentOffset, setContentOffset] = useState({ x: 0, y: 0 });

  const extract = useCallback(() => {
    if (!appRef.current) return;
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!appRef.current) return;
        const target = appRef.current.firstElementChild as Element | null;
        if (!target) return;
        try {
          const result = snapshotBones(target, "playground", configRef.current);
          setSnapshot(result);
          // Calculate content area offset for skeleton overlay positioning
          const contentEl = contentRef.current;
          if (contentEl && target) {
            const contentRect = contentEl.getBoundingClientRect();
            const rootRect = target.getBoundingClientRect();
            setContentOffset({
              x: contentRect.left - rootRect.left,
              y: contentRect.top - rootRect.top,
            });
          }
        } catch {
          // keep previous snapshot
        }
      });
    });
    return raf1;
  }, []);

  useEffect(() => {
    const raf = extract();
    return () => { if (raf !== undefined) cancelAnimationFrame(raf); };
  }, [containerWidth, captureRoundedBorders, excludeSelectorsInput, leafTagsInput, extract]);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    atDesktop.current = false;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartW.current = containerWidth ?? maxWidth;
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - dragStartX.current;
      const next = Math.max(MIN_WIDTH, Math.min(maxWidth, dragStartW.current + delta));
      setContainerWidth(Math.round(next));
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, maxWidth]);

  const effectiveWidth = containerWidth ?? maxWidth;
  const narrow = effectiveWidth < 520;
  const showSkeleton = view === "skeleton";

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="max-w-[720px] px-6 pt-14 pb-4 space-y-4 shrink-0">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight mb-1">Playground</h1>
          <p className="text-[14px] text-[#78716c]">
            Test boneyard with the live demo below, or write your own code in the editor.
          </p>
        </div>
      </div>

      {/* ── Live Demo Section ── */}
      <div className="px-6 pb-8">
        <div className="section-divider mb-4">
          <span>Live Demo</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <div className="flex items-center bg-stone-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setView("ui")}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                view === "ui" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              UI
            </button>
            <button
              onClick={() => setView("skeleton")}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                view === "skeleton" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Skeleton
            </button>
          </div>

          <div className="w-px h-4 bg-stone-200 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-1.5">
            {PRESETS.map((p) => {
              const active = p.width === null ? effectiveWidth === maxWidth : effectiveWidth === p.width;
              return (
                <button
                  key={p.label}
                  onClick={() => { atDesktop.current = p.width === null; setContainerWidth(p.width ?? maxWidth); }}
                  className={`px-2.5 py-1 rounded-md text-[12px] border transition-colors ${
                    active ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="w-px h-4 bg-stone-200 hidden sm:block" />

          <button
            onClick={() => setShowConfig((v) => !v)}
            className={`px-2.5 py-1 rounded-md text-[12px] border transition-colors ${
              showConfig ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
            }`}
          >
            Config
          </button>

          {snapshot && (
            <span className="text-[11px] text-stone-400 ml-auto">
              {snapshot.bones.length} bones · {Math.round(snapshot.height)}px tall
            </span>
          )}
        </div>

        {/* Config panel */}
        {showConfig && (
          <div className="flex flex-wrap gap-x-6 gap-y-3 pb-3 mb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-stone-500">captureRoundedBorders</span>
              <button
                onClick={() => setCaptureRoundedBorders((v) => !v)}
                className={`px-2 py-0.5 rounded text-[11px] border font-medium transition-colors ${
                  captureRoundedBorders ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"
                }`}
              >
                {captureRoundedBorders ? "true" : "false"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-stone-500">excludeSelectors</span>
              <input
                type="text"
                value={excludeSelectorsInput}
                onChange={(e) => setExcludeSelectorsInput(e.target.value)}
                placeholder=".icon, [data-no-skeleton]"
                className="text-[11px] font-mono border border-stone-200 rounded px-2 py-0.5 w-full sm:w-48 focus:outline-none focus:border-stone-400 placeholder:text-stone-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-stone-500">leafTags</span>
              <input
                type="text"
                value={leafTagsInput}
                onChange={(e) => setLeafTagsInput(e.target.value)}
                placeholder="span, button, td"
                className="text-[11px] font-mono border border-stone-200 rounded px-2 py-0.5 w-full sm:w-56 focus:outline-none focus:border-stone-400 placeholder:text-stone-300"
              />
            </div>
          </div>
        )}

        {/* Canvas */}
        <div ref={outerRef} className="w-full">
          {maxWidth > 0 && (
            <div className="relative inline-block" style={{ width: effectiveWidth }}>
              <div ref={appRef}>
                <AppUI
                  narrow={narrow}
                  contentRef={contentRef}
                  skeletonOverlay={showSkeleton && snapshot ? (
                    <div
                      className="absolute inset-0 pointer-events-none z-10"
                      style={{ backgroundColor: '#f5f5f4' }}
                    >
                      {snapshot.bones.map((bone: Bone, i: number) => (
                        <div
                          key={i}
                          className="absolute bone-pulse"
                          style={{
                            left: bone.x - contentOffset.x,
                            top: bone.y - contentOffset.y,
                            width: bone.w,
                            height: bone.h,
                            borderRadius: typeof bone.r === "string" ? bone.r : `${bone.r}px`,
                            '--bone-color': bone.c ? '#e8e5e3' : '#d6d3d1',
                            backgroundColor: bone.c ? '#e8e5e3' : '#d6d3d1',
                          } as React.CSSProperties}
                        />
                      ))}
                    </div>
                  ) : null}
                />
              </div>

              <div
                onMouseDown={onMouseDown}
                className="absolute top-0 right-[-14px] w-[10px] h-full hidden sm:flex items-center justify-center cursor-col-resize group z-20"
                title="Drag to resize"
              >
                <div
                  className={`w-[4px] h-16 rounded-full transition-colors ${
                    isDragging ? "bg-indigo-500" : "bg-stone-300 group-hover:bg-indigo-400"
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Code Editor Section ── */}
      <div className="px-6 pb-12">
        <div className="section-divider mb-4">
          <span>Try it yourself</span>
        </div>
        <p className="text-[14px] text-[#78716c] mb-4">
          Edit the code below to test boneyard with your own components. The preview updates live.
        </p>

        {/* Template selector */}
        <div className="flex items-center gap-1.5 mb-4">
          {(Object.keys(TEMPLATES) as TemplateKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTemplate(key)}
              className={`px-2.5 py-1 rounded-md text-[12px] border transition-colors ${
                activeTemplate === key
                  ? "bg-stone-800 text-white border-stone-800"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
              }`}
            >
              {TEMPLATES[key].label}
            </button>
          ))}
        </div>

        <div className="rounded-xl overflow-hidden border border-stone-200">
          <SandpackProvider
            key={activeTemplate}
            template="react"
            files={{
              "/App.js": TEMPLATES[activeTemplate].code,
            }}
            customSetup={{
              dependencies: {
                "@0xgf/boneyard": "latest",
                react: "^19.0.0",
                "react-dom": "^19.0.0",
              },
            }}
            theme={{
              colors: {
                surface1: "#1a1a1a",
                surface2: "#252525",
                surface3: "#333333",
                clickable: "#999999",
                base: "#e8e5e4",
                disabled: "#4D4D4D",
                hover: "#c5c5c5",
                accent: "#a78bfa",
                error: "#f87171",
                errorSurface: "#2d1515",
              },
              syntax: {
                plain: "#e8e5e4",
                comment: { color: "#6b7280", fontStyle: "italic" },
                keyword: "#c084fc",
                tag: "#fde68a",
                punctuation: "#a8a29e",
                definition: "#fde68a",
                property: "#93c5fd",
                static: "#86efac",
                string: "#86efac",
              },
              font: {
                body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                mono: '"JetBrains Mono", "Fira Code", "Cascadia Code", Menlo, monospace',
                size: "12px",
                lineHeight: "1.6",
              },
            }}
            options={{
              showLineNumbers: true,
              showInlineErrors: true,
              editorHeight: 320,
            }}
          >
            <SandpackLayout style={{ flexDirection: 'column' }} className="sm:!flex-row">
              <SandpackCodeEditor
                showLineNumbers
                showInlineErrors
                style={{ height: 320, minWidth: 0 }}
              />
              <SandpackPreview
                showOpenInCodeSandbox={false}
                showRefreshButton
                style={{ height: 320, minWidth: 0 }}
              />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    </div>
  );
}
