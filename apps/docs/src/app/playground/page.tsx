"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { snapshotBones } from "boneyard";
import type { Bone, SkeletonResult, ResponsiveBones, SnapshotConfig } from "boneyard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import playgroundBones from "@/bones/playground.bones.json";

// ── Mock data ──────────────────────────────────────────────────────────────────

const navItems = [
  { label: "Inbox", icon: "✉" },
  { label: "Projects", icon: "◫" },
  { label: "Docs", icon: "❖" },
  { label: "Calendar", icon: "▤" },
  { label: "Settings", icon: "⚙" },
];

const stats = [
  { label: "Open threads", value: "23", color: "bg-amber-50 border-amber-200", text: "text-amber-700", sub: "text-amber-500", dot: "bg-amber-400" },
  { label: "Due this week", value: "8", color: "bg-blue-50 border-blue-200", text: "text-blue-700", sub: "text-blue-500", dot: "bg-blue-400" },
  { label: "Shipped", value: "147", color: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", sub: "text-emerald-500", dot: "bg-emerald-400" },
  { label: "Active now", value: "6", color: "bg-purple-50 border-purple-200", text: "text-purple-700", sub: "text-purple-500", dot: "bg-purple-400" },
];

const tasks = [
  { title: "Finalize v2 launch copy", status: "In Review", statusColor: "bg-blue-100 text-blue-700", due: "Today", seed: 10 },
  { title: "iOS push notification sounds", status: "In Progress", statusColor: "bg-amber-100 text-amber-700", due: "Wed", seed: 20 },
  { title: "Migrate Stripe to usage billing", status: "Todo", statusColor: "bg-stone-100 text-stone-600", due: "Fri", seed: 30 },
  { title: "Fix Safari clipboard paste", status: "Done", statusColor: "bg-emerald-100 text-emerald-700", due: "Mon", seed: 40 },
];

const activity = [
  { text: "Nina merged #891", time: "2m ago", seed: 11 },
  { text: "Raj commented on launch plan", time: "14m ago", seed: 22 },
  { text: "Soph uploaded new assets", time: "1h ago", seed: 33 },
  { text: "Tom deployed to staging", time: "3h ago", seed: 44 },
];

const chartBars = [35, 50, 42, 68, 55, 78, 62, 85, 70, 92, 80, 65];

// ── The mock app UI ────────────────────────────────────────────────────────────

function AppUI({ narrow }: { narrow: boolean }) {
  return (
    <div className="flex h-full min-h-[560px] bg-stone-50 text-[13px] overflow-hidden rounded-xl border border-stone-200">
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
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
          <div className="px-3 py-3 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <img
                src="https://picsum.photos/seed/99/28/28"
                alt="avatar"
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-stone-700 truncate">Nina R.</div>
                <div className="text-[11px] text-stone-400 truncate">Engineer</div>
              </div>
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

          {/* Task list */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
              <span className="font-semibold text-stone-700">Recent Tasks</span>
              <Button variant="ghost" size="sm" className="text-[11px] text-indigo-600 h-7 px-2">View all →</Button>
            </div>
            <div className="divide-y divide-stone-50">
              {tasks.map((task) => (
                <div key={task.title} className="flex items-center gap-3 px-4 py-2.5">
                  <img
                    src={`https://picsum.photos/seed/${task.seed}/24/24`}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                  <span className="flex-1 text-stone-700 font-medium truncate text-[13px]">{task.title}</span>
                  <Badge className={`text-[10px] shrink-0 ${task.statusColor}`}>{task.status}</Badge>
                  <span className="text-[11px] text-stone-400 shrink-0">{task.due}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart + Activity */}
          <div className={`grid gap-3 ${narrow ? "grid-cols-1" : "grid-cols-2"}`}>
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="text-[12px] font-semibold text-stone-700 mb-3">PRs merged (12 wk)</div>
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
      </main>
    </div>
  );
}

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

  const [maxWidth, setMaxWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [view, setView] = useState<View>("ui");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Start null — seeded client-side in useEffect to avoid SSR/hydration mismatch
  const [snapshot, setSnapshot] = useState<SkeletonResult | null>(null);

  const [showCode, setShowCode] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  // snapshotConfig controls
  const [captureRoundedBorders, setCaptureRoundedBorders] = useState(false);
  const [excludeSelectorsInput, setExcludeSelectorsInput] = useState("[data-no-skeleton]");
  const [leafTagsInput, setLeafTagsInput] = useState("p, h1, h2, h3, h4, h5, h6, li, tr");

  const excludeSelectors = excludeSelectorsInput.split(",").map((s) => s.trim()).filter(Boolean);
  const leafTags = leafTagsInput.split(",").map((s) => s.trim()).filter(Boolean);
  const snapshotCfg: SnapshotConfig = { captureRoundedBorders, excludeSelectors, leafTags };
  const configRef = useRef<SnapshotConfig>(snapshotCfg);
  configRef.current = snapshotCfg;

  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartW = useRef(0);
  // Tracks whether the user is at "full/Desktop" width so resizes follow automatically
  const atDesktop = useRef(true);

  // Measure available space — re-attach when fullscreen toggles (DOM remounts outerRef)
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
  }, [isFullscreen]);

  // When maxWidth changes, update containerWidth if user is at Desktop (full) width
  useEffect(() => {
    if (maxWidth <= 0) return;
    if (atDesktop.current) {
      setContainerWidth(maxWidth);
      // Seed from pre-generated bones while live extraction is pending
      const rb = playgroundBones as unknown as ResponsiveBones;
      const bps = Object.keys(rb.breakpoints).map(Number).sort((a, b) => a - b);
      const match = [...bps].reverse().find((bp) => maxWidth >= bp) ?? bps[0];
      const pre = rb.breakpoints[match] ?? null;
      if (pre) setSnapshot((prev) => prev ?? pre);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxWidth]);

  // Extract bones after every stable render (double rAF, same pattern as <Skeleton>)
  const extract = useCallback(() => {
    if (!appRef.current) return;
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!appRef.current) return;
        // Pass firstElementChild so the AppUI root container doesn't emit a
        // full-size bone for itself — same pattern as <Skeleton> in react.tsx
        const target = appRef.current.firstElementChild as Element | null;
        if (!target) return;
        try {
          const result = snapshotBones(target, "playground", configRef.current);
          setSnapshot(result);
          // Register so `npx boneyard build` can capture this
          if (typeof window !== "undefined") {
            const w = window as any;
            w.__BONEYARD_BONES = w.__BONEYARD_BONES ?? {};
            w.__BONEYARD_BONES["playground"] = result;
          }
        } catch {
          // keep previous snapshot on error
        }
      });
    });
    return raf1;
  }, []);

  useEffect(() => {
    const raf = extract();
    return () => { if (raf !== undefined) cancelAnimationFrame(raf); };
  }, [containerWidth, captureRoundedBorders, excludeSelectorsInput, leafTagsInput, extract]);

  // Drag to resize
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

  // Shared controls + canvas — use JSX variables (not nested components) to avoid remounting refs
  const controls = (
    <div className="flex items-center gap-3">
      {/* View toggle */}
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

      <div className="w-px h-4 bg-stone-200" />

      {/* Width presets */}
      <div className="flex items-center gap-1.5">
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

      {/* Code toggle */}
      <button
        onClick={() => setShowCode((v) => !v)}
        className={`px-2.5 py-1 rounded-md text-[12px] border transition-colors ${
          showCode ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
        }`}
      >
        Code
      </button>

      {/* Config toggle */}
      <button
        onClick={() => setShowConfig((v) => !v)}
        className={`px-2.5 py-1 rounded-md text-[12px] border transition-colors ${
          showConfig ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
        }`}
      >
        Config
      </button>

      {/* Fullscreen toggle */}
      <button
        onClick={() => { atDesktop.current = true; setIsFullscreen((v) => !v); }}
        className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] border border-stone-200 bg-white text-stone-600 hover:border-stone-300 transition-colors"
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? (
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><path d="M2 11.5V13.5H4M13 11.5V13.5H11M2 4.5V2.5H4M13 4.5V2.5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><path d="M1.5 1.5H5.5M1.5 1.5V5.5M1.5 1.5L6 6M13.5 1.5H9.5M13.5 1.5V5.5M13.5 1.5L9 6M1.5 13.5H5.5M1.5 13.5V9.5M1.5 13.5L6 9M13.5 13.5H9.5M13.5 13.5V9.5M13.5 13.5L9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
        )}
        {isFullscreen ? "Exit" : "Fullscreen"}
      </button>
    </div>
  );

  const configPanel = showConfig ? (
    <div className="flex flex-wrap gap-x-6 gap-y-3 pt-3 mt-1 border-t border-stone-100">
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
          className="text-[11px] font-mono border border-stone-200 rounded px-2 py-0.5 w-48 focus:outline-none focus:border-stone-400 placeholder:text-stone-300"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-stone-500">leafTags</span>
        <input
          type="text"
          value={leafTagsInput}
          onChange={(e) => setLeafTagsInput(e.target.value)}
          className="text-[11px] font-mono border border-stone-200 rounded px-2 py-0.5 w-56 focus:outline-none focus:border-stone-400"
        />
      </div>
    </div>
  ) : null;

  const canvas = (
    <div ref={outerRef} className="w-full">
      {maxWidth > 0 && (
        <div className="relative inline-block" style={{ width: effectiveWidth }}>
          {/* App UI — always rendered and VISIBLE so snapshotBones always works */}
          <div ref={appRef}>
            <AppUI narrow={narrow} />
          </div>

          {/* Skeleton overlay — bones render on top of the real UI, excluded areas stay visible */}
          {showSkeleton && snapshot && (
            <div
              className="absolute top-0 left-0 w-full rounded-xl overflow-hidden pointer-events-none"
              style={{ height: snapshot.height }}
            >
              {snapshot.bones.map((bone: Bone, i: number) => (
                <div
                  key={i}
                  className="absolute bone-pulse"
                  style={{
                    left: bone.x,
                    top: bone.y,
                    width: bone.w,
                    height: bone.h,
                    borderRadius: typeof bone.r === "string" ? bone.r : `${bone.r}px`,
                    '--bone-color': bone.c ? '#e8e5e3' : '#d6d3d1',
                    backgroundColor: bone.c ? '#e8e5e3' : '#d6d3d1',
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}

          {/* Drag handle */}
          <div
            onMouseDown={onMouseDown}
            className="absolute top-0 right-[-14px] w-[10px] h-full flex items-center justify-center cursor-col-resize group z-20"
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
  );

  const configLines: string[] = [];
  if (!captureRoundedBorders) configLines.push(`    captureRoundedBorders: false,`);
  if (excludeSelectors.length > 0) configLines.push(`    excludeSelectors: [${excludeSelectors.map((s) => `'${s}'`).join(", ")}],`);
  if (leafTagsInput !== "p, h1, h2, h3, h4, h5, h6, li, tr") configLines.push(`    leafTags: [${leafTags.map((t) => `'${t}'`).join(", ")}],`);
  const configProp = configLines.length > 0 ? `\n  snapshotConfig={{\n${configLines.join("\n")}\n  }}` : "";

  const codeStr = `// import './bones/registry' in your app entry (layout.tsx)
import { Skeleton } from 'boneyard/react'

function App() {
  const { data, isLoading } = useFetch('/api/dashboard')

  return (
    <Skeleton name="app" loading={isLoading}${configProp}>
      {data && <Dashboard data={data} />}
    </Skeleton>
  )
}`;

  const codePanel = showCode ? (
    <div className="relative rounded-xl border border-stone-200 bg-[#1a1a1a] p-4 mt-4 max-h-[320px] overflow-auto">
      <CopyButton text={codeStr} />
      <pre className="text-[11px] font-mono leading-relaxed whitespace-pre">
        <span className="text-stone-500">{"// 1. Wrap your component and give it a name"}</span>{"\n"}
        <span className="text-stone-500">{"// 2. Run: npx boneyard build"}</span>{"\n"}
        <span className="text-stone-500">{"// 3. Add import './bones/registry' to your app entry"}</span>{"\n\n"}
        <span className="text-[#c084fc]">import</span><span className="text-stone-300">{" { Skeleton } "}</span><span className="text-[#c084fc]">from</span><span className="text-[#86efac]"> &apos;boneyard/react&apos;</span>{"\n\n"}
        <span className="text-[#c084fc]">function</span><span className="text-[#fde68a]"> App</span><span className="text-stone-300">() {"{"}</span>{"\n"}
        <span className="text-stone-300">  </span><span className="text-[#c084fc]">const</span><span className="text-stone-300">{" { data, isLoading } = "}</span><span className="text-[#fde68a]">useFetch</span><span className="text-stone-300">(</span><span className="text-[#86efac]">&apos;/api/dashboard&apos;</span><span className="text-stone-300">)</span>{"\n\n"}
        <span className="text-stone-300">  </span><span className="text-[#c084fc]">return</span><span className="text-stone-300"> (</span>{"\n"}
        <span className="text-stone-300">    </span><span className="text-stone-500">{"<"}</span><span className="text-[#fde68a]">Skeleton</span><span className="text-[#93c5fd]"> name</span><span className="text-stone-300">=</span><span className="text-[#86efac]">&quot;app&quot;</span><span className="text-[#93c5fd]"> loading</span><span className="text-stone-300">={"{isLoading}"}</span><span className="text-stone-500">{">"}</span>{"\n"}
        <span className="text-stone-300">      {"{data && "}</span><span className="text-stone-500">{"<"}</span><span className="text-[#fde68a]">Dashboard</span><span className="text-stone-300"> data={"{data}"} </span><span className="text-stone-500">{"/>"}</span><span className="text-stone-300">{"}"}</span>{"\n"}
        <span className="text-stone-300">    </span><span className="text-stone-500">{"</"}</span><span className="text-[#fde68a]">Skeleton</span><span className="text-stone-500">{">"}</span>{"\n"}
        <span className="text-stone-300">  )</span>{"\n"}
        <span className="text-stone-300">{"}"}</span>
      </pre>
    </div>
  ) : null;

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[13px] font-semibold text-stone-700">Playground</span>
          </div>
          {controls}
          {configPanel}
        </div>
        <div className="flex-1 overflow-auto p-6">
          {canvas}
          {codePanel && (
            <div style={{ width: effectiveWidth }}>
              {codePanel}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header + controls — constrained width */}
      <div className="max-w-[720px] px-6 pt-14 pb-4 space-y-4 shrink-0">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight mb-1">Playground</h1>
          <p className="text-[14px] text-[#78716c]">
            Resize the canvas and tweak <code className="text-[12px] bg-stone-100 px-1 py-0.5 rounded">snapshotConfig</code> — bones re-extract live on every change.
          </p>
        </div>
        {controls}
        {configPanel}
      </div>

      {/* Canvas — full available width */}
      <div className="flex-1 px-6 pb-12 overflow-x-auto">
        {canvas}
        {codePanel && (
          <div style={{ width: effectiveWidth }}>
            {codePanel}
          </div>
        )}
      </div>
    </div>
  );
}
