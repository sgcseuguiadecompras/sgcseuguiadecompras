// ===========================================
// Store Repository
// ===========================================

import type { Store } from '../schema'
import type { PaginationParams, PaginatedResult } from '../schema'
import { stores as seedStores } from '../seed'
import { paginate, sortItems } from './base'

// In-memory store (substituir por DB real)
let stores = [...seedStores]

export interface StoreFilters {
  isActive?: boolean
  slug?: string
  search?: string
}

export const storeRepository = {
  async findById(id: string): Promise<Store | null> {
    return stores.find(s => s.id === id) || null
  },

  async findBySlug(slug: string): Promise<Store | null> {
    return stores.find(s => s.slug === slug) || null
  },

  async findAll(
    filters?: StoreFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Store>> {
    let result = [...stores]

    // Aplicar filtros
    if (filters?.isActive !== undefined) {
      result = result.filter(s => s.isActive === filters.isActive)
    }

    if (filters?.slug) {
      result = result.filter(s => s.slug === filters.slug)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(s => 
        s.name.toLowerCase().includes(search)
      )
    }

    // Ordenar
    result = sortItems(
      result,
      pagination?.sortBy || 'priority',
      pagination?.sortOrder || 'asc'
    )

    return paginate(result, pagination)
  },

  async getActiveStores(): Promise<Store[]> {
    return stores
      .filter(s => s.isActive)
      .sort((a, b) => a.priority - b.priority)
  },
}
