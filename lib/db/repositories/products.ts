// ===========================================
// Product Repository
// ===========================================

import type { Product, ProductWithRelations, ProductFilters, PaginationParams, PaginatedResult } from '../schema'
import { products as seedProducts } from '../seed'
import { paginate, sortItems } from './base'
import { categoryRepository } from './categories'
import { productLinkRepository } from './product-links'
import { storeRepository } from './stores'

// In-memory store (substituir por DB real)
let products = [...seedProducts]

export const productRepository = {
  async findById(id: string): Promise<Product | null> {
    return products.find(p => p.id === id) || null
  },

  async findBySlug(slug: string): Promise<Product | null> {
    return products.find(p => p.slug === slug) || null
  },

  async findAll(
    filters?: ProductFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Product>> {
    let result = [...products]

    // Aplicar filtros
    if (filters?.status) {
      result = result.filter(p => p.status === filters.status)
    }

    if (filters?.categoryId) {
      result = result.filter(p => p.categoryId === filters.categoryId)
    }

    if (filters?.categorySlug) {
      result = result.filter(p => {
        // Buscar categoria pelo slug de forma síncrona
        const category = seedProducts.find(sp => sp.id === p.id)
        return category !== undefined
      })
    }

    if (filters?.isFeatured !== undefined) {
      result = result.filter(p => p.isFeatured === filters.isFeatured)
    }

    if (filters?.isTopRated !== undefined) {
      result = result.filter(p => p.isTopRated === filters.isTopRated)
    }

    if (filters?.minRating !== undefined) {
      result = result.filter(p => p.rating >= filters.minRating!)
    }

    if (filters?.minPrice !== undefined) {
      result = result.filter(p => (p.currentPrice || 0) >= filters.minPrice!)
    }

    if (filters?.maxPrice !== undefined) {
      result = result.filter(p => (p.currentPrice || 0) <= filters.maxPrice!)
    }

    if (filters?.tags && filters.tags.length > 0) {
      result = result.filter(p =>
        filters.tags!.some(tag => p.tags.includes(tag))
      )
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.shortDescription.toLowerCase().includes(search) ||
        p.tags.some(t => t.toLowerCase().includes(search))
      )
    }

    // Ordenar
    const sortBy = pagination?.sortBy || 'createdAt'
    const sortOrder = pagination?.sortOrder || 'desc'
    result = sortItems(result, sortBy, sortOrder)

    return paginate(result, pagination)
  },

  // Buscar produto com todas as relações
  async findByIdWithRelations(id: string): Promise<ProductWithRelations | null> {
    const product = products.find(p => p.id === id)
    if (!product) return null

    return this.enrichProduct(product)
  },

  async findBySlugWithRelations(slug: string): Promise<ProductWithRelations | null> {
    const product = products.find(p => p.slug === slug)
    if (!product) return null

    return this.enrichProduct(product)
  },

  // Adicionar dados relacionados ao produto
  async enrichProduct(product: Product): Promise<ProductWithRelations> {
    const [category, links] = await Promise.all([
      categoryRepository.findById(product.categoryId),
      productLinkRepository.getActiveLinksForProduct(product.id),
    ])

    const activeLink = links[0] // O primeiro é o de maior prioridade
    let store = null
    
    if (activeLink) {
      store = await storeRepository.findById(activeLink.storeId)
    }

    return {
      ...product,
      category: category || undefined,
      links,
      activeLink,
      store: store || undefined,
    }
  },

  // Produtos em destaque
  async getFeaturedProducts(limit = 6): Promise<ProductWithRelations[]> {
    const featured = products
      .filter(p => p.status === 'active' && p.isFeatured)
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, limit)

    return Promise.all(featured.map(p => this.enrichProduct(p)))
  },

  // Produtos mais bem avaliados
  async getTopRatedProducts(limit = 6): Promise<ProductWithRelations[]> {
    const topRated = products
      .filter(p => p.status === 'active' && p.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
      .slice(0, limit)

    return Promise.all(topRated.map(p => this.enrichProduct(p)))
  },

  // Produtos relacionados (mesma categoria)
  async getRelatedProducts(productId: string, limit = 4): Promise<ProductWithRelations[]> {
    const product = products.find(p => p.id === productId)
    if (!product) return []

    const related = products
      .filter(p => 
        p.id !== productId && 
        p.status === 'active' && 
        p.categoryId === product.categoryId
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)

    return Promise.all(related.map(p => this.enrichProduct(p)))
  },

  // Produtos por categoria
  async getByCategory(categoryId: string, limit?: number): Promise<ProductWithRelations[]> {
    let result = products
      .filter(p => p.status === 'active' && p.categoryId === categoryId)
      .sort((a, b) => b.rating - a.rating)

    if (limit) {
      result = result.slice(0, limit)
    }

    return Promise.all(result.map(p => this.enrichProduct(p)))
  },

  // Incrementar contador de cliques
  async incrementClickCount(productId: string): Promise<void> {
    const product = products.find(p => p.id === productId)
    if (product) {
      product.clickCount++
      product.updatedAt = new Date()
    }
  },

  // Atualizar métricas de review
  async updateReviewMetrics(productId: string, rating: number, reviewCount: number): Promise<void> {
    const product = products.find(p => p.id === productId)
    if (product) {
      product.rating = rating
      product.reviewCount = reviewCount
      product.updatedAt = new Date()
    }
  },

  // Atualizar preço do produto (baseado no melhor link)
  async updatePriceFromLinks(productId: string): Promise<void> {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const links = await productLinkRepository.getActiveLinksForProduct(productId)
    if (links.length > 0) {
      const bestLink = links[0]
      product.currentPrice = bestLink.price
      product.originalPrice = bestLink.originalPrice
      product.discount = bestLink.discount
      product.updatedAt = new Date()
    }
  },
}
