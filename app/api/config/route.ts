import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Cliente público sem autenticação
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET - Buscar configuração por chave
export async function GET(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { searchParams } = new URL(request.url)
    const chave = searchParams.get("chave")

    if (chave) {
      const { data, error } = await supabase
        .from("configuracoes_site")
        .select("*")
        .eq("chave", chave)
        .single()

      if (error) {
        // Retornar valor padrão se não encontrar
        if (chave === "mensagem_compartilhar") {
          return NextResponse.json({ 
            chave: "mensagem_compartilhar", 
            valor: "Confira as melhores ofertas e cupons no SGC - Seu Guia de Compras!" 
          })
        }
        return NextResponse.json({ error: error.message }, { status: 404 })
      }

      return NextResponse.json(data)
    }

    // Retornar todas as configurações
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
