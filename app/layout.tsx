import type { Metadata, Viewport } from 'next'
import { Inter, Dancing_Script } from 'next/font/google'
import './globals.css'
import 'highlight.js/styles/github-dark.css'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import MetaPixel from '@/components/analytics/MetaPixel'

const inter = Inter({ subsets: ['latin'] })
const dancingScript = Dancing_Script({ subsets: ['latin'], variable: '--font-cursive' })

export const metadata: Metadata = {
  title: 'AI Sidekick | Local Business Growth Agent',
  description: 'Specialized AI assistant for local trade businesses. Get expert advice on marketing, SEO, operations, and growth strategies for landscaping, electrical, HVAC, plumbing, roofing, and more.',
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'AI Sidekick | Local Business Growth Agent',
    description: 'Specialized AI assistant for local trade businesses. Get expert advice on marketing, SEO, operations, and growth strategies for landscaping, electrical, HVAC, plumbing, roofing, and more.',
    url: 'https://ai-sidekick-alpha.vercel.app',
    siteName: 'AI Sidekick',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Sidekick - Local Business Growth Agent',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Sidekick | Local Business Growth Agent',
    description: 'Specialized AI assistant for local trade businesses. Get expert advice on marketing, SEO, operations, and growth strategies for landscaping, electrical, HVAC, plumbing, roofing, and more.',
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${dancingScript.variable}`}>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <MetaPixel pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID} />
        )}
        {children}
      </body>
    </html>
  )
}
