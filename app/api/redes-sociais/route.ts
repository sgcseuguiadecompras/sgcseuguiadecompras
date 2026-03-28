import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Listar redes sociais (com filtro opcional de posição)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const posicao = searchParams.get("posicao")

    let query = supabase
      .from("redes_sociais")
      .select("*")
      .order("nome")

    // Filtrar por posição se especificado
    if (posicao === "lateral") {
      query = query.or("posicao.eq.lateral,posicao.eq.ambos")
    } else if (posicao === "rodape") {
      query = query.or("posicao.eq.rodape,posicao.eq.ambos")
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
