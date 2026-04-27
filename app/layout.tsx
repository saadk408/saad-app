import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import { Nav } from "./components/nav";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sentry Test Lab",
  description: "Next.js 16 sandbox for testing Sentry features",
};

const TICKER =
  [
    "[12:04:21] GET /products status=200 dur=312ms ✓",
    "[12:04:22] act addItem qty=1 evt=span dur=18ms ✓",
    "[12:04:23] GET /products/SPC-001 status=200 dur=89ms ✓",
    "[12:04:24] act setQty qty=2 evt=span dur=22ms ✓",
    "[12:04:24] POST /api/echo hops=3 status=200 dur=240ms ✓",
    "[12:04:25] log.info checkout begin dur=2ms ✓",
    "[12:04:25] act checkout evt=span dur=812ms ✓",
    "[12:04:26] POST /api/checkout status=200 dur=420ms ✓",
    "[12:04:26] POST /api/payment status=200 dur=391ms ✓",
    "[12:04:27] GET /cart status=200 dur=104ms ✓",
    "[12:04:28] GET /dashboard status=200 dur=72ms ✓",
    "[12:04:30] GET /signin status=200 dur=58ms ✓",
    "[12:04:31] act bumpCounter signups evt=span dur=4ms ✓",
    "[12:04:32] GET /labs status=200 dur=64ms ✓",
    "[12:04:33] GET /labs/errors status=200 dur=52ms ✓",
    "[12:04:34] err onClick TypeError cap=window.error",
    "[12:04:35] act throwInAction evt=span dur=12ms ✗",
    "[12:04:35] GET /api/products?fail=1 status=500 dur=8ms ✗",
    "[12:04:36] GET /labs/tracing status=200 dur=67ms ✓",
    "[12:04:37] POST /api/echo hops=2 status=200 dur=180ms ✓",
    "[12:04:38] POST /api/echo hops=1 status=200 dur=92ms ✓",
    "[12:04:39] GET /labs/logs status=200 dur=44ms ✓",
    "[12:04:40] log.warn cache miss dur=1ms ✓",
    "[12:04:41] GET /labs/seer status=200 dur=49ms ✓",
    "[12:04:42] act runBuggyCheckout evt=span dur=9ms ✗",
    "[12:04:42] err applyDiscount TypeError cap=server.action",
    "[12:04:43] GET /labs/feedback status=200 dur=38ms ✓",
    "[12:04:44] GET / status=200 dur=61ms ✓",
    "[12:04:45] act addItem qty=1 evt=span dur=14ms ✓",
    "[12:04:46] GET /products/SPC-005 status=200 dur=84ms ✓",
    "[12:04:47] act checkout evt=span dur=802ms ✓",
    "[12:04:48] POST /api/payment status=500 dur=312ms ✗",
  ].join("    ·    ") + "    ·    ";

function MarqueeStrip() {
  return (
    <div
      aria-hidden
      className="fixed bottom-0 inset-x-0 overflow-hidden whitespace-nowrap text-[10px] opacity-[0.06] select-none pointer-events-none py-1 z-10 leading-none"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <div className="marquee-track inline-block">
        {TICKER}
        {TICKER}
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-6xl py-12 pl-8 pr-4 lg:pl-16 lg:pr-8 flex-1">
          {children}
        </main>
        <MarqueeStrip />
      </body>
    </html>
  );
}
