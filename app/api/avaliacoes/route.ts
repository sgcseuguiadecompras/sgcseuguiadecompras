import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET - Listar avaliacoes aprovadas de um produto
export async function GET(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { searchParams } = new URL(request.url)
    const produtoId = searchParams.get("produto_id")

    if (!produtoId) {
      return NextResponse.json({ error: "produto_id obrigatorio" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("produto_id", produtoId)
      .eq("aprovado", true)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST - Enviar nova avaliacao
export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const body = await request.json()

    if (!body.produto_id || !body.nome_usuario || !body.nota) {
      return NextResponse.json({ error: "Campos obrigatorios: produto_id, nome_usuario, nota" }, { status: 400 })
    }

    if (body.nota < 1 || body.nota > 5) {
      return NextResponse.json({ error: "Nota deve ser entre 1 e 5" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("avaliacoes")
      .insert({
        produto_id: body.produto_id,
        nome_usuario: body.nome_usuario,
        email_usuario: body.email_usuario || null,
        nota: body.nota,
        comentario: body.comentario || null,
        aprovado: false, // Aguardando moderacao
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Avaliacao enviada! Aguardando aprovacao.",
      data 
    })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
