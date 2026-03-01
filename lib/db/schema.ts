// ===========================================
// SGC - Database Schema
// Arquitetura preparada para SaaS
// ===========================================

// ===========================================
// ENUMS
// ===========================================

export type ProductStatus = 'active' | 'inactive' | 'draft' | 'archived'
export type LinkStatus = 'active' | 'inactive' | 'expired' | 'broken'
export type CouponStatus = 'active' | 'inactive' | 'expired' | 'used'
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged'

// ===========================================
// STORE - Lojas parceiras
// ===========================================

export interface Store {
  id: string
  name: string
  slug: string
  logoUrl?: string
  websiteUrl: string
  affiliateProgram: string // Ex: "Amazon Associates", "Shopee Affiliates"
  commissionRate?: number // Percentual de comissão
  isActive: boolean
  priority: number // Prioridade para exibição
  createdAt: Date
  updatedAt: Date
}

// ===========================================
// CATEGORY - Categorias de produtos
// ===========================================

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon: string // Nome do ícone (Lucide)
  imageUrl?: string
  parentId?: string // Para subcategorias
  productCount: number // Desnormalizado para performance
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

// ===========================================
// PRODUCT - Produtos (entidade central)
// ===========================================

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  shortDescription: string
  
  // Imagens
  imageUrl: string | string[]
  images: string[]
  
  // Categorização
  categoryId: string
  tags: string[]
  
  // Análise editorial
  pros: string[]
  cons: string[]
  verdict?: string // Conclusão da análise
  
  // Métricas (desnormalizadas para performance)
  rating: number // Média calculada das reviews
  reviewCount: number
  clickCount: number
  
  // Preço referência (do melhor link ativo)
  currentPrice?: number
  originalPrice?: number
  discount?: number
  
  // SEO
  metaTitle?: string
  metaDescription?: string
  
  // Status e controle
  status: ProductStatus
  isFeatured: boolean
  isTopRated: boolean
  
  // Timestamps
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ===========================================
// PRODUCT_LINK - Links de afiliados
// Separados do produto para permitir atualização
// sem afetar reviews e métricas
// ===========================================

export interface ProductLink {
  id: string
  productId: string
  storeId: string
  
  // Link
  url: string
  shortCode?: string // Para /r/[shortCode]
  
  // Preço neste link específico
  price: number
  originalPrice?: number
  discount?: number
  currency: string
  
  // Status e controle
  status: LinkStatus
  priority: number // Menor = maior prioridade
  
  // Datas
  expiresAt?: Date
  lastCheckedAt?: Date
  
  // Métricas
  clickCount: number
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// ===========================================
// COUPON - Cupons de desconto
// ===========================================

export interface Coupon {
  id: string
  code: string
  
  // Associações
  storeId: string
  productId?: string // Opcional - cupom específico de produto
  categoryId?: string // Opcional - cupom de categoria
  
  // Detalhes
  title: string
  description: string
  discountType: 'percentage' | 'fixed' | 'freeShipping' | 'other'
  discountValue?: number
  discountText: string // Ex: "10% OFF", "Frete Grátis"
  
  // Condições
  minPurchase?: number
  maxDiscount?: number
  
  // Status e verificação
  status: CouponStatus
  isVerified: boolean
  isExclusive: boolean // Exclusivo SGC
  
  // Métricas
  usageCount: number
  successRate?: number // % de sucesso reportado
  
  // Datas
  startsAt?: Date
  expiresAt?: Date
  lastVerifiedAt?: Date
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// ===========================================
// REVIEW - Avaliações de usuários
// Vinculadas ao productId interno
// ===========================================

export interface Review {
  id: string
  productId: string
  userId?: string // Opcional até implementar auth
  
  // Autor
  authorName: string
  authorEmail?: string
  authorAvatar?: string
  
  // Conteúdo
  rating: number // 1-5
  title: string
  content: string
  pros?: string[]
  cons?: string[]
  
  // Mídia
  images?: string[]
  
  // Verificação
  isVerified: boolean // Compra verificada
  purchaseSource?: string // Loja onde comprou
  
  // Métricas de utilidade
  helpfulCount: number
  notHelpfulCount: number
  
  // Moderação
  status: ReviewStatus
  moderatedAt?: Date
  moderatedBy?: string
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// ===========================================
// CLICK_TRACKING - Rastreamento de cliques
// ===========================================

export interface ClickTracking {
  id: string
  productLinkId: string
  productId: string
  storeId: string
  
  // Dados do clique
  ipHash?: string // Hash para privacidade
  userAgent?: string
  referer?: string
  
  // Geolocalização (aproximada)
  country?: string
  region?: string
  
  // UTM params
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  
  // Timestamp
  clickedAt: Date
}

// ===========================================
// TIPOS AUXILIARES
// ===========================================

// Produto com dados relacionados
export interface ProductWithRelations extends Product {
  category?: Category
  links?: ProductLink[]
  reviews?: Review[]
  activeLink?: ProductLink // Melhor link ativo
  store?: Store // Loja do melhor link
}

// Cupom com dados relacionados
export interface CouponWithRelations extends Coupon {
  store?: Store
  product?: Product
  category?: Category
}

// Review com dados relacionados
export interface ReviewWithRelations extends Review {
  product?: Product
}

// ===========================================
// TIPOS PARA QUERIES
// ===========================================

export interface ProductFilters {
  categoryId?: string
  categorySlug?: string
  status?: ProductStatus
  isFeatured?: boolean
  isTopRated?: boolean
  minRating?: number
  minPrice?: number
  maxPrice?: number
  storeId?: string
  tags?: string[]
  search?: string
}

export interface CouponFilters {
  storeId?: string
  storeSlug?: string
  categoryId?: string
  productId?: string
  status?: CouponStatus
  isVerified?: boolean
  isExclusive?: boolean
  notExpired?: boolean
}

export interface ReviewFilters {
  productId?: string
  userId?: string
  status?: ReviewStatus
  isVerified?: boolean
  minRating?: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
