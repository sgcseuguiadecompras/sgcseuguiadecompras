import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_auth")?.value === "authenticated"
}

// GET - Buscar todas as configurações
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("configuracoes_site")
      .select("*")
      .order("chave")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST - Criar ou atualizar configuração
export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const body = await request.json()

    const { chave, valor, descricao } = body

    if (!chave) {
      return NextResponse.json({ error: "Chave é obrigatória" }, { status: 400 })
    }

    // Upsert - inserir ou atualizar
    const { data, error } = await supabase
      .from("configuracoes_site")
      .upsert(
        { 
          chave, 
          valor, 
          descricao,
          updated_at: new Date().toISOString() 
        },
        { onConflict: "chave" }
      )
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
