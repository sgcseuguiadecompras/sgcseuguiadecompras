import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query || query.trim().length < 2) {
    return NextResponse.json([])
  }

  const supabase = await createClient()

  const { data: produtos, error } = await supabase
    .from("produtos")
    .select(`
      id,
      nome,
      descricao,
      imagem,
      preco,
      avaliacao,
      link_afiliado,
      lojas (id, nome, icone),
      cupons (id, codigo, descricao)
    `)
    .or(`nome.ilike.%${query}%,descricao.ilike.%${query}%`)
    .order("avaliacao", { ascending: false })
    .limit(20)

  if (error) {
    console.error("[v0] Erro na busca:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Mapear para o formato esperado pelo frontend
  const results = (produtos || []).map(produto => ({
    id: produto.id,
    name: produto.nome,
    slug: produto.id,
    description: produto.descricao,
    imageUrl: produto.imagem,
    currentPrice: Number(produto.preco),
    rating: Number(produto.avaliacao) || 0,
    store: produto.lojas ? {
      id: produto.lojas.id,
      name: produto.lojas.nome,
      logo: produto.lojas.icone,
    } : null,
    coupon: produto.cupons ? {
      id: produto.cupons.id,
      code: produto.cupons.codigo,
      description: produto.cupons.descricao,
    } : null,
    activeLink: produto.link_afiliado ? {
      url: produto.link_afiliado,
    } : null,
  }))

  return NextResponse.json(results)
}
