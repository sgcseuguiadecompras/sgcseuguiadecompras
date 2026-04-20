import type { Metadata, Viewport } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SalvosProvider } from '@/contexts/salvos-context'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SocialSidebar } from '@/components/social-sidebar'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.sgcseuguiadecompras.com.br'),
  title: 'SGC - Seu Guia de Compras',
  description: 'Compre melhor, pague menos e evite golpes! Ofertas verificadas e cupons atualizados.',
  keywords: ['compras online', 'cupons', 'ofertas', 'desconto', 'shopee', 'amazon', 'mercado livre', 'guia de compras'],
  openGraph: {
    title: 'SGC - Seu Guia de Compras',
    description: 'Compre melhor, pague menos e evite golpes! Ofertas verificadas e cupons atualizados.',
    url: 'https://www.sgcseuguiadecompras.com.br',
    siteName: 'SGC - Seu Guia de Compras',
    images: '/logo.png',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SGC - Seu Guia de Compras',
    description: 'Compre melhor, pague menos e evite golpes! Ofertas verificadas e cupons atualizados.',
    images: '/logo.png',
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
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
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
            <SocialSidebar />
            <Toaster />
          </SalvosProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
