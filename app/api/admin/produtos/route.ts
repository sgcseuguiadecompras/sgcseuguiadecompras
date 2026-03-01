import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "authenticated"
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const supabase = await createClient()
  
  const { data: produtos, error } = await supabase
    .from("produtos")
    .select(`
      *,
      lojas (id, nome),
      cupons (id, codigo, descricao)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(produtos)
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("produtos")
    .insert({
      nome: body.nome,
      descricao: body.descricao,
      imagem: body.imagem,
      preco: body.preco,
      avaliacao: body.avaliacao,
      loja_id: body.loja_id || null,
      cupom_id: body.cupom_id || null,
      link_afiliado: body.link_afiliado,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
