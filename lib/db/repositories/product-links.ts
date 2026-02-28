// ===========================================
// Product Link Repository
// Links de afiliados separados dos produtos
// ===========================================

import type { ProductLink, ClickTracking } from '../schema'
import type { PaginationParams, PaginatedResult } from '../schema'
import { productLinks as seedProductLinks } from '../seed'
import { paginate, sortItems, isNotExpired, generateId } from './base'

// In-memory stores (substituir por DB real)
let productLinks = [...seedProductLinks]
let clickTracking: ClickTracking[] = []

export interface ProductLinkFilters {
  productId?: string
  storeId?: string
  status?: ProductLink['status']
  notExpired?: boolean
}

export const productLinkRepository = {
  async findById(id: string): Promise<ProductLink | null> {
    return productLinks.find(l => l.id === id) || null
  },

  async findByShortCode(shortCode: string): Promise<ProductLink | null> {
    return productLinks.find(l => l.shortCode === shortCode) || null
  },

  async findAll(
    filters?: ProductLinkFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<ProductLink>> {
    let result = [...productLinks]

    // Aplicar filtros
    if (filters?.productId) {
      result = result.filter(l => l.productId === filters.productId)
    }

    if (filters?.storeId) {
      result = result.filter(l => l.storeId === filters.storeId)
    }

    if (filters?.status) {
      result = result.filter(l => l.status === filters.status)
    }

    if (filters?.notExpired) {
      result = result.filter(l => isNotExpired(l.expiresAt))
    }

    // Ordenar
    result = sortItems(
      result,
      pagination?.sortBy || 'priority',
      pagination?.sortOrder || 'asc'
    )

    return paginate(result, pagination)
  },

  // Buscar links ativos de um produto (ordenados por prioridade)
  async getActiveLinksForProduct(productId: string): Promise<ProductLink[]> {
    return productLinks
      .filter(l => 
        l.productId === productId && 
        l.status === 'active' &&
        isNotExpired(l.expiresAt)
      )
      .sort((a, b) => a.priority - b.priority)
  },

  // Buscar o melhor link ativo (com fallback)
  async getBestLinkForProduct(productId: string): Promise<ProductLink | null> {
    const links = await this.getActiveLinksForProduct(productId)
    return links[0] || null
  },

  // Buscar link por produto e loja
  async findByProductAndStore(productId: string, storeId: string): Promise<ProductLink | null> {
    return productLinks.find(l => 
      l.productId === productId && 
      l.storeId === storeId &&
      l.status === 'active' &&
      isNotExpired(l.expiresAt)
    ) || null
  },

  // Incrementar contador de cliques do link
  async incrementClickCount(linkId: string): Promise<void> {
    const link = productLinks.find(l => l.id === linkId)
    if (link) {
      link.clickCount++
      link.updatedAt = new Date()
    }
  },

  // Registrar clique com tracking detalhado
  async trackClick(data: {
    productLinkId: string
    productId: string
    storeId: string
    ipHash?: string
    userAgent?: string
    referer?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
  }): Promise<ClickTracking> {
    const tracking: ClickTracking = {
      id: generateId('click'),
      ...data,
      clickedAt: new Date(),
    }

    clickTracking.push(tracking)

    // Incrementar contador no link
    await this.incrementClickCount(data.productLinkId)

    return tracking
  },

  // Buscar estatísticas de cliques
  async getClickStats(productId: string): Promise<{
    total: number
    byStore: Record<string, number>
    last30Days: number
  }> {
    const productClicks = clickTracking.filter(c => c.productId === productId)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const byStore: Record<string, number> = {}
    productClicks.forEach(c => {
      byStore[c.storeId] = (byStore[c.storeId] || 0) + 1
    })

    return {
      total: productClicks.length,
      byStore,
      last30Days: productClicks.filter(c => c.clickedAt > thirtyDaysAgo).length,
    }
  },

  // Marcar link como expirado
  async markAsExpired(linkId: string): Promise<void> {
    const link = productLinks.find(l => l.id === linkId)
    if (link) {
      link.status = 'expired'
      link.updatedAt = new Date()
    }
  },

  // Marcar link como quebrado
  async markAsBroken(linkId: string): Promise<void> {
    const link = productLinks.find(l => l.id === linkId)
    if (link) {
      link.status = 'broken'
      link.updatedAt = new Date()
    }
  },

  // Atualizar preço do link
  async updatePrice(linkId: string, price: number, originalPrice?: number): Promise<void> {
    const link = productLinks.find(l => l.id === linkId)
    if (link) {
      link.price = price
      if (originalPrice !== undefined) {
        link.originalPrice = originalPrice
      }
      if (link.originalPrice) {
        link.discount = Math.round((1 - price / link.originalPrice) * 100)
      }
      link.updatedAt = new Date()
    }
  },

  // Verificar e atualizar status de links expirados
  async checkAndUpdateExpiredLinks(): Promise<number> {
    let count = 0
    const now = new Date()

    productLinks.forEach(link => {
      if (link.status === 'active' && link.expiresAt && new Date(link.expiresAt) < now) {
        link.status = 'expired'
        link.updatedAt = now
        count++
      }
    })

    return count
  },
}
