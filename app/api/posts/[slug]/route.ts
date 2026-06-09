import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET - Buscar post por slug (público)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("publicado", true)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
    }

    // Incrementar views
    await supabase
      .from("posts")
      .update({ views: (data.views || 0) + 1 })
      .eq("id", data.id)

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
