import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("configuracoes_tema")
    .select("*")
    .limit(1)
    .single()

  if (error) {
    // Se não existir, retornar valores padrão
    return NextResponse.json({
      cor_primaria: "#000000",
      cor_fundo: "#FFFFFF",
      fonte_padrao: "Inter",
      layout_produtos: "grid",
    })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_logged_in")?.value === "true"

  if (!isLoggedIn) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const supabase = await createClient()
  const body = await request.json()

  // Verificar se já existe uma configuração
  const { data: existing } = await supabase
    .from("configuracoes_tema")
    .select("id")
    .limit(1)
    .single()

  if (existing) {
    // Atualizar
    const { data, error } = await supabase
      .from("configuracoes_tema")
      .update({
        cor_primaria: body.cor_primaria,
        cor_fundo: body.cor_fundo,
        fonte_padrao: body.fonte_padrao,
        layout_produtos: body.layout_produtos,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } else {
    // Inserir
    const { data, error } = await supabase
      .from("configuracoes_tema")
      .insert({
        cor_primaria: body.cor_primaria,
        cor_fundo: body.cor_fundo,
        fonte_padrao: body.fonte_padrao,
        layout_produtos: body.layout_produtos,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  }
}
