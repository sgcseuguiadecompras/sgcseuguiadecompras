import { createClient } from './server'
import type { CouponWithStore } from '@/lib/db/schema'

interface CupomSupabase {
  id: string
  codigo: string
  descricao: string | null
  validade: string | null
}

// Converte cupom do Supabase para o formato do app
function mapCupomToCoupon(cupom: CupomSupabase, loja?: { id: string; nome: string } | null): CouponWithStore {
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
      .select('*')
      .or(`validade.is.null,validade.gte.${new Date().toISOString()}`)
      .limit(limit)
    
    if (error) {
      console.error('[v0] Erro ao buscar cupons:', error)
      return []
    }

    // Buscar lojas que têm produtos com esses cupons
    const cuponsComLojas = await Promise.all(
      (data || []).map(async (cupom) => {
        const { data: produtoData } = await supabase
          .from('produtos')
          .select('lojas (*)')
          .eq('cupom_id', cupom.id)
          .limit(1)
          .single()
        
        const loja = produtoData?.lojas as { id: string; nome: string } | null
        return mapCupomToCoupon(cupom, loja)
      })
    )

    return cuponsComLojas
  },

  // Buscar todos os cupons
  async getAllCoupons(): Promise<CouponWithStore[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('cupons')
      .select('*')
    
    if (error) {
      console.error('[v0] Erro ao buscar todos cupons:', error)
      return []
    }

    const cuponsComLojas = await Promise.all(
      (data || []).map(async (cupom) => {
        const { data: produtoData } = await supabase
          .from('produtos')
          .select('lojas (*)')
          .eq('cupom_id', cupom.id)
          .limit(1)
          .single()
        
        const loja = produtoData?.lojas as { id: string; nome: string } | null
        return mapCupomToCoupon(cupom, loja)
      })
    )

    return cuponsComLojas
  },

  // Buscar cupom por ID
  async getCouponById(id: string): Promise<CouponWithStore | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('cupons')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      console.error('[v0] Erro ao buscar cupom:', error)
      return null
    }

    const { data: produtoData } = await supabase
      .from('produtos')
      .select('lojas (*)')
      .eq('cupom_id', data.id)
      .limit(1)
      .single()
    
    const loja = produtoData?.lojas as { id: string; nome: string } | null
    return mapCupomToCoupon(data, loja)
  },
}
