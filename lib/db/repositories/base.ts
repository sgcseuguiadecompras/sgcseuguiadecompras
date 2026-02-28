// ===========================================
// Base Repository Interface
// Define contrato para todos os repositories
// ===========================================

import type { PaginationParams, PaginatedResult } from '../schema'

export interface BaseRepository<T, TFilters = Record<string, unknown>> {
  findById(id: string): Promise<T | null>
  findAll(filters?: TFilters, pagination?: PaginationParams): Promise<PaginatedResult<T>>
  create?(data: Partial<T>): Promise<T>
  update?(id: string, data: Partial<T>): Promise<T | null>
  delete?(id: string): Promise<boolean>
}

// Helper para paginação
export function paginate<T>(
  items: T[],
  pagination?: PaginationParams
): PaginatedResult<T> {
  const page = pagination?.page || 1
  const limit = pagination?.limit || 20
  const total = items.length
  const totalPages = Math.ceil(total / limit)
  
  const start = (page - 1) * limit
  const end = start + limit
  const data = items.slice(start, end)
  
  return {
    data,
    total,
    page,
    limit,
    totalPages,
  }
}

// Helper para ordenação
export function sortItems<T>(
  items: T[],
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] {
  if (!sortBy) return items
  
  return [...items].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[sortBy]
    const bVal = (b as Record<string, unknown>)[sortBy]
    
    if (aVal === bVal) return 0
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    
    const comparison = aVal < bVal ? -1 : 1
    return sortOrder === 'asc' ? comparison : -comparison
  })
}

// Helper para filtrar por data de expiração
export function isNotExpired(expiresAt?: Date): boolean {
  if (!expiresAt) return true
  return new Date(expiresAt) > new Date()
}

// Helper para gerar IDs
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
