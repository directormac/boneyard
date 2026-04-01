"use client";

import { useRef, useState, useCallback } from "react";
import { snapshotBones } from "@0xgf/boneyard";
import { Skeleton } from "@0xgf/boneyard/react";
import type { SkeletonResult, SnapshotConfig } from "@0xgf/boneyard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Mock data ────────────────────────────────────────────────────────────────

const users = [
  { name: "Priya Sharma", role: "Engineering Lead", avatar: 1, status: "online" },
  { name: "Jake Morrison", role: "Product Designer", avatar: 2, status: "online" },
  { name: "Lea Chen", role: "Backend Engineer", avatar: 3, status: "away" },
  { name: "Tom Nakamura", role: "Data Scientist", avatar: 4, status: "offline" },
  { name: "Sarah O'Brien", role: "DevOps", avatar: 5, status: "online" },
];

const notifications = [
  { text: "Deploy #4821 succeeded on production", time: "2m", type: "success" },
  { text: "CPU usage above 90% on us-east-1", time: "8m", type: "warning" },
  { text: "New PR: Refactor auth middleware", time: "14m", type: "info" },
  { text: "Stripe webhook failed 3 retries", time: "22m", type: "error" },
  { text: "Migration completed: users_v2 table", time: "1h", type: "success" },
];

const tableData = [
  { endpoint: "/api/users", method: "GET", p50: "12ms", p99: "89ms", rpm: "2.4k", status: "healthy" },
  { endpoint: "/api/billing", method: "POST", p50: "34ms", p99: "210ms", rpm: "890", status: "healthy" },
  { endpoint: "/api/search", method: "GET", p50: "67ms", p99: "450ms", rpm: "3.1k", status: "degraded" },
  { endpoint: "/api/webhooks", method: "POST", p50: "8ms", p99: "42ms", rpm: "12k", status: "healthy" },
  { endpoint: "/api/uploads", method: "PUT", p50: "120ms", p99: "1.2s", rpm: "340", status: "warning" },
  { endpoint: "/api/auth", method: "POST", p50: "22ms", p99: "156ms", rpm: "5.6k", status: "healthy" },
];

