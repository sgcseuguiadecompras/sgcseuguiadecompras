import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_logged_in")?.value === "true"

  if (!isLoggedIn) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { nome, icone, url, posicao, ativo, ordem } = body

    const { data, error } = await supabase
      .from("redes_sociais")
      .update({
        nome,
        icone,
        url,
        posicao,
        ativo,
        ordem,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar rede social" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_logged_in")?.value === "true"

  if (!isLoggedIn) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from("redes_sociais")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir rede social" }, { status: 500 })
  }
}
