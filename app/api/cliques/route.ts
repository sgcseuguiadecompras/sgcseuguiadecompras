import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { produto_id, cupom_id } = body

    // Registrar clique
    const { data: clickData, error: clickError } = await supabase
      .from("cliques")
      .insert({
        produto_id: produto_id || null,
      })
      .select()

    if (clickError) {
      console.error("[v0] Erro ao registrar clique:", clickError)
      return NextResponse.json({ error: clickError.message }, { status: 500 })
    }
    
    console.log("[v0] Clique registrado:", clickData)

    // Se houver produto e cupom, calcular economia
    if (produto_id && cupom_id) {
      // Buscar dados do produto
      const { data: produto } = await supabase
        .from("produtos")
        .select("preco")
        .eq("id", produto_id)
        .single()

      // Buscar dados do cupom
      const { data: cupom } = await supabase
        .from("cupons")
        .select("descricao")
        .eq("id", cupom_id)
        .single()

      if (produto && cupom && produto.preco) {
        // Tentar extrair percentual do desconto da descrição (ex: "10% OFF", "20% de desconto")
        const percentMatch = cupom.descricao?.match(/(\d+)%/)
        if (percentMatch) {
          const percentual = parseInt(percentMatch[1])
          const valorEconomia = (produto.preco * percentual) / 100

          // Registrar economia
          const { error: economiaError } = await supabase
            .from("economia")
            .insert({
              produto_id,
              cupom_id,
              valor_economia: valorEconomia,
            })

          if (economiaError) {
            console.error("[v0] Erro ao registrar economia:", economiaError)
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Erro na API de cliques:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
