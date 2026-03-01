import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "authenticated"
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
    .from("lojas")
    .update({
      nome: body.nome,
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
    .from("produtos")
    .select("id")
    .eq("loja_id", id)
    .limit(1)

  if (produtos && produtos.length > 0) {
    return NextResponse.json(
      { error: "Não é possível excluir: há produtos vinculados a esta loja" },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from("lojas")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
