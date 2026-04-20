import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_auth")?.value === "authenticated"
}

// GET - Listar todas avaliacoes (admin)
export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("avaliacoes")
      .select(`
        *,
        produtos:produto_id (id, nome)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
