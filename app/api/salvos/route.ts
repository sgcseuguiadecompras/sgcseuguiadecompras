import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Listar produtos salvos do usuario
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const usuarioId = searchParams.get("usuario_id")

  if (!usuarioId) {
    return NextResponse.json({ error: "usuario_id obrigatorio" }, { status: 400 })
  }

  const supabase = await createClient()

  // Buscar os salvos do usuario
  const { data: salvosData, error: salvosError } = await supabase
    .from("salvos")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("data_salvo", { ascending: false })

  if (salvosError) {
    console.error("[v0] Erro ao buscar salvos:", salvosError)
    return NextResponse.json({ error: salvosError.message }, { status: 500 })
  }

  if (!salvosData || salvosData.length === 0) {
    return NextResponse.json([])
  }

  // Buscar detalhes dos produtos (usando apenas colunas existentes)
  const produtoIds = salvosData.map(s => s.produto_id).filter(Boolean)
  
  const { data: produtosData, error: produtosError } = await supabase
    .from("produtos")
    .select("id, nome, descricao, preco, avaliacao, imagem, link_afiliado, lojas(id, nome, icone)")
    .in("id", produtoIds)

  if (produtosError) {
    console.error("[v0] Erro ao buscar produtos:", produtosError)
    return NextResponse.json({ error: produtosError.message }, { status: 500 })
  }

  // Combinar os dados
  const result = salvosData.map(salvo => ({
    ...salvo,
    produtos: produtosData?.find(p => p.id === salvo.produto_id) || null
  }))

  return NextResponse.json(result)
}

// POST - Salvar produto
export async function POST(request: Request) {
  const body = await request.json()
  const { usuario_id, produto_id, loja_id } = body

  if (!usuario_id || !produto_id) {
    return NextResponse.json({ error: "usuario_id e produto_id obrigatorios" }, { status: 400 })
  }

  const supabase = await createClient()

  // Verificar se ja esta salvo
  const { data: existente } = await supabase
    .from("salvos")
    .select("id")
    .eq("usuario_id", usuario_id)
    .eq("produto_id", produto_id)
    .single()

  if (existente) {
    return NextResponse.json({ message: "Produto ja salvo", id: existente.id })
  }

  const { data, error } = await supabase
    .from("salvos")
    .insert({
      usuario_id,
      produto_id,
      loja_id: loja_id || null,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Erro ao salvar produto:", error)
    return NextResponse.json({ error: "Erro ao salvar produto" }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE - Remover produto salvo
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const usuarioId = searchParams.get("usuario_id")
  const produtoId = searchParams.get("produto_id")

  if (!usuarioId || !produtoId) {
    return NextResponse.json({ error: "usuario_id e produto_id obrigatorios" }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("salvos")
    .delete()
    .eq("usuario_id", usuarioId)
    .eq("produto_id", produtoId)

  if (error) {
    console.error("[v0] Erro ao remover salvo:", error)
    return NextResponse.json({ error: "Erro ao remover" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
