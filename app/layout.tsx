import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/hooks/useCart"
import "./globals.css"

// const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })
// const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Laroa Studio - House of Comfort | Interior Design & Furniture",
  description:
    "Transform your home with timeless elegance. Premium furniture and interior design services with 7+ years of experience. Shop living room, dining room, and bedroom collections.",
  keywords: "interior design, furniture, home decor, living room, dining room, bedroom, modern furniture",
  authors: [{ name: "Laroa Studio" }],
  openGraph: {
    title: "Laroa Studio - House of Comfort",
    description: "Premium furniture and interior design services",
    type: "website",
  },
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`font-sans antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
