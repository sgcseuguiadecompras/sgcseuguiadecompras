// ===========================================
// API de Redirecionamento com Tracking
// GET /api/redirect/[slug]
// ===========================================

import { NextRequest, NextResponse } from 'next/server'
import { productLinkRepository } from '@/lib/db'
import { productRepository } from '@/lib/db'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  
  try {
    // Buscar link pelo shortCode ou productId
    let link = await productLinkRepository.findByShortCode(slug)
    
    // Se não encontrou pelo shortCode, tenta pelo productId (para compatibilidade)
    if (!link) {
      // Buscar produto pelo slug
      const product = await productRepository.findBySlug(slug)
      if (product) {
        link = await productLinkRepository.getBestLinkForProduct(product.id)
      }
    }

    if (!link) {
      // Redireciona para home se não encontrar o link
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Extrair dados do request para tracking
    const userAgent = request.headers.get('user-agent') || undefined
    const referer = request.headers.get('referer') || undefined
    
    // Extrair UTM params
    const searchParams = request.nextUrl.searchParams
    const utmSource = searchParams.get('utm_source') || undefined
    const utmMedium = searchParams.get('utm_medium') || undefined
    const utmCampaign = searchParams.get('utm_campaign') || undefined

    // Gerar hash do IP para privacidade (não armazena IP real)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip')
    const ipHash = ip ? await hashIP(ip) : undefined

    // Registrar clique com tracking
    await productLinkRepository.trackClick({
      productLinkId: link.id,
      productId: link.productId,
      storeId: link.storeId,
      ipHash,
      userAgent,
      referer,
      utmSource,
      utmMedium,
      utmCampaign,
    })

    // Incrementar contador no produto também
    await productRepository.incrementClickCount(link.productId)

    // Redirecionar para o link de afiliado
    return NextResponse.redirect(link.url)
    
  } catch (error) {
    console.error('Redirect error:', error)
    // Em caso de erro, redireciona para home
    return NextResponse.redirect(new URL('/', request.url))
  }
}

// Helper para gerar hash do IP (privacidade)
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + 'sgc-salt-2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}
