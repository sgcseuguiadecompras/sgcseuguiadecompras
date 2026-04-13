import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_auth")?.value === "authenticated"
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("produtos")
    .update({
      nome: body.nome,
      descricao: body.descricao,
      imagem: body.imagem,
      preco: body.preco,
      preco_original: body.preco_original || null,
      avaliacao: body.avaliacao,
      loja_id: body.loja_id || null,
      cupom_id: body.cupom_id || null,
      link_afiliado: body.link_afiliado,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Atualizar categorias: remover antigas e inserir novas
  await supabase.from("produto_categorias").delete().eq("produto_id", id)

  if (body.categoria_ids && body.categoria_ids.length > 0) {
    const categoriasInsert = body.categoria_ids.map((catId: string) => ({
      produto_id: id,
      categoria_id: catId,
    }))

    await supabase.from("produto_categorias").insert(categoriasInsert)
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase
    .from("produtos")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
