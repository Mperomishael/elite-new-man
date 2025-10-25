import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "LLC - your trading starts here",
  description: "Trade stocks and cryptocurrencies with confidence on UltimateStckTrader",
  generator: "v0.app",
  icons: {
    icon: "https://i.ibb.co/pBSBnW9y/Whats-App-Image-2025-10-10-at-8-45-37-AM-1-removebg-preview-1.png",
    shortcut: "https://i.ibb.co/pBSBnW9y/Whats-App-Image-2025-10-10-at-8-45-37-AM-1-removebg-preview-1.png",
    apple: "https://i.ibb.co/pBSBnW9y/Whats-App-Image-2025-10-10-at-8-45-37-AM-1-removebg-preview-1.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script src="//code.jivosite.com/widget/58f9qTOD4U" async></script>

      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
