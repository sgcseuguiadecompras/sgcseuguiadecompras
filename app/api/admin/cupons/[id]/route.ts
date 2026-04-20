import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_auth")?.value === "authenticated"
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("cupons")
    .update({
      codigo: body.codigo,
      descricao: body.descricao,
      validade: body.validade || null,
      link: body.link || null,
      loja_id: body.loja_id || null,
    })
    .eq("id", id)
    .select("*, lojas(*)")
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
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()

  // Verificar se tem produtos vinculados
  const { data: produtos } = await supabase
    .from("produtos")
    .select("id")
    .eq("cupom_id", id)
    .limit(1)

  if (produtos && produtos.length > 0) {
    return NextResponse.json(
      { error: "Este cupom esta vinculado a produtos e nao pode ser excluido" },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from("cupons")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
