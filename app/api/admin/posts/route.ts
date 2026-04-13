import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

async function checkAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")
  return session?.value === "authenticated"
}

// GET - Listar todos os posts (admin)
export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("posts")
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

// POST - Criar novo post
export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const body = await request.json()

    // Gerar slug a partir do título
    const slug = body.slug || body.titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    const { data, error } = await supabase
      .from("posts")
      .insert({
        titulo: body.titulo,
        slug,
        resumo: body.resumo || null,
        conteudo: body.conteudo,
        imagem_capa: body.imagem_capa || null,
        autor: body.autor || "SGC",
        categoria: body.categoria || "Guia de Compra",
        tags: body.tags || [],
        publicado: body.publicado || false,
        destaque: body.destaque || false,
      })
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
