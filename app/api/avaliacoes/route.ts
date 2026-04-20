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

// POST - Enviar nova avaliação
export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const body = await request.json()

    // Apenas nota e comentário são obrigatórios
    if (!body.produto_id || !body.nota || !body.comentario?.trim()) {
      return NextResponse.json({ error: "Campos obrigatórios: nota e comentário" }, { status: 400 })
    }

    if (body.nota < 1 || body.nota > 5) {
      return NextResponse.json({ error: "Nota deve ser entre 1 e 5" }, { status: 400 })
    }

    // Se nome não fornecido, usar "Usuário SGC"
    const nomeUsuario = body.nome_usuario?.trim() || "Usuário SGC"

    const { data, error } = await supabase
      .from("avaliacoes")
      .insert({
        produto_id: body.produto_id,
        nome_usuario: nomeUsuario,
        email_usuario: body.rede_social || null, // Usar campo rede_social no lugar de email
        nota: body.nota,
        comentario: body.comentario,
        aprovado: false, // Aguardando moderação
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Avaliação enviada! Aguardando aprovação.",
      data 
    })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
