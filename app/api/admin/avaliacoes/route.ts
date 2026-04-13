import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Listar todas avaliacoes (admin)
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("avaliacoes")
      .select(`
        *,
        produtos:produto_id (id, nome)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
