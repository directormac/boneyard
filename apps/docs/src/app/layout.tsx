import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "boneyard - skeleton screens for your UI",
  description:
    "Pixel-perfect skeleton loading screens auto-extracted from your real DOM. Zero configuration, zero layout shift.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#fafaf9] text-[#1c1917] font-[family-name:var(--font-sans)] antialiased">
        {/* Centered container for sidebar + content */}
        <div className="mx-auto max-w-[1080px] flex h-screen px-3 py-3">
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
