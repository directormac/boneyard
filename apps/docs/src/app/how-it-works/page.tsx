"use client";

import { useRef, useEffect, useState } from "react";
import type { SkeletonDescriptor } from "boneyard";
import { computeLayout } from "boneyard/layout";
import { BrowserMockup } from "@/components/browser-mockup";

// ── The example card used across all 3 steps ──

function ExampleCard({ showScanOverlay }: { showScanOverlay?: boolean }) {
  return (
    <div className="flex flex-col gap-3 relative">
      {/* Image placeholder */}
      <div className="relative w-full aspect-video bg-stone-200 rounded-md">
        {showScanOverlay && (
          <div className="absolute inset-0 border-2 border-dashed border-green-500 rounded-md" />
        )}
      </div>
      {/* Title */}
      <div className="relative">
        <h3 className="text-[15px] font-bold leading-tight">Understanding Modern Web Performance</h3>
        {showScanOverlay && (
          <div className="absolute inset-0 border-2 border-dashed border-green-500 rounded" />
        )}
      </div>
      {/* Description */}
      <div className="relative">
        <p className="text-[13px] leading-[19px] text-stone-500">
          Layout shift occurs when visible elements move during page load.
        </p>
        {showScanOverlay && (
          <div className="absolute inset-0 border-2 border-dashed border-green-500 rounded" />
        )}
      </div>
      {/* Avatar row */}
      <div className="flex items-center gap-2 relative">
        <div className="relative">
          <div className="w-6 h-6 rounded-full bg-stone-300 shrink-0" />
          {showScanOverlay && (
            <div className="absolute inset-0 border-2 border-dashed border-green-500 rounded-full" />
          )}
        </div>
        <div className="relative">
          <span className="text-[12px] font-medium text-stone-500">Sarah Chen</span>
          {showScanOverlay && (
            <div className="absolute inset-0 border-2 border-dashed border-green-500 rounded" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── The descriptor that represents the card ──

const cardDescriptor: SkeletonDescriptor = {
  display: "flex", flexDirection: "column", gap: 12,
  children: [
    { aspectRatio: 1.778, borderRadius: 6 },
    { text: "Understanding Modern Web Performance", font: "700 15px Inter", lineHeight: 18.75 },
    { text: "Layout shift occurs when visible elements move during page load.", font: "400 13px Inter", lineHeight: 19 },
    {
      display: "flex", alignItems: "center", gap: 8, children: [
        { width: 24, height: 24, borderRadius: "50%" },
        { text: "Sarah Chen", font: "500 12px Inter", lineHeight: 18 },
      ]
    },
  ],
};

// ── Skeleton render using computeLayout ──

function SkeletonCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  let skeleton: { bones: { x: number; y: number; w: number; h: number; r: number | string }[]; height: number } | null = null;
  if (mounted) {
    try {
      skeleton = computeLayout(cardDescriptor, width, "how-it-works-render");
    } catch {
      skeleton = null;
    }
  }

  return (
    <div ref={containerRef}>
      {skeleton && (
        <div className="relative w-full" style={{ height: skeleton.height }}>
          {skeleton.bones.map((b, i) => (
            <div
              key={i}
              className="bone absolute"
              style={{
                left: b.x,
                top: b.y,
                width: b.w,
                height: b.h,
                borderRadius: typeof b.r === "string" ? b.r : `${b.r}px`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──

export default function HowItWorksPage() {
  return (
    <div className="max-w-[720px] px-6 pt-14 pb-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold tracking-tight mb-2">
          How it works
        </h1>
        <p className="text-[15px] text-[#78716c]">
          What happens when you wrap a component with{" "}
          <code className="font-[family-name:var(--font-mono)] text-[13px] bg-[#f5f5f4] px-1.5 py-0.5 rounded">&lt;Skeleton&gt;</code>.
        </p>
      </div>

      {/* Side-by-side: Real UI vs Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mb-2">Your component</div>
          <BrowserMockup url="localhost:3000">
            <ExampleCard />
          </BrowserMockup>
        </div>
        <div>
          <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mb-2">Generated skeleton</div>
          <BrowserMockup url="localhost:3000">
            <SkeletonCard />
          </BrowserMockup>
        </div>
      </div>

      {/* Under the hood */}
      <div>
        <div className="section-divider">
          <span>Under the hood</span>
        </div>
        <p className="text-[14px] text-[#78716c] leading-relaxed mt-4 mb-6">
          When you wrap a component with{" "}
          <code className="font-[family-name:var(--font-mono)] text-[13px] bg-[#f5f5f4] px-1.5 py-0.5 rounded">&lt;Skeleton&gt;</code>,
          three things happen automatically &mdash; no placeholder data needed:
        </p>

        <div className="space-y-8">
          {/* Step 1 */}
          <div>
            <h3 className="text-[15px] font-semibold mb-2">1. Wrap</h3>
            <p className="text-[14px] text-[#78716c] leading-relaxed mb-3">
              You wrap your component with{" "}
              <code className="font-[family-name:var(--font-mono)] text-[13px] bg-[#f5f5f4] px-1.5 py-0.5 rounded">&lt;Skeleton loading=&#123;isLoading&#125;&gt;</code>.
              When <code className="font-[family-name:var(--font-mono)] text-[13px] bg-[#f5f5f4] px-1.5 py-0.5 rounded">loading</code> is
              false, your children render normally.
            </p>
            <BrowserMockup url="localhost:3000">
              <ExampleCard />
            </BrowserMockup>
          </div>

          {/* Step 2 */}
          <div>
            <h3 className="text-[15px] font-semibold mb-2">2. Snapshot</h3>
            <p className="text-[14px] text-[#78716c] leading-relaxed mb-3">
              After your content paints, boneyard calls{" "}
              <code className="font-[family-name:var(--font-mono)] text-[13px] bg-[#f5f5f4] px-1.5 py-0.5 rounded">snapshotBones</code>{" "}
              on the rendered DOM. It walks the subtree and reads the exact pixel position,
              size, and border radius of every visible element. This produces a flat array of bones
              and writes them to a JSON file.
            </p>
            <BrowserMockup url="localhost:3000">
              <ExampleCard showScanOverlay />
            </BrowserMockup>
          </div>

          {/* Step 3 */}
          <div>
            <h3 className="text-[15px] font-semibold mb-2">3. Replay</h3>
            <p className="text-[14px] text-[#78716c] leading-relaxed mb-3">
              Next time <code className="font-[family-name:var(--font-mono)] text-[13px] bg-[#f5f5f4] px-1.5 py-0.5 rounded">loading</code> becomes
              true, boneyard renders those bones as gray rectangles overlaid on the hidden component —
              each one an absolutely positioned div matching the exact position from the real layout.
              When loading becomes false, your children replace the skeleton with zero layout shift.
            </p>
            <BrowserMockup url="localhost:3000">
              <SkeletonCard />
            </BrowserMockup>
          </div>
        </div>
      </div>

      {/* How to use */}
      <div className="border-l-2 border-[#d6d3d1] pl-4 py-1 space-y-2">
        <p className="text-[14px] text-[#78716c]">
          Run{" "}
          <code className="font-[family-name:var(--font-mono)] text-[13px] bg-[#f5f5f4] px-1.5 py-0.5 rounded">npx boneyard build</code>{" "}
          to pre-generate bones, then add{" "}
          <code className="font-[family-name:var(--font-mono)] text-[13px] bg-[#f5f5f4] px-1.5 py-0.5 rounded">import &apos;./bones/registry&apos;</code>{" "}
          to your app entry. Every{" "}
          <code className="font-[family-name:var(--font-mono)] text-[13px] bg-[#f5f5f4] px-1.5 py-0.5 rounded">&lt;Skeleton name=&quot;...&quot;&gt;</code>{" "}
          auto-resolves its bones from the registry — no per-component imports needed.
        </p>
      </div>
    </div>
  );
}
