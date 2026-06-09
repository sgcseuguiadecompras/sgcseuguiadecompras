import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET - Listar posts publicados (público)
export async function GET(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get("categoria")
    const destaque = searchParams.get("destaque")
    const limit = searchParams.get("limit")

    let query = supabase
      .from("posts")
      .select("id, titulo, slug, resumo, imagem_capa, autor, categoria, tags, views, created_at")
      .eq("publicado", true)
      .order("created_at", { ascending: false })

    if (categoria) {
      query = query.eq("categoria", categoria)
    }

    if (destaque === "true") {
      query = query.eq("destaque", true)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
