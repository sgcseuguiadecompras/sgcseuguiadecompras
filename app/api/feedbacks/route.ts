import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Listar feedbacks (para admin)
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("feedbacks")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST - Criar feedback
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { mensagem, usuario_id } = body

    if (!mensagem || mensagem.trim() === "") {
      return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("feedbacks")
      .insert({
        mensagem: mensagem.trim(),
        usuario_id: usuario_id || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
