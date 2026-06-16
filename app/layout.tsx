import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import Script from "next/script" // Added this import

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
      <body className={`font-sans antialiased bg-black text-white`}>
        {/* Smartsupp Chat Integration using Next.js Script component */}
        <Script id="smartsupp-chat" strategy="afterInteractive">
          {`
            var _smartsupp = _smartsupp || {};
            _smartsupp.key = '7b4841efa688aedfe6f7e1fa634e5dac501b905b';
            window.smartsupp||(function(d) {
              var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
              s=d.getElementsByTagName('script')[0];c=d.createElement('script');
              c.type='text/javascript';c.charset='utf-8';c.async=true;
              c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
            })(document);
          `}
        </Script>

        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
        
        <Analytics />
        
        <noscript>
          Powered by <a href="https://www.smartsupp.com" target="_blank" rel="noreferrer">Smartsupp</a>
        </noscript>
      </body>
    </html>
  )
}
