import { createClient } from './server'

interface LojaSupabase {
  id: string
  nome: string
  icone: string | null
}

interface Store {
  id: string
  name: string
  slug: string
  icon?: string
  websiteUrl: string
  affiliateProgram: string
  isActive: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}

function mapLojaToStore(loja: LojaSupabase): Store {
  return {
    id: loja.id,
    name: loja.nome,
    slug: loja.id,
    icon: loja.icone || undefined,
    websiteUrl: '',
    affiliateProgram: '',
    isActive: true,
    priority: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export const supabaseStoreRepository = {
  async getAllStores(): Promise<Store[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('lojas')
      .select('*')
      .order('nome', { ascending: true })
    
    if (error) {
      console.error('[v0] Erro ao buscar lojas:', error)
      return []
    }

    return (data || []).map(mapLojaToStore)
  },

  async getStoreById(id: string): Promise<Store | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('lojas')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      return null
    }

    return mapLojaToStore(data)
  },
}