const calendarEvents = [
  { title: "Sprint Planning", time: "9:00 AM", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { title: "Design Review", time: "11:30 AM", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { title: "1:1 w/ Jake", time: "2:00 PM", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { title: "Deploy Window", time: "4:00 PM", color: "bg-amber-100 text-amber-700 border-amber-200" },
];

const sparkline = [20, 35, 28, 45, 38, 52, 48, 62, 55, 70, 65, 78, 72, 85, 80, 92];
const barData = [45, 62, 38, 78, 55, 90, 42, 68, 75, 50, 82, 60];
const donutSegments = [
  { pct: 42, color: "#6366f1", label: "API" },
  { pct: 28, color: "#f59e0b", label: "Web" },
  { pct: 18, color: "#10b981", label: "Mobile" },
  { pct: 12, color: "#ef4444", label: "Other" },
];

const kanbanColumns = [
  {
    title: "Backlog",
    color: "bg-stone-100",
    cards: [
      { title: "Dark mode support", tags: ["design", "frontend"], priority: "low" },
      { title: "Export to CSV", tags: ["backend"], priority: "medium" },
    ],
  },
  {
    title: "In Progress",
    color: "bg-blue-50",
    cards: [
      { title: "Auth middleware refactor", tags: ["backend", "security"], priority: "high" },
      { title: "Dashboard redesign", tags: ["design"], priority: "high" },
      { title: "Rate limiting v2", tags: ["backend", "infra"], priority: "medium" },
    ],
  },
  {
    title: "Review",
    color: "bg-amber-50",
    cards: [
      { title: "Billing page updates", tags: ["frontend"], priority: "medium" },
    ],
  },
  {
    title: "Done",
    color: "bg-emerald-50",
    cards: [
      { title: "SSO integration", tags: ["backend", "security"], priority: "high" },
      { title: "Onboarding flow v3", tags: ["frontend", "design"], priority: "medium" },
    ],
  },
];

const recentFiles = [
  { name: "Q4 Revenue Report.xlsx", size: "2.4 MB", modified: "2h ago", icon: "spreadsheet" },
  { name: "Architecture Diagram.fig", size: "14 MB", modified: "5h ago", icon: "design" },
  { name: "API Spec v2.yaml", size: "89 KB", modified: "1d ago", icon: "code" },
  { name: "Brand Guidelines.pdf", size: "8.1 MB", modified: "2d ago", icon: "document" },
];

const chatMessages = [
  { sender: "Priya", text: "The migration is running — should be done in ~10 min", self: false },
  { sender: "You", text: "Perfect, I'll hold off on the deploy until then", self: true },
  { sender: "Priya", text: "Also heads up: the search index needs a rebuild after", self: false },
  { sender: "You", text: "Got it. I'll add it to the runbook", self: true },
];

// ── Snapshot helper: captures bones from a ref ───────────────────────────────

const SNAPSHOT_CONFIG: SnapshotConfig = {
  captureRoundedBorders: false,
  excludeSelectors: [],
  leafTags: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "tr", "td", "th"],
};

function useSkeletonCapture() {
  const refs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [bones, setBones] = useState<Record<string, SkeletonResult>>({});
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const setRef = useCallback((name: string) => (el: HTMLDivElement | null) => {
    if (el) refs.current.set(name, el);
    else refs.current.delete(name);
  }, []);

  const generate = useCallback(() => {
    setIsGenerating(true);
    setLoading(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const captured: Record<string, SkeletonResult> = {};
        refs.current.forEach((el, name) => {
          try {
            captured[name] = snapshotBones(el, name, SNAPSHOT_CONFIG);
          } catch (e) {
            console.error(`Snapshot failed for ${name}:`, e);
          }
        });
        setBones(captured);
        setLoading(true);
        setIsGenerating(false);
      });
    });
  }, []);

  const totalBones = Object.values(bones).reduce((sum, b) => sum + b.bones.length, 0);

  return { setRef, bones, loading, setLoading, generate, isGenerating, totalBones };
}

// ── Skeleton wrapper: captures from ref, passes bones to <Skeleton> ──────────

