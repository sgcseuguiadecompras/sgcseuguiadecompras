import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

const defaultTema = {
  cor_primaria: "#000000",
  cor_secundaria: "#6B7280",
  cor_destaque: "#10B981",
  cor_fundo: "#FFFFFF",
  cor_texto: "#111827",
  cor_texto_secundario: "#6B7280",
  fonte_padrao: "Inter",
  layout_produtos: "grid",
  border_radius: "0.5rem",
  espacamento: "normal",
  sombras: true,
  animacoes: true,
  modo_escuro: false,
  logo_url: "",
  favicon_url: "",
  banner_url: "",
  meta_titulo: "SGC - Seu Guia de Compras",
  meta_descricao: "Compre melhor, pague menos e evite golpes!",
  google_analytics_id: "",
  facebook_pixel_id: "",
}

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("configuracoes_tema")
    .select("*")
    .limit(1)
    .single()

  if (error) {
    return NextResponse.json(defaultTema)
  }

  return NextResponse.json({ ...defaultTema, ...data })
}

export async function PUT(request: Request) {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_auth")?.value === "authenticated"

  if (!isLoggedIn) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const supabase = await createClient()
  const body = await request.json()

  // Verificar se já existe uma configuração
  const { data: existing } = await supabase
    .from("configuracoes_tema")
    .select("id")
    .limit(1)
    .single()

  const temaData = {
    cor_primaria: body.cor_primaria,
    cor_secundaria: body.cor_secundaria,
    cor_destaque: body.cor_destaque,
    cor_fundo: body.cor_fundo,
    cor_texto: body.cor_texto,
    cor_texto_secundario: body.cor_texto_secundario,
    fonte_padrao: body.fonte_padrao,
    layout_produtos: body.layout_produtos,
    border_radius: body.border_radius,
    espacamento: body.espacamento,
    sombras: body.sombras,
    animacoes: body.animacoes,
    modo_escuro: body.modo_escuro,
    logo_url: body.logo_url || null,
    favicon_url: body.favicon_url || null,
    banner_url: body.banner_url || null,
    meta_titulo: body.meta_titulo,
    meta_descricao: body.meta_descricao,
    google_analytics_id: body.google_analytics_id || null,
    facebook_pixel_id: body.facebook_pixel_id || null,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    const { data, error } = await supabase
      .from("configuracoes_tema")
      .update(temaData)
      .eq("id", existing.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } else {
    const { data, error } = await supabase
      .from("configuracoes_tema")
      .insert(temaData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  }
}
