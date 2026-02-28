// ===========================================
// Coupon Repository
// ===========================================

import type { Coupon, CouponWithRelations, CouponFilters, PaginationParams, PaginatedResult } from '../schema'
import { coupons as seedCoupons } from '../seed'
import { paginate, sortItems, isNotExpired } from './base'
import { storeRepository } from './stores'
import { productRepository } from './products'
import { categoryRepository } from './categories'

// In-memory store (substituir por DB real)
let coupons = [...seedCoupons]

export const couponRepository = {
  async findById(id: string): Promise<Coupon | null> {
    return coupons.find(c => c.id === id) || null
  },

  async findByCode(code: string): Promise<Coupon | null> {
    return coupons.find(c => c.code.toUpperCase() === code.toUpperCase()) || null
  },

  async findAll(
    filters?: CouponFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Coupon>> {
    let result = [...coupons]

    // Aplicar filtros
    if (filters?.storeId) {
      result = result.filter(c => c.storeId === filters.storeId)
    }

    if (filters?.categoryId) {
      result = result.filter(c => c.categoryId === filters.categoryId)
    }

    if (filters?.productId) {
      result = result.filter(c => c.productId === filters.productId)
    }

    if (filters?.status) {
      result = result.filter(c => c.status === filters.status)
    }

    if (filters?.isVerified !== undefined) {
      result = result.filter(c => c.isVerified === filters.isVerified)
    }

    if (filters?.isExclusive !== undefined) {
      result = result.filter(c => c.isExclusive === filters.isExclusive)
    }

    if (filters?.notExpired) {
      result = result.filter(c => isNotExpired(c.expiresAt))
    }

    // Ordenar
    result = sortItems(
      result,
      pagination?.sortBy || 'usageCount',
      pagination?.sortOrder || 'desc'
    )

    return paginate(result, pagination)
  },

  // Buscar cupom com relações
  async findByIdWithRelations(id: string): Promise<CouponWithRelations | null> {
    const coupon = coupons.find(c => c.id === id)
    if (!coupon) return null

    return this.enrichCoupon(coupon)
  },

  // Adicionar dados relacionados ao cupom
  async enrichCoupon(coupon: Coupon): Promise<CouponWithRelations> {
    const [store, product, category] = await Promise.all([
      storeRepository.findById(coupon.storeId),
      coupon.productId ? productRepository.findById(coupon.productId) : null,
      coupon.categoryId ? categoryRepository.findById(coupon.categoryId) : null,
    ])

    return {
      ...coupon,
      store: store || undefined,
      product: product || undefined,
      category: category || undefined,
    }
  },

  // Cupons ativos (não expirados)
  async getActiveCoupons(limit?: number): Promise<CouponWithRelations[]> {
    let result = coupons
      .filter(c => c.status === 'active' && isNotExpired(c.expiresAt))
      .sort((a, b) => b.usageCount - a.usageCount)

    if (limit) {
      result = result.slice(0, limit)
    }

    return Promise.all(result.map(c => this.enrichCoupon(c)))
  },

  // Cupons por loja
  async getByStore(storeId: string, limit?: number): Promise<CouponWithRelations[]> {
    let result = coupons
      .filter(c => 
        c.storeId === storeId && 
        c.status === 'active' && 
        isNotExpired(c.expiresAt)
      )
      .sort((a, b) => b.usageCount - a.usageCount)

    if (limit) {
      result = result.slice(0, limit)
    }

    return Promise.all(result.map(c => this.enrichCoupon(c)))
  },

  // Cupons por loja (slug)
  async getByStoreSlug(storeSlug: string, limit?: number): Promise<CouponWithRelations[]> {
    const store = await storeRepository.findBySlug(storeSlug)
    if (!store) return []

    return this.getByStore(store.id, limit)
  },

  // Cupons verificados
  async getVerifiedCoupons(limit?: number): Promise<CouponWithRelations[]> {
    let result = coupons
      .filter(c => 
        c.isVerified && 
        c.status === 'active' && 
        isNotExpired(c.expiresAt)
      )
      .sort((a, b) => (b.successRate || 0) - (a.successRate || 0))

    if (limit) {
      result = result.slice(0, limit)
    }

    return Promise.all(result.map(c => this.enrichCoupon(c)))
  },

  // Cupons exclusivos SGC
  async getExclusiveCoupons(limit?: number): Promise<CouponWithRelations[]> {
    let result = coupons
      .filter(c => 
        c.isExclusive && 
        c.status === 'active' && 
        isNotExpired(c.expiresAt)
      )
      .sort((a, b) => b.usageCount - a.usageCount)

    if (limit) {
      result = result.slice(0, limit)
    }

    return Promise.all(result.map(c => this.enrichCoupon(c)))
  },

  // Incrementar contador de uso
  async incrementUsageCount(couponId: string): Promise<void> {
    const coupon = coupons.find(c => c.id === couponId)
    if (coupon) {
      coupon.usageCount++
      coupon.updatedAt = new Date()
    }
  },

  // Atualizar taxa de sucesso
  async updateSuccessRate(couponId: string, successRate: number): Promise<void> {
    const coupon = coupons.find(c => c.id === couponId)
    if (coupon) {
      coupon.successRate = successRate
      coupon.lastVerifiedAt = new Date()
      coupon.updatedAt = new Date()
    }
  },

  // Verificar e atualizar cupons expirados
  async checkAndUpdateExpiredCoupons(): Promise<number> {
    let count = 0
    const now = new Date()

    coupons.forEach(coupon => {
      if (coupon.status === 'active' && coupon.expiresAt && new Date(coupon.expiresAt) < now) {
        coupon.status = 'expired'
        coupon.updatedAt = now
        count++
      }
    })

    return count
  },

  // Agrupar cupons por loja
  async getCouponsGroupedByStore(): Promise<Map<string, CouponWithRelations[]>> {
    const activeCoupons = await this.getActiveCoupons()
    const grouped = new Map<string, CouponWithRelations[]>()

    activeCoupons.forEach(coupon => {
      const storeId = coupon.storeId
      if (!grouped.has(storeId)) {
        grouped.set(storeId, [])
      }
      grouped.get(storeId)!.push(coupon)
    })

    return grouped
  },
}
