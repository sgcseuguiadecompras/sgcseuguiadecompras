import { createClient } from './server'
import type { CouponWithRelations } from '@/lib/db/schema'

// Tipo para cupom com loja
type CouponWithStore = CouponWithRelations

interface LojaSupabase {
  id: string
  nome: string
  icone?: string | null
}

interface CupomSupabase {
  id: string
  codigo: string
  descricao: string | null
  validade: string | null
  link: string | null
  loja_id: string | null
  lojas: LojaSupabase | null
}

// Converte cupom do Supabase para o formato do app
function mapCupomToCoupon(cupom: CupomSupabase): CouponWithStore {
  const loja = cupom.lojas
  return {
    id: cupom.id,
    storeId: loja?.id || '',
    code: cupom.codigo,
    description: cupom.descricao || '',
    discountType: 'percentage',
    discountValue: 10, // valor padrão
    discountText: cupom.descricao || 'Desconto',
    minimumPurchase: undefined,
    maximumDiscount: undefined,
    expiresAt: cupom.validade ? new Date(cupom.validade) : undefined,
    usageLimit: undefined,
    usageCount: 0,
    isActive: true,
    isVerified: true,
    link: cupom.link || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    store: loja ? {
      id: loja.id,
      name: loja.nome,
      slug: loja.id,
      websiteUrl: '',
      affiliateProgram: '',
      isActive: true,
      priority: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } : undefined,
  }
}

export const supabaseCouponRepository = {
  // Buscar cupons ativos
  async getActiveCoupons(limit = 10): Promise<CouponWithStore[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('cupons')
      .select('*, lojas(*)')
      .or(`validade.is.null,validade.gte.${new Date().toISOString()}`)
      .limit(limit)
    
    if (error) {
      console.error('[v0] Erro ao buscar cupons:', error)
      return []
    }

    return (data || []).map((cupom) => mapCupomToCoupon(cupom as CupomSupabase))
  },

  // Buscar todos os cupons
  async getAllCoupons(): Promise<CouponWithStore[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('cupons')
      .select('*, lojas(*)')
    
    if (error) {
      console.error('[v0] Erro ao buscar todos cupons:', error)
      return []
    }

    return (data || []).map((cupom) => mapCupomToCoupon(cupom as CupomSupabase))
  },

  // Buscar cupom por ID
  async getCouponById(id: string): Promise<CouponWithStore | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('cupons')
      .select('*, lojas(*)')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      console.error('[v0] Erro ao buscar cupom:', error)
      return null
    }

    return mapCupomToCoupon(data as CupomSupabase)
  },
}
