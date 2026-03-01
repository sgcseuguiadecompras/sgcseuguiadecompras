import { createClient } from './server'
import type { Category } from '@/lib/db/schema'

interface CategoriaSupabase {
  id: string
  nome: string
  slug: string
}

// Mapeamento de categorias para ícones
const categoryIcons: Record<string, string> = {
  'eletronicos': 'Smartphone',
  'casa-cozinha': 'Home',
  'moda': 'Shirt',
  'beleza': 'Sparkles',
  'esportes': 'Dumbbell',
  'livros': 'BookOpen',
  'games': 'Gamepad2',
  'automotivo': 'Car',
}

// Converte categoria do Supabase para o formato do app
function mapCategoriaToCategory(categoria: CategoriaSupabase, productCount: number): Category {
  return {
    id: categoria.id,
    name: categoria.nome,
    slug: categoria.slug,
    icon: categoryIcons[categoria.slug] || 'Package',
    productCount,
    isActive: true,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export const supabaseCategoryRepository = {
  // Buscar categorias ativas
  async getActiveCategories(): Promise<Category[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
    
    if (error) {
      console.error('[v0] Erro ao buscar categorias:', error)
      return []
    }

    // Contar produtos por categoria
    const categoriasComContagem = await Promise.all(
      (data || []).map(async (categoria) => {
        const { count } = await supabase
          .from('produto_categorias')
          .select('*', { count: 'exact', head: true })
          .eq('categoria_id', categoria.id)
        
        return mapCategoriaToCategory(categoria, count || 0)
      })
    )

    return categoriasComContagem
  },

  // Buscar categoria por slug
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error || !data) {
      console.error('[v0] Erro ao buscar categoria:', error)
      return null
    }

    const { count } = await supabase
      .from('produto_categorias')
      .select('*', { count: 'exact', head: true })
      .eq('categoria_id', data.id)

    return mapCategoriaToCategory(data, count || 0)
  },

  // Buscar todas as categorias
  async getAllCategories(): Promise<Category[]> {
    return this.getActiveCategories()
  },
}
