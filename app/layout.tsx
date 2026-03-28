import type { Metadata, Viewport } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SalvosProvider } from '@/contexts/salvos-context'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seuguiadecompras.com.br"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'SGC - Seu Guia de Compras',
    template: '%s | SGC',
  },
  description: 'Compre melhor, pague menos e evite golpes. Seu guia inteligente de compras online com ofertas verificadas, cupons atualizados e recomendacoes de confianca.',
  keywords: ['compras online', 'cupons', 'ofertas', 'desconto', 'shopee', 'amazon', 'mercado livre', 'guia de compras'],
  openGraph: {
    title: 'SGC - Seu Guia de Compras',
    description: 'Compre melhor, pague menos e evite golpes. Ofertas verificadas e cupons atualizados.',
    type: 'website',
    locale: 'pt_BR',
    url: baseUrl,
    siteName: 'SGC - Seu Guia de Compras',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SGC - Seu Guia de Compras',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SGC - Seu Guia de Compras',
    description: 'Compre melhor, pague menos e evite golpes.',
    images: ['/og-image.jpg'],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d4f6b' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SalvosProvider>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <Toaster />
          </SalvosProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
