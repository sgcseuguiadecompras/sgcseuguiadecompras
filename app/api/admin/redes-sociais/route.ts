import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_auth")?.value === "authenticated"

  if (!isLoggedIn) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("redes_sociais")
    .select("*")
    .order("ordem", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_auth")?.value === "authenticated"

  if (!isLoggedIn) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const body = await request.json()

    const { nome, icone, url, posicao, ativo, ordem } = body

    const { data, error } = await supabase
      .from("redes_sociais")
      .insert({
        nome,
        icone,
        url,
        posicao: posicao || "rodape",
        ativo: ativo ?? true,
        ordem: ordem || 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar rede social" }, { status: 500 })
  }
}
