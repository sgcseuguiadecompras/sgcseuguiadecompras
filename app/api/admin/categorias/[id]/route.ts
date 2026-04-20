import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_auth")?.value === "authenticated"
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
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

  const slug = generateSlug(body.nome)

  const { data, error } = await supabase
    .from("categorias")
    .update({
      nome: body.nome,
      slug: slug,
      icone: body.icone || null,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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

  // Verificar se há produtos vinculados
  const { data: produtos } = await supabase
    .from("produto_categorias")
    .select("produto_id")
    .eq("categoria_id", id)
    .limit(1)

  if (produtos && produtos.length > 0) {
    return NextResponse.json(
      { error: "Não é possível excluir: há produtos vinculados a esta categoria" },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from("categorias")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
