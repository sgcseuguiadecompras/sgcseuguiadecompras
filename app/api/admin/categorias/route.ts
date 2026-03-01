import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "authenticated"
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const supabase = await createClient()
  
  const { data: categorias, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nome", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(categorias)
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const supabase = await createClient()
  const body = await request.json()

  const slug = generateSlug(body.nome)

  const { data, error } = await supabase
    .from("categorias")
    .insert({
      nome: body.nome,
      slug: slug,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
