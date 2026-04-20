import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_auth")?.value === "authenticated"
}

// PUT - Atualizar post
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("posts")
      .update({
        titulo: body.titulo,
        slug: body.slug,
        resumo: body.resumo || null,
        conteudo: body.conteudo,
        imagem_capa: body.imagem_capa || null,
        autor: body.autor || "SGC",
        categoria: body.categoria || "Guia de Compra",
        tags: body.tags || [],
        publicado: body.publicado,
        destaque: body.destaque,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE - Excluir post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
