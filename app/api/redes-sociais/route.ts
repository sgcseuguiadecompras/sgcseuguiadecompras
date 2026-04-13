import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// GET - Listar redes sociais (pública, sem autenticação)
export async function GET(request: Request) {
  try {
    // Criar cliente público sem cookies (acesso anônimo)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[v0] Variáveis de ambiente Supabase não configuradas")
      return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { searchParams } = new URL(request.url)
    const posicao = searchParams.get("posicao")

    let query = supabase
      .from("redes_sociais")
      .select("*")
      .eq("ativo", true)
      .order("ordem", { ascending: true })

    // Filtrar por posição se especificado
    if (posicao === "lateral") {
      query = query.or("posicao.eq.lateral,posicao.eq.ambos")
    } else if (posicao === "rodape") {
      query = query.or("posicao.eq.rodape,posicao.eq.ambos")
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Erro ao buscar redes sociais:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Redes sociais encontradas:", data?.length, "registros", posicao ? `(filtro: ${posicao})` : "(sem filtro)")
    
    return NextResponse.json(data || [])
  } catch (err) {
    console.error("[v0] Erro interno redes-sociais:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
