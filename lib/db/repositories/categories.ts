// ===========================================
// Category Repository
// ===========================================

import type { Category } from '../schema'
import type { PaginationParams, PaginatedResult } from '../schema'
import { categories as seedCategories } from '../seed'
import { paginate, sortItems } from './base'

// In-memory store (substituir por DB real)
let categories = [...seedCategories]

export interface CategoryFilters {
  isActive?: boolean
  slug?: string
  parentId?: string
  search?: string
}

export const categoryRepository = {
  async findById(id: string): Promise<Category | null> {
    return categories.find(c => c.id === id) || null
  },

  async findBySlug(slug: string): Promise<Category | null> {
    return categories.find(c => c.slug === slug) || null
  },

  async findAll(
    filters?: CategoryFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Category>> {
    let result = [...categories]

    // Aplicar filtros
    if (filters?.isActive !== undefined) {
      result = result.filter(c => c.isActive === filters.isActive)
    }

    if (filters?.slug) {
      result = result.filter(c => c.slug === filters.slug)
    }

    if (filters?.parentId !== undefined) {
      result = result.filter(c => c.parentId === filters.parentId)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.description?.toLowerCase().includes(search)
      )
    }

    // Ordenar
    result = sortItems(
      result,
      pagination?.sortBy || 'sortOrder',
      pagination?.sortOrder || 'asc'
    )

    return paginate(result, pagination)
  },

  async getActiveCategories(): Promise<Category[]> {
    return categories
      .filter(c => c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },

  async getRootCategories(): Promise<Category[]> {
    return categories
      .filter(c => c.isActive && !c.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },

  async getSubcategories(parentId: string): Promise<Category[]> {
    return categories
      .filter(c => c.isActive && c.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },

  // Atualizar contagem de produtos (chamado quando produto é criado/deletado)
  async updateProductCount(categoryId: string, delta: number): Promise<void> {
    const category = categories.find(c => c.id === categoryId)
    if (category) {
      category.productCount = Math.max(0, category.productCount + delta)
      category.updatedAt = new Date()
    }
  },
}
