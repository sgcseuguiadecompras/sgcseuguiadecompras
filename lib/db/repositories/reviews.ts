// ===========================================
// Review Repository
// Reviews vinculados ao productId interno
// ===========================================

import type { Review, ReviewWithRelations, ReviewFilters, PaginationParams, PaginatedResult } from '../schema'
import { reviews as seedReviews } from '../seed'
import { paginate, sortItems, generateId } from './base'
import { productRepository } from './products'

// In-memory store (substituir por DB real)
let reviews = [...seedReviews]

export const reviewRepository = {
  async findById(id: string): Promise<Review | null> {
    return reviews.find(r => r.id === id) || null
  },

  async findAll(
    filters?: ReviewFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Review>> {
    let result = [...reviews]

    // Aplicar filtros
    if (filters?.productId) {
      result = result.filter(r => r.productId === filters.productId)
    }

    if (filters?.userId) {
      result = result.filter(r => r.userId === filters.userId)
    }

    if (filters?.status) {
      result = result.filter(r => r.status === filters.status)
    }

    if (filters?.isVerified !== undefined) {
      result = result.filter(r => r.isVerified === filters.isVerified)
    }

    if (filters?.minRating !== undefined) {
      result = result.filter(r => r.rating >= filters.minRating!)
    }

    // Ordenar
    result = sortItems(
      result,
      pagination?.sortBy || 'createdAt',
      pagination?.sortOrder || 'desc'
    )

    return paginate(result, pagination)
  },

  // Buscar review com relações
  async findByIdWithRelations(id: string): Promise<ReviewWithRelations | null> {
    const review = reviews.find(r => r.id === id)
    if (!review) return null

    const product = await productRepository.findById(review.productId)

    return {
      ...review,
      product: product || undefined,
    }
  },

  // Reviews de um produto (aprovadas)
  async getByProduct(productId: string, limit?: number): Promise<Review[]> {
    let result = reviews
      .filter(r => r.productId === productId && r.status === 'approved')
      .sort((a, b) => b.helpfulCount - a.helpfulCount)

    if (limit) {
      result = result.slice(0, limit)
    }

    return result
  },

  // Reviews verificadas de um produto
  async getVerifiedByProduct(productId: string, limit?: number): Promise<Review[]> {
    let result = reviews
      .filter(r => 
        r.productId === productId && 
        r.status === 'approved' && 
        r.isVerified
      )
      .sort((a, b) => b.helpfulCount - a.helpfulCount)

    if (limit) {
      result = result.slice(0, limit)
    }

    return result
  },

  // Calcular métricas de reviews de um produto
  async getProductReviewStats(productId: string): Promise<{
    averageRating: number
    totalReviews: number
    ratingDistribution: Record<number, number>
    verifiedCount: number
  }> {
    const productReviews = reviews.filter(
      r => r.productId === productId && r.status === 'approved'
    )

    if (productReviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        verifiedCount: 0,
      }
    }

    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0)
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    
    productReviews.forEach(r => {
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1
    })

    return {
      averageRating: Math.round((totalRating / productReviews.length) * 10) / 10,
      totalReviews: productReviews.length,
      ratingDistribution,
      verifiedCount: productReviews.filter(r => r.isVerified).length,
    }
  },

  // Criar nova review
  async create(data: {
    productId: string
    userId?: string
    authorName: string
    authorEmail?: string
    rating: number
    title: string
    content: string
    pros?: string[]
    cons?: string[]
    images?: string[]
    purchaseSource?: string
  }): Promise<Review> {
    const review: Review = {
      id: generateId('review'),
      ...data,
      isVerified: false,
      helpfulCount: 0,
      notHelpfulCount: 0,
      status: 'pending', // Requer moderação
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    reviews.push(review)

    return review
  },

  // Incrementar contador de "útil"
  async incrementHelpful(reviewId: string): Promise<void> {
    const review = reviews.find(r => r.id === reviewId)
    if (review) {
      review.helpfulCount++
      review.updatedAt = new Date()
    }
  },

  // Incrementar contador de "não útil"
  async incrementNotHelpful(reviewId: string): Promise<void> {
    const review = reviews.find(r => r.id === reviewId)
    if (review) {
      review.notHelpfulCount++
      review.updatedAt = new Date()
    }
  },

  // Aprovar review
  async approve(reviewId: string, moderatorId?: string): Promise<void> {
    const review = reviews.find(r => r.id === reviewId)
    if (review) {
      review.status = 'approved'
      review.moderatedAt = new Date()
      review.moderatedBy = moderatorId
      review.updatedAt = new Date()

      // Atualizar métricas do produto
      const stats = await this.getProductReviewStats(review.productId)
      await productRepository.updateReviewMetrics(
        review.productId,
        stats.averageRating,
        stats.totalReviews
      )
    }
  },

  // Rejeitar review
  async reject(reviewId: string, moderatorId?: string): Promise<void> {
    const review = reviews.find(r => r.id === reviewId)
    if (review) {
      review.status = 'rejected'
      review.moderatedAt = new Date()
      review.moderatedBy = moderatorId
      review.updatedAt = new Date()
    }
  },

  // Marcar como verificada
  async markAsVerified(reviewId: string): Promise<void> {
    const review = reviews.find(r => r.id === reviewId)
    if (review) {
      review.isVerified = true
      review.updatedAt = new Date()
    }
  },

  // Reviews recentes (para homepage)
  async getRecentReviews(limit = 5): Promise<ReviewWithRelations[]> {
    const recent = reviews
      .filter(r => r.status === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)

    return Promise.all(
      recent.map(async r => {
        const product = await productRepository.findById(r.productId)
        return { ...r, product: product || undefined }
      })
    )
  },
}
