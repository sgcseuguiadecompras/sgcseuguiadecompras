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
    slug: produto.slug || produto.id, // usar slug real ou ID como fallback
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
    originalPrice: produto.preco_original || undefined,
    discount: produto.preco_original && produto.preco_original > produto.preco 
      ? Math.round((1 - produto.preco / produto.preco_original) * 100) 
      : undefined,
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

  // Buscar produto por slug
  async findBySlugWithRelations(slug: string): Promise<ProductWithRelations | null> {
    const supabase = await createClient()
    
    // Primeiro tentar buscar pelo slug real
    let { data, error } = await supabase
      .from('produtos')
      .select(`
        *,
        lojas (*),
        cupons (*)
      `)
      .eq('slug', slug)
      .single()
    
    // Se não encontrar pelo slug, tenta buscar pelo ID (compatibilidade com URLs antigas)
    if (error || !data) {
      const result = await supabase
        .from('produtos')
        .select(`
          *,
          lojas (*),
          cupons (*)
        `)
        .eq('id', slug)
        .single()
      
      data = result.data
      error = result.error
    }
    
    if (error || !data) {
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

  // Buscar produtos por categoria (slug)
  async getProductsByCategory(categorySlug: string): Promise<ProductWithRelations[]> {
    const supabase = await createClient()
    
    // Primeiro, buscar a categoria pelo slug
    const { data: categoria, error: catError } = await supabase
      .from('categorias')
      .select('id, nome, slug')
      .eq('slug', categorySlug)
      .single()
    
    if (catError || !categoria) {
      console.error('[v0] Categoria não encontrada:', categorySlug)
      return []
    }

    // Buscar os IDs dos produtos desta categoria
    const { data: produtoCategorias } = await supabase
      .from('produto_categorias')
      .select('produto_id')
      .eq('categoria_id', categoria.id)

    if (!produtoCategorias || produtoCategorias.length === 0) {
      return []
    }

    const produtoIds = produtoCategorias.map(pc => pc.produto_id)

    // Buscar os produtos
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        *,
        lojas (*),
        cupons (*)
      `)
      .in('id', produtoIds)
      .order('created_at', { ascending: false })

    if (error || !data) {
      console.error('[v0] Erro ao buscar produtos da categoria:', error)
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

  // Buscar categoria por slug
  async getCategoryBySlug(slug: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return {
      id: data.id,
      name: data.nome,
      slug: data.slug,
      icon: 'Package',
      imageUrl: data.icone || undefined,
    }
  },
}