function SkeletonSection({
  name, loading, bones, setRef, children,
}: {
  name: string;
  loading: boolean;
  bones: Record<string, SkeletonResult>;
  setRef: (name: string) => (el: HTMLDivElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <Skeleton loading={loading} initialBones={bones[name]} name={name} color="#d6d3d1">
      <div ref={setRef(name)}>{children}</div>
    </Skeleton>
  );
}

// ── Demo Page ────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const { setRef, bones, loading, setLoading, generate, isGenerating, totalBones } = useSkeletonCapture();

  return (
    <div className="fixed inset-0 z-50 bg-[#fafaf9] overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-10 space-y-8">
        {/* Back button */}
        <a href="/overview" className="inline-flex items-center gap-1.5 text-[13px] text-stone-400 hover:text-stone-600 transition-colors">
          &larr; Back to docs
        </a>

        {/* Hero */}
        <div className="text-center">
          <h1 className="text-[48px] md:text-[64px] font-black tracking-tight leading-[0.95] mb-4 text-stone-900">
            Never Write A<br />Skeleton Again
          </h1>
          <p className="text-[16px] text-stone-500 max-w-[480px] mx-auto mb-6">
            One click. Zero layout thrashing. Pixel-perfect loading states extracted directly from your real UI.
          </p>
          <div className="flex items-center justify-center gap-3">
            {!loading ? (
              <button
                onClick={generate}
                disabled={isGenerating}
                className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-semibold transition-all ${
                  isGenerating
                    ? "bg-stone-300 text-stone-500 cursor-wait"
                    : "bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-300 hover:shadow-xl hover:shadow-stone-300 hover:-translate-y-0.5"
                }`}
              >
                {isGenerating ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-stone-400 border-t-white rounded-full animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>Generate Skeleton &#x2192;</>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLoading(false)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-semibold bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-300 transition-all"
                >
                  Show UI
                </button>
                <button
                  onClick={() => setLoading(true)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                >
                  &#x2713; Skeleton &middot; {totalBones} bones
                </button>
              </div>
            )}
          </div>
        </div>

        {/* The app UI with in-place skeleton */}
        <div>
          <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-2 px-1">
            {loading ? "Skeleton mode — dynamic content replaced" : "Your ridiculously complex interface"}
          </div>

          <div className="relative flex flex-col bg-stone-50 text-[13px] overflow-hidden rounded-xl border border-stone-200" style={{ minHeight: 700 }}>
            {/* ── Top nav bar — always visible ── */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[12px]">N</div>
                <span className="font-semibold text-stone-800 text-[14px]">Nexus</span>
                <div className="h-5 w-px bg-stone-200 mx-1" />
                <div className="flex gap-1">
                  {["Dashboard", "Analytics", "Projects", "Settings"].map((tab, i) => (
                    <button key={tab} className={`px-3 py-1 rounded-md text-[12px] ${
                      i === 0 ? "bg-stone-900 text-white font-medium" : "text-stone-500 hover:bg-stone-100"
                    }`}>{tab}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 bg-stone-100 rounded-lg px-3 py-1.5 text-stone-400 text-[12px] w-[200px]">
                  <span className="text-[11px]">&#x2315;</span>
                  <span>Search anything...</span>
                  <span className="ml-auto text-[10px] bg-stone-200 px-1.5 py-0.5 rounded text-stone-500">&#x2318;K</span>
                </div>
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-[14px]">&#x1F514;</div>
                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">3</div>
                </div>
                <img src="https://picsum.photos/seed/demo1/32/32" alt="avatar" className="w-8 h-8 rounded-full object-cover" />
              </div>
            </div>

            <div className="flex flex-1">
              {/* ── Left sidebar ── */}
              <aside className="w-[220px] shrink-0 bg-white border-r border-stone-200 p-3 flex flex-col gap-4">
                <div>
                  <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2 px-1">Team</div>
                  <SkeletonSection name="team" loading={loading} bones={bones} setRef={setRef}>
                    <div className="space-y-1">
                      {users.map((u) => (
                        <div key={u.name} className="flex items-center gap-2 px-2 py-1.5 rounded-md">
                          <div className="relative">
                            <img src={`https://picsum.photos/seed/u${u.avatar}/28/28`} alt="" className="w-7 h-7 rounded-full object-cover" />
                            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                              u.status === "online" ? "bg-emerald-400" : u.status === "away" ? "bg-amber-400" : "bg-stone-300"
                            }`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-medium text-stone-700 truncate">{u.name}</div>
                            <div className="text-[10px] text-stone-400 truncate">{u.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SkeletonSection>
                </div>

                <div>
                  <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2 px-1">Today</div>
                  <SkeletonSection name="calendar" loading={loading} bones={bones} setRef={setRef}>
                    <div className="space-y-1.5">
                      {calendarEvents.map((e) => (
                        <div key={e.title} className={`px-2.5 py-1.5 rounded-lg border text-[11px] ${e.color}`}>
                          <div className="font-medium">{e.title}</div>
                          <div className="opacity-70 text-[10px]">{e.time}</div>
                        </div>
                      ))}
                    </div>
                  </SkeletonSection>
                </div>

                <div>
                  <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2 px-1">Chat</div>
                  <SkeletonSection name="chat" loading={loading} bones={bones} setRef={setRef}>
                    <div className="space-y-1.5 bg-stone-50 rounded-lg p-2">
                      {chatMessages.map((m, i) => (
                        <div key={i} className={`flex ${m.self ? "justify-end" : "justify-start"}`}>
                          <div className={`px-2 py-1 rounded-lg text-[11px] max-w-[85%] ${
                            m.self ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600"
                          }`}>{m.text}</div>
                        </div>
                      ))}
                      <div className="flex items-center gap-1.5 mt-1">
                        <input type="text" placeholder="Type a message..." className="flex-1 text-[11px] bg-white border border-stone-200 rounded-md px-2 py-1 placeholder:text-stone-300" readOnly />
                        <button className="w-6 h-6 rounded-md bg-stone-900 text-white flex items-center justify-center text-[10px]">&#x2191;</button>
                      </div>
                    </div>
                  </SkeletonSection>
                </div>
              </aside>

              {/* ── Main content area ── */}
              <div className="flex-1 overflow-hidden p-4 space-y-3">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { label: "Total Revenue", value: "$128.4k", change: "+12.3%", trend: "up" },
                    { label: "Active Users", value: "24,891", change: "+8.1%", trend: "up" },
                    { label: "API Calls", value: "1.2M", change: "-2.4%", trend: "down" },
                    { label: "Error Rate", value: "0.12%", change: "-18%", trend: "up" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-3">
                      <div className="text-[10px] text-stone-400 font-medium mb-1">{s.label}</div>
                      <SkeletonSection name={`stat-${s.label}`} loading={loading} bones={bones} setRef={setRef}>
                        <div>
                          <div className="text-[20px] font-bold text-stone-800 leading-none">{s.value}</div>
                          <div className={`text-[10px] mt-1 font-medium ${s.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                            {s.change} vs last month
                          </div>
                        </div>
                      </SkeletonSection>
                    </div>
                  ))}
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-white rounded-xl border border-stone-200 p-3">
                    <div className="text-[11px] font-semibold text-stone-700 mb-1">Traffic (7d)</div>
                    <div className="text-[9px] text-stone-400 mb-2">Requests per second</div>
                    <SkeletonSection name="chart-traffic" loading={loading} bones={bones} setRef={setRef}>
                      <svg viewBox="0 0 160 40" className="w-full h-[40px]">
                        <polyline fill="none" stroke="#6366f1" strokeWidth="2"
                          points={sparkline.map((v, i) => `${(i / (sparkline.length - 1)) * 160},${40 - (v / 100) * 40}`).join(" ")} />
                        <polyline fill="url(#sparkGrad)" stroke="none"
                          points={`0,40 ${sparkline.map((v, i) => `${(i / (sparkline.length - 1)) * 160},${40 - (v / 100) * 40}`).join(" ")} 160,40`} />
                        <defs>
                          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </SkeletonSection>
                  </div>

                  <div className="bg-white rounded-xl border border-stone-200 p-3">
                    <div className="text-[11px] font-semibold text-stone-700 mb-1">Deploys (12w)</div>
                    <div className="text-[9px] text-stone-400 mb-2">Per week</div>
                    <SkeletonSection name="chart-deploys" loading={loading} bones={bones} setRef={setRef}>
                      <div className="flex items-end gap-[2px] h-[40px]">
                        {barData.map((h, i) => (
                          <div key={i} className="flex-1 rounded-t bg-indigo-400 opacity-80" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </SkeletonSection>
                  </div>

                  <div className="bg-white rounded-xl border border-stone-200 p-3">
                    <div className="text-[11px] font-semibold text-stone-700 mb-1">Traffic Split</div>
                    <div className="text-[9px] text-stone-400 mb-2">By client type</div>
                    <SkeletonSection name="chart-split" loading={loading} bones={bones} setRef={setRef}>
                      <div className="flex items-center gap-3">
                        <svg viewBox="0 0 36 36" className="w-[44px] h-[44px] shrink-0">
                          {(() => {
                            let offset = 0;
                            return donutSegments.map((seg) => {
                              const el = (
                                <circle key={seg.label} cx="18" cy="18" r="15.9" fill="none" stroke={seg.color}
                                  strokeWidth="4" strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                                  strokeDashoffset={-offset} transform="rotate(-90 18 18)" />
                              );
                              offset += seg.pct;
                              return el;
                            });
                          })()}
                        </svg>
                        <div className="flex flex-col gap-0.5">
                          {donutSegments.map((seg) => (
                            <div key={seg.label} className="flex items-center gap-1.5 text-[9px]">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: seg.color }} />
                              <span className="text-stone-500">{seg.label}</span>
                              <span className="font-semibold text-stone-700 ml-auto">{seg.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </SkeletonSection>
                  </div>
                </div>

                {/* API table + activity */}
                <div className="grid grid-cols-5 gap-2.5">
                  <div className="col-span-3 bg-white rounded-xl border border-stone-200 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100">
                      <span className="text-[11px] font-semibold text-stone-700">API Endpoints</span>
                      <div className="flex gap-1">
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[9px]">4 healthy</Badge>
                        <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-[9px]">1 degraded</Badge>
                      </div>
                    </div>
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="border-b border-stone-100 text-stone-400">
                          <th className="text-left font-medium px-3 py-1.5">Endpoint</th>
                          <th className="text-left font-medium px-2 py-1.5">Method</th>
                          <th className="text-left font-medium px-2 py-1.5">P50</th>
                          <th className="text-left font-medium px-2 py-1.5">P99</th>
                          <th className="text-left font-medium px-2 py-1.5">RPM</th>
                          <th className="text-left font-medium px-3 py-1.5">Status</th>
                        </tr>
                      </thead>
                    </table>
                    <SkeletonSection name="api-rows" loading={loading} bones={bones} setRef={setRef}>
                      <table className="w-full text-[10px]">
                        <tbody>
                          {tableData.map((row) => (
                            <tr key={row.endpoint} className="border-b border-stone-50">
                              <td className="px-3 py-1.5 font-mono text-stone-700 font-medium">{row.endpoint}</td>
                              <td className="px-2 py-1.5">
                                <Badge className={`text-[8px] ${
                                  row.method === "GET" ? "bg-blue-50 text-blue-600" :
                                  row.method === "POST" ? "bg-emerald-50 text-emerald-600" :
                                  "bg-amber-50 text-amber-600"
                                }`}>{row.method}</Badge>
                              </td>
                              <td className="px-2 py-1.5 font-mono text-stone-500">{row.p50}</td>
                              <td className="px-2 py-1.5 font-mono text-stone-500">{row.p99}</td>
                              <td className="px-2 py-1.5 font-mono text-stone-500">{row.rpm}</td>
                              <td className="px-3 py-1.5">
                                <div className="flex items-center gap-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    row.status === "healthy" ? "bg-emerald-400" :
                                    row.status === "degraded" ? "bg-amber-400" : "bg-red-400"
                                  }`} />
                                  <span className="text-stone-500 capitalize">{row.status}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </SkeletonSection>
                  </div>

                  <div className="col-span-2 bg-white rounded-xl border border-stone-200 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100">
                      <span className="text-[11px] font-semibold text-stone-700">Activity Feed</span>
                      <button className="text-[10px] text-indigo-600 font-medium">View all</button>
                    </div>
                    <SkeletonSection name="activity" loading={loading} bones={bones} setRef={setRef}>
                      <div className="divide-y divide-stone-50">
                        {notifications.map((n, i) => (
                          <div key={i} className="flex items-start gap-2 px-3 py-2">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                              n.type === "success" ? "bg-emerald-400" :
                              n.type === "warning" ? "bg-amber-400" :
                              n.type === "error" ? "bg-red-400" : "bg-blue-400"
                            }`} />
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] text-stone-600 leading-tight">{n.text}</div>
                              <div className="text-[9px] text-stone-400 mt-0.5">{n.time} ago</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SkeletonSection>
                  </div>
                </div>

                {/* Kanban */}
                <div className="bg-white rounded-xl border border-stone-200 p-3">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold text-stone-700">Project Board</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-stone-500">Filter</Button>
                      <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-indigo-600">+ New</Button>
                    </div>
                  </div>
                  <SkeletonSection name="kanban" loading={loading} bones={bones} setRef={setRef}>
                    <div className="grid grid-cols-4 gap-2">
                      {kanbanColumns.map((col) => (
                        <div key={col.title} className={`rounded-lg p-1.5 ${col.color}`}>
                          <div className="flex items-center justify-between mb-1.5 px-1">
                            <span className="text-[10px] font-semibold text-stone-600">{col.title}</span>
                            <span className="text-[9px] text-stone-400 bg-white rounded-full w-4 h-4 flex items-center justify-center">{col.cards.length}</span>
                          </div>
                          <div className="space-y-1">
                            {col.cards.map((card) => (
                              <div key={card.title} className="bg-white rounded-md p-2 border border-stone-100">
                                <div className="text-[11px] font-medium text-stone-700 mb-1">{card.title}</div>
                                <div className="flex items-center gap-1 flex-wrap">
                                  {card.tags.map((tag) => (
                                    <span key={tag} className="text-[8px] px-1 py-0.5 rounded-full bg-stone-100 text-stone-500">{tag}</span>
                                  ))}
                                  <div className={`ml-auto w-1.5 h-1.5 rounded-full ${
                                    card.priority === "high" ? "bg-red-400" :
                                    card.priority === "medium" ? "bg-amber-400" : "bg-stone-300"
                                  }`} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </SkeletonSection>
                </div>

                {/* Files + progress */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100">
                      <span className="text-[11px] font-semibold text-stone-700">Recent Files</span>
                      <button className="text-[10px] text-indigo-600 font-medium">Browse all</button>
                    </div>
                    <SkeletonSection name="files" loading={loading} bones={bones} setRef={setRef}>
                      <div className="divide-y divide-stone-50">
                        {recentFiles.map((f) => (
                          <div key={f.name} className="flex items-center gap-2.5 px-3 py-1.5">
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold ${
                              f.icon === "spreadsheet" ? "bg-emerald-50 text-emerald-600" :
                              f.icon === "design" ? "bg-purple-50 text-purple-600" :
                              f.icon === "code" ? "bg-blue-50 text-blue-600" :
                              "bg-stone-50 text-stone-500"
                            }`}>
                              {f.icon === "spreadsheet" ? "XL" :
                               f.icon === "design" ? "FG" :
                               f.icon === "code" ? "{ }" : "DC"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-medium text-stone-700 truncate">{f.name}</div>
                              <div className="text-[9px] text-stone-400">{f.size} &middot; {f.modified}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SkeletonSection>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="bg-white rounded-xl border border-stone-200 p-3">
                      <div className="text-[11px] font-semibold text-stone-700 mb-2.5">Sprint Progress</div>
                      <SkeletonSection name="progress" loading={loading} bones={bones} setRef={setRef}>
                        <div className="space-y-2">
                          {[
                            { label: "Frontend", pct: 78, color: "bg-indigo-500" },
                            { label: "Backend", pct: 92, color: "bg-emerald-500" },
                            { label: "Design", pct: 45, color: "bg-purple-500" },
                            { label: "QA", pct: 33, color: "bg-amber-500" },
                          ].map((bar) => (
                            <div key={bar.label}>
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[10px] text-stone-500">{bar.label}</span>
                                <span className="text-[10px] font-semibold text-stone-700">{bar.pct}%</span>
                              </div>
                              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </SkeletonSection>
                    </div>

                    <div className="bg-white rounded-xl border border-stone-200 p-3">
                      <div className="text-[11px] font-semibold text-stone-700 mb-2">Server Status</div>
                      <SkeletonSection name="servers" loading={loading} bones={bones} setRef={setRef}>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { name: "us-east-1", status: "operational", uptime: "99.98%" },
                            { name: "eu-west-1", status: "operational", uptime: "99.95%" },
                            { name: "ap-south-1", status: "degraded", uptime: "98.2%" },
                            { name: "us-west-2", status: "operational", uptime: "99.99%" },
                          ].map((s) => (
                            <div key={s.name} className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-stone-100">
                              <div className={`w-1.5 h-1.5 rounded-full ${s.status === "operational" ? "bg-emerald-400" : "bg-amber-400"}`} />
                              <div className="min-w-0">
                                <div className="text-[10px] font-mono text-stone-600">{s.name}</div>
                                <div className="text-[8px] text-stone-400">{s.uptime}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </SkeletonSection>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
