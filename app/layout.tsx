import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Elite Block Market - Trade Crypto & Forex",
  description: "Elite Block Market - Your Gateway to Crypto and Forex Trading. Trade with confidence and earn passive income.",
  generator: "v0.app",
  icons: {
    icon: "https://i.ibb.co/DPWT64HW/file-00000000899871f49095bc51ed0ef7c0.png",
    shortcut: "https://i.ibb.co/DPWT64HW/file-00000000899871f49095bc51ed0ef7c0.png",
    apple: "https://i.ibb.co/DPWT64HW/file-00000000899871f49095bc51ed0ef7c0.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background dark">
      <head>
       <script src="//code.jivosite.com/widget/0fjHk31MUi" async></script>

      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased bg-black text-white`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
