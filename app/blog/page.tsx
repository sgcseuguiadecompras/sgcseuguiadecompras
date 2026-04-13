"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SocialSidebar } from "@/components/social-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Eye, ArrowRight, BookOpen } from "lucide-react"

interface Post {
  id: string
  titulo: string
  slug: string
  resumo: string | null
  imagem_capa: string | null
  autor: string
  categoria: string
  tags: string[] | null
  views: number
  created_at: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const url = categoriaFiltro
          ? `/api/posts?categoria=${encodeURIComponent(categoriaFiltro)}`
          : "/api/posts"
        const res = await fetch(url)
        const data = await res.json()
        if (Array.isArray(data)) {
          setPosts(data)
        }
      } catch {
        console.error("Erro ao carregar posts")
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [categoriaFiltro])

  const categorias = ["Guia de Compra", "Dicas", "Promocoes", "Tecnologia", "Casa e Jardim"]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <SocialSidebar />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-12 md:py-16">
          <div className="container">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold md:text-4xl">Blog e Guias de Compra</h1>
            </div>
            <p className="mt-3 text-lg text-muted-foreground">
              Dicas, tutoriais e guias para ajudar voce a comprar melhor e economizar mais.
            </p>

            {/* Filtros de Categoria */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                variant={categoriaFiltro === null ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoriaFiltro(null)}
              >
                Todos
              </Button>
              {categorias.map((cat) => (
                <Button
                  key={cat}
                  variant={categoriaFiltro === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoriaFiltro(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-8 md:py-12">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardContent className="p-4">
                    <div className="h-4 w-20 rounded bg-muted" />
                    <div className="mt-3 h-6 rounded bg-muted" />
                    <div className="mt-2 h-4 rounded bg-muted" />
                    <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">Nenhum post encontrado</h2>
              <p className="mt-2 text-muted-foreground">
                Em breve teremos conteudo disponivel para voce.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                    {post.imagem_capa ? (
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={post.imagem_capa}
                          alt={post.titulo}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <BookOpen className="h-12 w-12 text-primary/50" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {post.categoria}
                        </Badge>
                      </div>
                      <h3 className="mt-2 line-clamp-2 text-lg font-semibold group-hover:text-primary">
                        {post.titulo}
                      </h3>
                      {post.resumo && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {post.resumo}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.created_at).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views} views
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
                        Ler mais <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
