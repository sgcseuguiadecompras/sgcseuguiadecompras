import { createClient } from './server'
import type { ProdutoComRelacoes } from './types'
import type { ProductWithRelations } from '@/lib/db/schema'

// Converte produto do Supabase para o formato do app
function mapProdutoToProduct(produto: ProdutoComRelacoes): ProductWithRelations {
  // Tratar imagem como array ou string
  const getImages = (): string[] => {
    if (Array.isArray(produto.imagem)) {
      return produto.imagem.filter(img => img && img.trim() !== '')
    }
    if (typeof produto.imagem === 'string' && produto.imagem) {
      return [produto.imagem]
    }
    return []
  }
  const images = getImages()
  
  return {
    id: produto.id,
    slug: produto.id, // usar ID como slug se não existir
    name: produto.nome,
    description: produto.descricao || '',
    shortDescription: produto.descricao?.substring(0, 100) || '',
    imageUrl: images,
    images: images,
    categoryId: produto.categorias?.[0]?.id || '',
    tags: [],
    pros: [],
    cons: [],
    rating: produto.avaliacao || 0,
    reviewCount: 0,
    clickCount: 0,
    currentPrice: produto.preco,
    originalPrice: undefined,
    discount: undefined,
    status: 'active',
    isFeatured: true,
    isTopRated: (produto.avaliacao || 0) >= 4.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Relacionamentos
    category: produto.categorias?.[0] ? {
      id: produto.categorias[0].id,
      name: produto.categorias[0].nome,
      slug: produto.categorias[0].slug,
      icon: 'Package',
      productCount: 0,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } : undefined,
    store: produto.lojas ? {
      id: produto.lojas.id,
      name: produto.lojas.nome,
      slug: produto.lojas.id,
      websiteUrl: '',
      affiliateProgram: '',
      isActive: true,
      priority: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } : undefined,
    activeLink: produto.link_afiliado ? {
      id: produto.id,
      productId: produto.id,
      storeId: produto.loja_id || '',
      url: produto.link_afiliado,
      price: produto.preco,
      currency: 'BRL',
      status: 'active',
      priority: 0,
      clickCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } : undefined,
  }
}

export const supabaseProductRepository = {
  // Buscar produtos em destaque (ordenados por data de criação, mais novos primeiro)
  async getFeaturedProducts(limit = 8): Promise<ProductWithRelations[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        *,
        lojas (*),
        cupons (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('[v0] Erro ao buscar produtos:', error)
      return []
    }

    // Buscar categorias para cada produto
    const produtosComCategorias = await Promise.all(
      (data || []).map(async (produto) => {
        const { data: categoriaData } = await supabase
          .from('produto_categorias')
          .select('categorias (*)')
          .eq('produto_id', produto.id)
        
        return {
          ...produto,
          categorias: categoriaData?.map((pc: { categorias: unknown }) => pc.categorias).filter(Boolean) || [],
        } as ProdutoComRelacoes
      })
    )

    return produtosComCategorias.map(mapProdutoToProduct)
  },

  // Buscar produtos mais bem avaliados
  async getTopRatedProducts(limit = 8): Promise<ProductWithRelations[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        *,
        lojas (*),
        cupons (*)
      `)
      .gte('avaliacao', 4.5)
      .order('avaliacao', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('[v0] Erro ao buscar produtos top:', error)
      return []
    }

    // Buscar categorias para cada produto
    const produtosComCategorias = await Promise.all(
      (data || []).map(async (produto) => {
        const { data: categoriaData } = await supabase
          .from('produto_categorias')
          .select('categorias (*)')
          .eq('produto_id', produto.id)
        
        return {
          ...produto,
          categorias: categoriaData?.map((pc: { categorias: unknown }) => pc.categorias).filter(Boolean) || [],
        } as ProdutoComRelacoes
      })
    )

    return produtosComCategorias.map(mapProdutoToProduct)
  },

  // Buscar todos os produtos (ordenados por data de criação, mais novos primeiro)
  async getAllProducts(): Promise<ProductWithRelations[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        *,
        lojas (*),
        cupons (*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[v0] Erro ao buscar todos produtos:', error)
      return []
    }

    // Buscar categorias para cada produto
    const produtosComCategorias = await Promise.all(
      (data || []).map(async (produto) => {
        const { data: categoriaData } = await supabase
          .from('produto_categorias')
          .select('categorias (*)')
          .eq('produto_id', produto.id)
        
        return {
          ...produto,
          categorias: categoriaData?.map((pc: { categorias: unknown }) => pc.categorias).filter(Boolean) || [],
        } as ProdutoComRelacoes
      })
    )

    return produtosComCategorias.map(mapProdutoToProduct)
  },

  // Buscar produto por ID
  async getProductById(id: string): Promise<ProductWithRelations | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        *,
        lojas (*),
        cupons (*)
      `)
      .eq('id', id)
      .single()
    
    if (error || !data) {
      console.error('[v0] Erro ao buscar produto:', error)
      return null
    }

    // Buscar categorias
    const { data: categoriaData } = await supabase
      .from('produto_categorias')
      .select('categorias (*)')
      .eq('produto_id', data.id)
    
    const produtoComCategorias: ProdutoComRelacoes = {
      ...data,
      categorias: categoriaData?.map((pc: { categorias: unknown }) => pc.categorias).filter(Boolean) || [],
    }

    return mapProdutoToProduct(produtoComCategorias)
  },

  // Buscar produto por slug (usando ID como slug)
  async findBySlugWithRelations(slug: string): Promise<ProductWithRelations | null> {
    return this.getProductById(slug)
  },

  // Buscar produtos relacionados (mesma categoria)
  async getRelatedProducts(productId: string, limit = 4): Promise<ProductWithRelations[]> {
    const supabase = await createClient()
    
    // Primeiro, buscar a categoria do produto atual
    const { data: produtoCategorias } = await supabase
      .from('produto_categorias')
      .select('categoria_id')
      .eq('produto_id', productId)
    
    if (!produtoCategorias || produtoCategorias.length === 0) {
      return []
    }

    const categoriaIds = produtoCategorias.map(pc => pc.categoria_id)

    // Buscar outros produtos da mesma categoria
    const { data: produtosDaCategoria } = await supabase
      .from('produto_categorias')
      .select('produto_id')
      .in('categoria_id', categoriaIds)
      .neq('produto_id', productId)

    if (!produtosDaCategoria || produtosDaCategoria.length === 0) {
      return []
    }

    const produtoIds = [...new Set(produtosDaCategoria.map(pc => pc.produto_id))].slice(0, limit)

    // Buscar os produtos relacionados
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        *,
        lojas (*),
        cupons (*)
      `)
      .in('id', produtoIds)
      .limit(limit)

    if (error || !data) {
      console.error('[v0] Erro ao buscar produtos relacionados:', error)
      return []
    }

    // Buscar categorias para cada produto
    const produtosComCategorias = await Promise.all(
      data.map(async (produto) => {
        const { data: categoriaData } = await supabase
          .from('produto_categorias')
          .select('categorias (*)')
          .eq('produto_id', produto.id)
        
        return {
          ...produto,
          categorias: categoriaData?.map((pc: { categorias: unknown }) => pc.categorias).filter(Boolean) || [],
        } as ProdutoComRelacoes
      })
    )

    return produtosComCategorias.map(mapProdutoToProduct)
  },
}
